import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6, "Password minimal 6 karakter"),
})

// GET: Validate token
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ valid: false, error: "Token tidak ditemukan" }, { status: 400 })
    }

    // Find valid reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!resetToken) {
      return NextResponse.json({ valid: false, error: "Token tidak valid" }, { status: 400 })
    }

    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, error: "Token sudah kedaluwarsa" }, { status: 400 })
    }

    // Check if token is already used
    if (resetToken.used) {
      return NextResponse.json({ valid: false, error: "Token sudah digunakan" }, { status: 400 })
    }

    return NextResponse.json({
      valid: true,
      email: resetToken.user.email,
    })
  } catch (error) {
    console.error("Reset password validation error:", error)
    return NextResponse.json(
      { valid: false, error: "Terjadi kesalahan saat memvalidasi token" },
      { status: 500 }
    )
  }
}

// POST: Reset password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = resetPasswordSchema.parse(body)

    // Find valid reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!resetToken) {
      return NextResponse.json({ error: "Token tidak valid" }, { status: 400 })
    }

    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: "Token sudah kedaluwarsa" }, { status: 400 })
    }

    // Check if token is already used
    if (resetToken.used) {
      return NextResponse.json({ error: "Token sudah digunakan" }, { status: 400 })
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10)

    // Update user password and mark token as used (in a transaction)
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ])

    // Invalidate all other reset tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: resetToken.userId,
        used: false,
        id: { not: resetToken.id },
      },
      data: {
        used: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Password berhasil diubah",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error("Reset password error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan. Silakan coba lagi." },
      { status: 500 }
    )
  }
}

