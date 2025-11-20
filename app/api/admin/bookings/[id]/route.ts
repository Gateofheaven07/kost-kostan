import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"
import { revalidatePath, revalidateTag } from "next/cache"

// PATCH: update status booking
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
      revalidatePath("/rooms", "page")
      if (updatedBooking.room.slug) {
        revalidatePath(`/rooms/${updatedBooking.room.slug}`, "page")
      }
      revalidateTag("rooms")
      revalidateTag(`room-${updatedBooking.room.id}`)
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

// DELETE: hapus booking (riwayat)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params

    // Ambil booking beserta kamar terkait
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { room: true },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 })
    }

    // Hapus booking terlebih dahulu
    await prisma.booking.delete({ where: { id } })

    // Setelah dihapus, cek apakah masih ada booking CONFIRMED lain untuk kamar ini
    if (booking.room) {
      const activeBookings = await prisma.booking.count({
        where: {
          roomId: booking.roomId,
          status: "CONFIRMED",
        },
      })

      // Jika tidak ada booking CONFIRMED lain, tandai kamar sebagai tersedia
      if (activeBookings === 0 && !booking.room.isAvailable) {
        await prisma.room.update({
          where: { id: booking.roomId },
          data: { isAvailable: true },
        })
      }

      // Revalidate halaman publik
      revalidatePath("/rooms", "page")
      if (booking.room.slug) {
        revalidatePath(`/rooms/${booking.room.slug}`, "page")
      }
      revalidateTag("rooms")
      revalidateTag(`room-${booking.room.id}`)
    }

    return NextResponse.json(
      { message: "Booking berhasil dihapus" },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    )
  } catch (error) {
    console.error("Error deleting booking:", error)
    return NextResponse.json({ error: "Gagal menghapus booking" }, { status: 500 })
  }
}
