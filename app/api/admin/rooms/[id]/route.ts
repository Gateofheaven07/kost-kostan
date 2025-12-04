import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { generateRoomId } from "@/lib/utils"
import { type NextRequest, NextResponse } from "next/server"
import { revalidatePath, revalidateTag } from "next/cache"

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
    const { name, floor, roomNumber, capacity, size, facilities, isAvailable, mainImageUrl, prices } = body

    // Validate required fields
    if (!name || !floor || !capacity || !size || !roomNumber) {
      return NextResponse.json(
        { error: "Nama, nomor kamar, lantai, kapasitas, dan ukuran harus diisi" },
        { status: 400 }
      )
    }

    // Validate prices
    if (!prices || typeof prices !== "object") {
      return NextResponse.json(
        { error: "Harga harus diisi" },
        { status: 400 }
      )
    }

    // Process facilities - handle both string and array
    let facilitiesArray: string[] = []
    if (facilities) {
      if (typeof facilities === "string") {
        // Split by comma and trim
        facilitiesArray = facilities.split(",").map((f: string) => f.trim()).filter((f: string) => f !== "")
      } else if (Array.isArray(facilities)) {
        facilitiesArray = facilities.map((f: any) => String(f).trim()).filter((f: string) => f !== "")
      }
    }

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
    const idRoom = generateRoomId(name, Number(floor), Number(roomNumber))

    await prisma.room.update({
      where: { id },
      data: {
        name,
        floor: Number(floor),
        roomNumber: Number(roomNumber),
        idRoom,
        capacity: Number(capacity),
        size,
        facilities: JSON.stringify(facilitiesArray),
        isAvailable: Boolean(isAvailable),
        mainImageUrl: mainImageUrl || null,
      },
    })

    // Update prices
    for (const [period, amount] of Object.entries(prices)) {
      const priceAmount = Number(amount)
      if (!isNaN(priceAmount) && priceAmount >= 0) {
        await prisma.price.upsert({
          where: { roomId_period: { roomId: id, period } },
          update: { amount: priceAmount },
          create: { roomId: id, period, amount: priceAmount },
        })
      }
    }

    const updatedRoom = await prisma.room.findUnique({
      where: { id },
      include: { prices: true },
    })

    if (!updatedRoom) {
      return NextResponse.json({ error: "Kamar tidak ditemukan setelah update" }, { status: 404 })
    }

    // Revalidate Next.js cache untuk halaman public
    revalidatePath("/rooms", "page")
    revalidatePath(`/rooms/${updatedRoom.slug}`, "page")
    revalidateTag("rooms")
    revalidateTag(`room-${updatedRoom.id}`)

    return NextResponse.json({
      ...updatedRoom,
      message: hasActiveBookings
        ? `${activeBookingCount} booking CONFIRMED aktif telah dibatalkan otomatis untuk mengubah status kamar menjadi tersedia`
        : "Kamar berhasil diperbarui",
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    })
  } catch (error: any) {
    console.error("Error updating room:", error)
    return NextResponse.json(
      { 
        error: error.message || "Gagal memperbarui kamar",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params

    const room = await prisma.room.findUnique({ where: { id }, select: { slug: true } })
    
    await prisma.room.delete({ where: { id } })

    // Revalidate Next.js cache untuk halaman public
    revalidatePath("/rooms", "page")
    if (room?.slug) {
      revalidatePath(`/rooms/${room.slug}`, "page")
    }
    revalidateTag("rooms")

    return NextResponse.json({ message: "Kamar berhasil dihapus" }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus kamar" }, { status: 500 })
  }
}
