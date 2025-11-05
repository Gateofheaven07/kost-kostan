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

    // Check if there are active CONFIRMED bookings when admin tries to make room available
    let hasActiveBookings = false
    let activeBookingCount = 0
    if (isAvailable) {
      const activeBookings = await prisma.booking.findMany({
        where: {
          roomId: id,
          status: "CONFIRMED",
          endDate: {
            gte: new Date(), // Only active bookings (not expired)
          },
        },
        select: {
          id: true,
        },
      })
      activeBookingCount = activeBookings.length
      hasActiveBookings = activeBookings.length > 0
      
      // If admin wants to make room available but there are active bookings,
      // we should cancel those bookings first to avoid sync conflicts
      if (hasActiveBookings) {
        await prisma.booking.updateMany({
          where: {
            id: {
              in: activeBookings.map((b) => b.id),
            },
          },
          data: {
            status: "CANCELLED",
          },
        })
        console.log(`[Admin Update Room] Cancelled ${activeBookingCount} active CONFIRMED bookings for room ${id}`)
      }
    }

    // Admin can now safely update the room status
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

    return NextResponse.json({
      ...updatedRoom,
      message: hasActiveBookings
        ? `${activeBookingCount} booking CONFIRMED aktif telah dibatalkan otomatis untuk mengubah status kamar menjadi tersedia`
        : "Kamar berhasil diperbarui",
    })
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
