import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password minimal 6 karakter"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, password } = registerSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash,
        role: "USER",
      },
    })

    return NextResponse.json(
      { message: "Registrasi berhasil", user: { id: user.id, email: user.email } },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Registration error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 })
  }
}
