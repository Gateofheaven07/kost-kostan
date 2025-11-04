import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Dynamic import for midtrans-client
import midtransClient from "midtrans-client"

// Initialize Midtrans Core API for checking transaction status
const coreApi = new midtransClient.Snap({
  isProduction: false, // Set to false for sandbox
  serverKey: process.env.MIDTRANS_SERVER_KEY || "Mid-server-pCE7eZLvpWJ9JZmpDQy6RbnH",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "Mid-client-6ynAvOYFntPXk6wC",
})

/**
 * Check and Sync All Pending Payments
 * 
 * Endpoint ini digunakan untuk check semua payment yang masih pending
 * dan sync statusnya dari Midtrans ke database.
 * 
 * GET /api/payments/check-status
 */
export async function GET(request: NextRequest) {

  
  // try {
  //   // Find all pending payments
  //   const pendingPayments = await prisma.payment.findMany({
  //     where: {
  //       status: "pending",
  //     },
  //     include: {
  //       booking: true,
  //     },
  //     orderBy: {
  //       createdAt: "desc",
  //     },
  //   })

  //   console.log(`[Check Status] Found ${pendingPayments.length} pending payments`)

  //   const results = []

  //   // Check each payment status from Midtrans
  //   for (const payment of pendingPayments) {
  //     try {
  //       console.log(`[Check Status] Checking payment: ${payment.id}, orderId: ${payment.orderId}`)

  //       // Check transaction status from Midtrans API
  //       const response = await coreApi.charge.status(payment.orderId)
  //       const transactionStatus = response.transaction_status

  //       console.log(`[Check Status] Midtrans status for ${payment.orderId}:`, {
  //         currentDbStatus: payment.status,
  //         midtransStatus: transactionStatus,
  //         statusCode: response.status_code,
  //       })

  //       // If status changed, update database
  //       if (transactionStatus !== payment.status) {
  //         // Update payment status
  //         const updatedPayment = await prisma.payment.update({
  //           where: { id: payment.id },
  //           data: { status: transactionStatus },
  //         })

  //         // Update booking status if payment is settled
  //         let bookingStatusUpdated = false
  //         if (transactionStatus === "settlement" || transactionStatus === "capture") {
  //           if (payment.booking.status !== "CONFIRMED") {
  //             await prisma.booking.update({
  //               where: { id: payment.bookingId },
  //               data: { status: "CONFIRMED" },
  //             })
  //             bookingStatusUpdated = true
  //             console.log(`[Check Status] ✅ Booking ${payment.bookingId} confirmed`)
  //           }
  //         } else if (
  //           transactionStatus === "cancel" ||
  //           transactionStatus === "expire" ||
  //           transactionStatus === "deny"
  //         ) {
  //           if (payment.booking.status !== "CANCELLED") {
  //             await prisma.booking.update({
  //               where: { id: payment.bookingId },
  //               data: { status: "CANCELLED" },
  //             })
  //             bookingStatusUpdated = true
  //             console.log(`[Check Status] ❌ Booking ${payment.bookingId} cancelled`)
  //           }
  //         }

  //         results.push({
  //           paymentId: payment.id,
  //           orderId: payment.orderId,
  //           oldStatus: payment.status,
  //           newStatus: transactionStatus,
  //           bookingStatusUpdated,
  //           success: true,
  //         })
  //       } else {
  //         results.push({
  //           paymentId: payment.id,
  //           orderId: payment.orderId,
  //           status: payment.status,
  //           success: true,
  //           message: "Status masih sama",
  //         })
  //       }
  //     } catch (error: any) {
  //       console.error(`[Check Status] Error checking payment ${payment.id}:`, error.message)
  //       results.push({
  //         paymentId: payment.id,
  //         orderId: payment.orderId,
  //         success: false,
  //         error: error.message,
  //       })
  //     }
  //   }

  //   return NextResponse.json({
  //     success: true,
  //     message: `Checked ${pendingPayments.length} pending payments`,
  //     results,
  //   })
  // } catch (error: any) {
  //   console.error("[Check Status] Error checking payment status:", error)
  //   return NextResponse.json(
  //     {
  //       error: "Gagal check status payment",
  //       message: error.message || "Internal server error",
  //     },
  //     { status: 500 }
  //   )
  // }
}

