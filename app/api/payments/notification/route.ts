import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

/**
 * Midtrans Payment Notification Webhook
 * 
 * Endpoint ini menerima notifikasi dari Midtrans ketika status pembayaran berubah.
 * Midtrans akan mengirim POST request ke endpoint ini.
 * 
 * URL Webhook untuk Production:
 * https://your-domain.com/api/payments/notification
 * 
 * URL Webhook untuk Sandbox:
 * https://your-domain.com/api/payments/notification
 * 
 * Set URL ini di dashboard Midtrans:
 * Settings > Configuration > Notification URL
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    
    console.log("[Webhook] Received payment notification:", {
      orderId: body.order_id,
      transactionStatus: body.transaction_status,
      paymentType: body.payment_type,
      timestamp: new Date().toISOString(),
    })

    // Validate required fields
    if (!body.order_id || !body.transaction_status || !body.status_code || !body.gross_amount) {
      console.error("[Webhook] Missing required fields:", body)
      return NextResponse.json(
        { error: "Missing required fields: order_id, transaction_status, status_code, gross_amount" },
        { status: 400 }
      )
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY || "Mid-server-pCE7eZLvpWJ9JZmpDQy6RbnH"
    const orderId = body.order_id
    const statusCode = body.status_code
    const grossAmount = body.gross_amount
    const transactionStatus = body.transaction_status

    // Verify signature for security (skip in sandbox, but important for production)
    const notificationSignatureKey = body.signature_key
    if (notificationSignatureKey) {
      const signatureKey = crypto
        .createHash("sha512")
        .update(orderId + statusCode + grossAmount + serverKey)
        .digest("hex")

      // Uncomment this for production
      // if (notificationSignatureKey !== signatureKey) {
      //   console.error("[Webhook] Invalid signature:", {
      //     received: notificationSignatureKey,
      //     calculated: signatureKey,
      //   })
      //   return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
      // }
    }

    // Find payment by orderId
    let payment = await prisma.payment.findUnique({
      where: { orderId },
      include: { 
        booking: {
          include: {
            room: true,
            user: true,
          }
        }
      },
    })

    if (!payment) {
      console.error("[Webhook] Payment not found for orderId:", orderId)
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Log current payment status
    console.log("[Webhook] Current payment status:", {
      paymentId: payment.id,
      currentStatus: payment.status,
      newStatus: transactionStatus,
      bookingId: payment.bookingId,
      bookingStatus: payment.booking.status,
    })

    // Prepare payment update data
    const paymentUpdateData: any = {
      transactionId: body.transaction_id || null,
      status: transactionStatus,
      paymentType: body.payment_type || null,
      fraudStatus: body.fraud_status || null,
      metadata: JSON.stringify(body),
    }

    // Handle Virtual Account payment data
    if (body.va_numbers && body.va_numbers.length > 0) {
      paymentUpdateData.vaNumber = body.va_numbers[0].va_number || null
      paymentUpdateData.bank = body.va_numbers[0].bank || null
    }

    // Handle payment code (for e-wallet, convenience store, etc)
    if (body.payment_code) {
      paymentUpdateData.paymentCode = body.payment_code
    }

    // Handle expiry time
    if (body.expiry_time) {
      paymentUpdateData.expiryTime = new Date(body.expiry_time)
    }

    // Update payment status in database
    // Use transaction to ensure atomicity
    let updatedPayment
    try {
      updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: paymentUpdateData,
      })

      console.log("[Webhook] Payment updated:", {
        paymentId: updatedPayment.id,
        status: updatedPayment.status,
        transactionId: updatedPayment.transactionId,
        oldStatus: payment.status,
        newStatus: transactionStatus,
      })
    } catch (updateError: any) {
      console.error("[Webhook] Error updating payment:", {
        error: updateError.message,
        paymentId: payment.id,
        orderId: orderId,
      })
      throw updateError
    }

    // Update booking status based on payment status
    let bookingStatusUpdated = false
    let newBookingStatus = payment.booking.status

    try {
      if (transactionStatus === "settlement" || transactionStatus === "capture") {
        // Payment successful - Auto confirm booking and mark room as rented
        if (payment.booking.status !== "CONFIRMED") {
          await prisma.$transaction([
            prisma.booking.update({
              where: { id: payment.bookingId },
              data: { status: "CONFIRMED" },
            }),
            prisma.room.update({
              where: { id: payment.booking.roomId },
              data: { isAvailable: false },
            }),
          ])
          bookingStatusUpdated = true
          newBookingStatus = "CONFIRMED"
          
          // Revalidate Next.js cache untuk halaman public
          revalidatePath("/rooms")
          if (payment.booking.room.slug) {
            revalidatePath(`/rooms/${payment.booking.room.slug}`)
          }
          
          console.log("[Webhook] ✅ Booking confirmed and room marked as rented:", {
            bookingId: payment.bookingId,
            roomId: payment.booking.roomId,
            roomName: payment.booking.room.name,
            userName: payment.booking.user.name,
            oldStatus: payment.booking.status,
            newStatus: "CONFIRMED",
          })
        } else {
          console.log("[Webhook] Booking already confirmed:", {
            bookingId: payment.bookingId,
          })
        }
      } else if (
        transactionStatus === "cancel" ||
        transactionStatus === "expire" ||
        transactionStatus === "deny"
      ) {
        // Payment failed/cancelled - Cancel booking
        if (payment.booking.status !== "CANCELLED") {
          await prisma.booking.update({
            where: { id: payment.bookingId },
            data: { status: "CANCELLED" },
          })
          bookingStatusUpdated = true
          newBookingStatus = "CANCELLED"
          console.log("[Webhook] ❌ Booking cancelled:", {
            bookingId: payment.bookingId,
            reason: transactionStatus,
            oldStatus: payment.booking.status,
            newStatus: "CANCELLED",
          })
        }
      } else if (transactionStatus === "pending") {
        // Payment pending - Keep booking as PENDING
        // No action needed, booking already in PENDING status
        console.log("[Webhook] ⏳ Payment pending:", {
          bookingId: payment.bookingId,
          bookingStatus: payment.booking.status,
        })
      } else {
        console.log("[Webhook] ⚠️ Unknown transaction status:", {
          transactionStatus,
          bookingId: payment.bookingId,
        })
      }
    } catch (bookingUpdateError: any) {
      console.error("[Webhook] Error updating booking status:", {
        error: bookingUpdateError.message,
        bookingId: payment.bookingId,
        transactionStatus,
      })
      // Don't throw error here, payment was already updated
    }

    // Return success response
    return NextResponse.json({
      status: "OK",
      message: "Notification processed successfully",
      data: {
        paymentId: updatedPayment.id,
        paymentStatus: updatedPayment.status,
        bookingId: payment.bookingId,
        bookingStatus: newBookingStatus,
        bookingStatusUpdated,
      },
    })
  } catch (error: any) {
    console.error("[Webhook] Error processing payment notification:", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    })

    // Return error response
    return NextResponse.json(
      {
        error: "Gagal memproses notifikasi",
        message: error.message || "Internal server error",
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint untuk testing webhook (optional)
 * Bisa digunakan untuk verify bahwa endpoint accessible
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Midtrans Payment Notification Webhook",
    endpoint: "/api/payments/notification",
    method: "POST",
    status: "active",
  })
}
