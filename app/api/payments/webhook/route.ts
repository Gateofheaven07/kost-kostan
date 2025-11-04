import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validasi data webhook
    if (!data.order_id) {
      console.error("[Webhook] Missing order_id in webhook data")
      return NextResponse.json(
        { error: "order_id is required" },
        { status: 400 }
      )
    }

    if (!data.transaction_status) {
      console.error("[Webhook] Missing transaction_status in webhook data")
      return NextResponse.json(
        { error: "transaction_status is required" },
        { status: 400 }
      )
    }

    const {
      order_id,
      transaction_status,
      transaction_id,
      payment_type,
      fraud_status,
      gross_amount,
      expiry_time,
    } = data

    console.log(`[Webhook] Processing webhook for order_id: ${order_id}`)
    console.log(`[Webhook] Transaction status: ${transaction_status}`)

    // Cari payment berdasarkan order_id
    const payment = await prisma.payment.findUnique({
      where: { orderId: order_id },
      include: { booking: true },
    })

    if (!payment) {
      console.error(`[Webhook] Payment not found for order_id: ${order_id}`)
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      )
    }

    // Mapping transaction_status ke status payment
    // Status yang valid: "pending", "settlement", "cancel", "expire", "deny"
    let paymentStatus = transaction_status.toLowerCase()

    // Validasi status
    const validStatuses = ["pending", "settlement", "cancel", "expire", "deny", "capture"]
    if (!validStatuses.includes(paymentStatus)) {
      // Jika status tidak valid, gunakan "pending" sebagai default
      console.warn(`[Webhook] Invalid transaction_status: ${transaction_status}, using "pending"`)
      paymentStatus = "pending"
    }

    // Normalisasi status "capture" menjadi "settlement"
    if (paymentStatus === "capture") {
      paymentStatus = "settlement"
    }

    // Update status payment
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: paymentStatus,
        transactionId: transaction_id || payment.transactionId,
        paymentType: payment_type || payment.paymentType,
        fraudStatus: fraud_status || payment.fraudStatus,
        ...(expiry_time && {
          expiryTime: new Date(expiry_time),
        }),
      },
    })

    console.log(`[Webhook] Payment status updated: ${payment.status} -> ${paymentStatus}`)

    // Update booking status jika payment sudah settlement
    if (paymentStatus === "settlement" && payment.booking.status !== "CONFIRMED") {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: "CONFIRMED" },
      })
      console.log(`[Webhook] Booking ${payment.bookingId} confirmed`)
    }

    // Update booking status jika payment dibatalkan/expired/deny
    if (
      (paymentStatus === "cancel" ||
        paymentStatus === "expire" ||
        paymentStatus === "deny") &&
      payment.booking.status !== "CANCELLED"
    ) {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: "CANCELLED" },
      })
      console.log(`[Webhook] Booking ${payment.bookingId} cancelled`)
    }

    return NextResponse.json({
      success: true,
      message: "Payment status updated successfully",
      orderId: order_id,
      status: paymentStatus,
    })
  } catch (error: any) {
    console.error("[Webhook] Error processing webhook:", error)
    return NextResponse.json(
      {
        error: "Failed to process webhook",
        message: error.message || "Internal server error",
      },
      { status: 500 }
    )
  }
}