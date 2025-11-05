import { prisma } from "@/lib/prisma"
import { syncRoomAvailability } from "@/lib/sync-room-availability"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Sync room availability based on CONFIRMED bookings
    await syncRoomAvailability()

    // Tampilkan semua kamar (termasuk yang tersewa) agar user bisa melihat status
    const rooms = await prisma.room.findMany({
      include: { prices: true, images: true },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(rooms)
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data kamar" }, { status: 500 })
  }
}
