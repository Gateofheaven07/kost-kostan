import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params

    const room = await prisma.room.findUnique({
      where: { id },
      include: { prices: true },
    })

    if (!room) {
      return NextResponse.json({ error: "Kamar tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json(room)
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params

    const body = await request.json()
    const { name, floor, capacity, size, facilities, isAvailable, mainImageUrl, prices } = body

    await prisma.room.update({
      where: { id },
      data: {
        name,
        floor,
        capacity,
        size,
        facilities: JSON.stringify(facilities.split(",").map((f: string) => f.trim())),
        isAvailable,
        mainImageUrl: mainImageUrl || null,
      },
    })

    // Update prices
    for (const [period, amount] of Object.entries(prices)) {
      await prisma.price.upsert({
        where: { roomId_period: { roomId: id, period } },
        update: { amount: amount as number },
        create: { roomId: id, period, amount: amount as number },
      })
    }

    const updatedRoom = await prisma.room.findUnique({
      where: { id },
      include: { prices: true },
    })

    return NextResponse.json(updatedRoom)
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui kamar" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params

    await prisma.room.delete({ where: { id } })

    return NextResponse.json({ message: "Kamar berhasil dihapus" })
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus kamar" }, { status: 500 })
  }
}
