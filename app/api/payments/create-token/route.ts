import { getSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// Dynamic import for midtrans-client to avoid type issues
const midtransClient = require("midtrans-client")

// Initialize Snap API instance
const snap = new midtransClient.Snap({
  isProduction: false, // Set to false for sandbox
  serverKey: process.env.MIDTRANS_SERVER_KEY || "Mid-server-pCE7eZLvpWJ9JZmpDQy6RbnH",
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId } = body

    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 })
    }

    // Get booking with user and room details
    // Add retry logic for connection issues
    let booking
    try {
      booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: true,
          room: true,
        },
      })
    } catch (dbError: any) {
      console.error("Database connection error:", dbError)
      // Try to reconnect
      try {
        await prisma.$connect()
        booking = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: {
            user: true,
            room: true,
          },
        })
      } catch (retryError: any) {
        return NextResponse.json(
          { error: "Database connection error. Please try again." },
          { status: 503 }
        )
      }
    }

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (booking.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check if payment already exists
    let payment = null
    try {
      payment = await prisma.payment.findUnique({
        where: { bookingId },
      })
    } catch (error: any) {
      // If Payment model doesn't exist yet or connection issue, payment will be null
      console.log("Payment model check:", error.message)
      // Try reconnect if connection error
      if (error.message?.includes("connection") || error.message?.includes("closed")) {
        try {
          await prisma.$connect()
          payment = await prisma.payment.findUnique({
            where: { bookingId },
          })
        } catch (retryError) {
          console.error("Payment check retry failed:", retryError)
        }
      }
    }

    const orderId = `ORDER-${bookingId}-${Date.now()}`

    // Prepare parameter for Midtrans
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: booking.totalPrice,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: booking.user.name.split(" ")[0] || booking.user.name,
        last_name: booking.user.name.split(" ").slice(1).join(" ") || "",
        email: booking.user.email,
        phone: booking.user.phone || "",
      },
      item_details: [
        {
          id: booking.roomId,
          price: booking.totalPrice,
          quantity: 1,
          name: `Sewa ${booking.room.name} - ${booking.period}`,
        },
      ],
    }

    // Create transaction token from Midtrans
    const transaction = await snap.createTransaction(parameter)
    const transactionToken = transaction.token

    // Create or update payment record
    try {
      if (payment) {
        payment = await prisma.payment.update({
          where: { id: payment.id },
          data: {
            orderId,
            grossAmount: booking.totalPrice,
            token: transactionToken,
            snapToken: transactionToken,
            status: "pending",
          },
        })
      } else {
        payment = await prisma.payment.create({
          data: {
            bookingId: booking.id,
            orderId,
            grossAmount: booking.totalPrice,
            token: transactionToken,
            snapToken: transactionToken,
            status: "pending",
          },
        })

        // Update booking with paymentId
        await prisma.booking.update({
          where: { id: bookingId },
          data: { paymentId: payment.id },
        })
      }
    } catch (error: any) {
      console.error("Error creating/updating payment:", error)
      
      // Try reconnect and retry once
      if (error.message?.includes("connection") || error.message?.includes("closed")) {
        try {
          await prisma.$connect()
          if (payment) {
            payment = await prisma.payment.update({
              where: { id: payment.id },
              data: {
                orderId,
                grossAmount: booking.totalPrice,
                token: transactionToken,
                snapToken: transactionToken,
                status: "pending",
              },
            })
          } else {
            payment = await prisma.payment.create({
              data: {
                bookingId: booking.id,
                orderId,
                grossAmount: booking.totalPrice,
                token: transactionToken,
                snapToken: transactionToken,
                status: "pending",
              },
            })
            await prisma.booking.update({
              where: { id: bookingId },
              data: { paymentId: payment.id },
            })
          }
        } catch (retryError: any) {
          console.error("Payment retry failed:", retryError)
          // If Payment model is not available, return token anyway
          return NextResponse.json({
            token: transactionToken,
            orderId,
            paymentId: null,
            warning: "Payment record not saved - Database connection issue",
          })
        }
      } else {
        // If Payment model is not available, return token anyway
        return NextResponse.json({
          token: transactionToken,
          orderId,
          paymentId: null,
          warning: "Payment record not saved - Please check Prisma Client",
        })
      }
    }

    return NextResponse.json({
      token: transactionToken,
      orderId: payment?.orderId || orderId,
      paymentId: payment?.id || null,
    })
  } catch (error: any) {
    console.error("Error creating payment token:", error)
    
    // Better error messages
    let errorMessage = "Gagal membuat token pembayaran"
    let statusCode = 500
    
    if (error.message?.includes("connection") || error.message?.includes("closed")) {
      errorMessage = "Koneksi database bermasalah. Silakan coba lagi dalam beberapa saat."
      statusCode = 503
    } else if (error.message?.includes("findUnique")) {
      errorMessage = "Model Payment belum tersedia. Pastikan Prisma Client sudah di-regenerate dengan menjalankan: npx prisma generate"
      statusCode = 500
    } else if (error.message) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}

