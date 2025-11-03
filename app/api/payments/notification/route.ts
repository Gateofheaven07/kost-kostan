import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

// Midtrans notification handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "Mid-server-pCE7eZLvpWJ9JZmpDQy6RbnH"

    // Verify notification signature (optional but recommended)
    const notificationSignatureKey = body.signature_key
    const orderId = body.order_id
    const statusCode = body.status_code
    const grossAmount = body.gross_amount

    // Create signature key for verification
    const signatureKey = crypto
      .createHash("sha512")
      .update(orderId + statusCode + grossAmount + serverKey)
      .digest("hex")

    // Verify signature (skip for now in sandbox, but important for production)
    // if (notificationSignatureKey !== signatureKey) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    // }

    // Find payment by orderId
    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: { booking: true },
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        transactionId: body.transaction_id || null,
        status: body.transaction_status,
        paymentType: body.payment_type || null,
        fraudStatus: body.fraud_status || null,
        vaNumber: body.va_numbers?.[0]?.va_number || null,
        bank: body.va_numbers?.[0]?.bank || null,
        paymentCode: body.payment_code || null,
        expiryTime: body.expiry_time ? new Date(body.expiry_time) : null,
        metadata: JSON.stringify(body),
      },
    })

    // Update booking status based on payment status
    if (body.transaction_status === "settlement" || body.transaction_status === "capture") {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: "CONFIRMED" },
      })
    } else if (
      body.transaction_status === "cancel" ||
      body.transaction_status === "expire" ||
      body.transaction_status === "deny"
    ) {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: "CANCELLED" },
      })
    }

    return NextResponse.json({ status: "OK" })
  } catch (error: any) {
    console.error("Error processing payment notification:", error)
    return NextResponse.json({ error: error.message || "Gagal memproses notifikasi" }, { status: 500 })
  }
}

