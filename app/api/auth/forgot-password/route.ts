import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/email"
import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: "Email diperlukan" }, { status: 400 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // For security, always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "Jika email terdaftar, kami telah mengirimkan link reset password.",
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // Token expires in 1 hour

    // Invalidate any existing reset tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        used: false,
        expiresAt: { gt: new Date() },
      },
      data: {
        used: true,
      },
    })

    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt,
      },
    })

    // Generate reset link
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const resetLink = `${baseUrl}/auth/reset-password?token=${resetToken}`

    // Send email
    try {
      await sendPasswordResetEmail(user.email, resetLink)
    } catch (emailError) {
      console.error("Error sending password reset email:", emailError)
      // Don't fail the request if email fails (for development)
      // In production, you might want to handle this differently
    }

    return NextResponse.json({
      success: true,
      message: "Jika email terdaftar, kami telah mengirimkan link reset password.",
    })
  } catch (error: any) {
    console.error("Forgot password error:", error)
    
    // Check if it's a Prisma model error (model not found)
    if (error?.message?.includes("updateMany") || error?.message?.includes("create") || error?.message?.includes("Cannot read properties")) {
      console.error("Prisma model error: PasswordResetToken model mungkin belum di-generate. Jalankan: npx prisma generate && npx prisma db push")
      return NextResponse.json(
        { error: "Model database belum di-update. Silakan hubungi administrator." },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: "Terjadi kesalahan. Silakan coba lagi." },
      { status: 500 }
    )
  }
}

