import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Dynamic import for midtrans-client
const midtransClient = require("midtrans-client")

// Initialize Midtrans Core API for checking transaction status
const coreApi = new midtransClient.CoreApi({
  isProduction: false, // Set to false for sandbox
  serverKey: process.env.MIDTRANS_SERVER_KEY || "Mid-server-pCE7eZLvpWJ9JZmpDQy6RbnH",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "Mid-client-6ynAvOYFntPXk6wC",
})

/**
 * Sync Payment Status from Midtrans
 * 
 * Endpoint ini digunakan untuk secara manual sync status payment dari Midtrans
 * ke database. Berguna jika webhook tidak dipanggil atau ada masalah.
 * 
 * POST /api/payments/sync-status
 * Body: { "orderId": "ORDER-xxx" } atau { "paymentId": "payment-id" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, paymentId } = body

    if (!orderId && !paymentId) {
      return NextResponse.json(
        { error: "orderId atau paymentId harus diisi" },
        { status: 400 }
      )
    }

    // Find payment record
    let payment
    if (paymentId) {
      payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          booking: {
            include: {
              room: true,
              user: true,
            },
          },
        },
      })
    } else if (orderId) {
      payment = await prisma.payment.findUnique({
        where: { orderId },
        include: {
          booking: {
            include: {
              room: true,
              user: true,
            },
          },
        },
      })
    }

    if (!payment) {
      return NextResponse.json(
        { error: "Payment tidak ditemukan" },
        { status: 404 }
      )
    }

    console.log("[Sync Status] Checking payment status from Midtrans:", {
      paymentId: payment.id,
      orderId: payment.orderId,
      currentStatus: payment.status,
    })

    // Check transaction status from Midtrans API
    let transactionStatus
    try {
      const response = await coreApi.transaction.status(payment.orderId)
      transactionStatus = response.transaction_status
      
      console.log("[Sync Status] Midtrans response:", {
        orderId: payment.orderId,
        transactionStatus: response.transaction_status,
        statusCode: response.status_code,
        paymentType: response.payment_type,
      })
    } catch (error: any) {
      console.error("[Sync Status] Error checking Midtrans status:", error)
      return NextResponse.json(
        { error: "Gagal mengambil status dari Midtrans", message: error.message },
        { status: 500 }
      )
    }

    // Prepare payment update data
    const paymentUpdateData: any = {
      status: transactionStatus,
    }

    // Update payment status in database
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: paymentUpdateData,
    })

    console.log("[Sync Status] Payment updated:", {
      paymentId: updatedPayment.id,
      status: updatedPayment.status,
    })

    // Update booking status based on payment status
    let bookingStatusUpdated = false
    let newBookingStatus = payment.booking.status

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
        console.log("[Sync Status] Booking confirmed and room marked as rented:", {
          bookingId: payment.bookingId,
          roomId: payment.booking.roomId,
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
        console.log("[Sync Status] Booking cancelled:", {
          bookingId: payment.bookingId,
          reason: transactionStatus,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Status payment berhasil di-sync",
      data: {
        paymentId: updatedPayment.id,
        paymentStatus: updatedPayment.status,
        bookingId: payment.bookingId,
        bookingStatus: newBookingStatus,
        bookingStatusUpdated,
      },
    })
  } catch (error: any) {
    console.error("[Sync Status] Error syncing payment status:", {
      error: error.message,
      stack: error.stack,
    })

    return NextResponse.json(
      {
        error: "Gagal sync status payment",
        message: error.message || "Internal server error",
      },
      { status: 500 }
    )
  }
}

