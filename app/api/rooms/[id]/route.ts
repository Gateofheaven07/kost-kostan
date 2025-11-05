import { prisma } from "@/lib/prisma"
import { syncRoomAvailability } from "@/lib/sync-room-availability"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Sync room availability first to ensure accurate status
    await syncRoomAvailability()

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
    return NextResponse.json({ error: "Gagal mengambil data kamar" }, { status: 500 })
  }
}
