import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const owner = await prisma.owner.findFirst()

    if (!owner) {
      return NextResponse.json({ error: "Pemilik tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json({
      ...owner,
      socials: JSON.parse(owner.socials || "{}"),
    })
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()

    const owner = await prisma.owner.updateMany({
      data: {
        name: body.name,
        photoUrl: body.photoUrl,
        bio: body.bio,
        phone: body.phone,
        email: body.email,
        socials: JSON.stringify(body.socials),
      },
    })

    return NextResponse.json({ message: "Pengaturan pemilik berhasil disimpan" })
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan pengaturan" }, { status: 500 })
  }
}
