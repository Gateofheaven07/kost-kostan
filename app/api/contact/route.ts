import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // Save message to database
    await prisma.message.create({
      data: {
        name,
        email,
        subject,
        message,
      },
    })

    // Log to console (in production, send to email service)
    console.log("[Contact Form]", { name, email, subject, message, timestamp: new Date() })

    return NextResponse.json({ message: "Pesan berhasil dikirim" }, { status: 200 })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "Gagal mengirim pesan" }, { status: 500 })
  }
}
