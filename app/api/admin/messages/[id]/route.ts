import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    await prisma.message.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Pesan berhasil dihapus" })
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus pesan" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await request.json()

    const message = await prisma.message.update({
      where: { id },
      data: body,
    })

    return NextResponse.json(message)
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengupdate pesan" }, { status: 500 })
  }
}

