import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params

    const body = await request.json()
    const { status } = body

    // Get booking with room info
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { room: true },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 })
    }

    // Update booking status and room availability
    if (status === "CONFIRMED") {
      // Mark room as rented when booking is confirmed
      await prisma.$transaction([
        prisma.booking.update({
          where: { id },
          data: { status },
        }),
        prisma.room.update({
          where: { id: booking.roomId },
          data: { isAvailable: false },
        }),
      ])
    } else if (status === "CANCELLED" || status === "PENDING") {
      // When booking is cancelled or pending, room status depends on other active bookings
      // Check if there are other confirmed bookings for this room
      const activeBookings = await prisma.booking.count({
        where: {
          roomId: booking.roomId,
          status: "CONFIRMED",
          id: { not: id }, // Exclude current booking
        },
      })

      // Only make room available if no other confirmed bookings exist
      await prisma.$transaction([
        prisma.booking.update({
          where: { id },
          data: { status },
        }),
        prisma.room.update({
          where: { id: booking.roomId },
          data: { isAvailable: activeBookings === 0 },
        }),
      ])
    } else {
      // For other status, just update booking
      await prisma.booking.update({
        where: { id },
        data: { status },
      })
    }

    const updatedBooking = await prisma.booking.findUnique({
      where: { id },
      include: { room: true },
    })

    // Revalidate Next.js cache untuk halaman public ketika room status berubah
    if (updatedBooking?.room) {
      revalidatePath("/rooms")
      if (updatedBooking.room.slug) {
        revalidatePath(`/rooms/${updatedBooking.room.slug}`)
      }
    }

    return NextResponse.json(updatedBooking, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    })
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ error: "Gagal memperbarui booking" }, { status: 500 })
  }
}
