import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const kost = await prisma.kost.findFirst()

    if (!kost) {
      return NextResponse.json({ error: "Kost tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json({
      ...kost,
      facilities: JSON.parse(kost.facilities || "[]"),
    })
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()

    const kost = await prisma.kost.updateMany({
      data: {
        name: body.name,
        address: body.address,
        city: body.city,
        description: body.description,
        rules: body.rules,
        facilities: JSON.stringify(body.facilities),
        contactPhone: body.contactPhone,
        contactWhatsApp: body.contactWhatsApp,
        email: body.email,
      },
    })

    return NextResponse.json({ message: "Pengaturan kost berhasil disimpan" })
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan pengaturan" }, { status: 500 })
  }
}
