import { prisma } from "@/lib/prisma"
import { syncRoomAvailability } from "@/lib/sync-room-availability"
import { type NextRequest, NextResponse } from "next/server"
import { unstable_noStore as noStore } from "next/cache"

export async function GET(request: NextRequest) {
  // Disable caching for this route
  noStore()
  
  try {
    // Sync room availability based on CONFIRMED bookings
    await syncRoomAvailability()

    // Tampilkan semua kamar (termasuk yang tersewa) agar user bisa melihat status
    const rooms = await prisma.room.findMany({
      include: { prices: true, images: true },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(rooms, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data kamar" }, { status: 500 })
  }
}
