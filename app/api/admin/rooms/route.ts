import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { generateRoomId } from "@/lib/utils"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { revalidatePath, revalidateTag } from "next/cache"

// Helper untuk merapikan field facilities yang tersimpan sebagai JSON string berlapis
function formatFacilities(raw: string | null): string {
  if (!raw) return ""

  // Fungsi rekursif untuk menormalisasi berbagai bentuk data menjadi array string
  const flatten = (value: any, depth = 0): string[] => {
    if (depth > 5 || value == null) return []

    // Jika sudah array, proses tiap elemen
    if (Array.isArray(value)) {
      return value.flatMap((item) => flatten(item, depth + 1))
    }

    if (typeof value === "string") {
      const trimmed = value.trim()

      // Jika string terlihat seperti JSON array yang ter-stringify lagi, coba parse lagi
      if (
        (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
        (trimmed.startsWith("\"[") && trimmed.endsWith("]\""))
      ) {
        try {
          const parsed = JSON.parse(trimmed)
          return flatten(parsed, depth + 1)
        } catch {
          // Jika gagal parse, lanjut ke fallback di bawah
        }
      }

      return trimmed ? [trimmed] : []
    }

    // Fallback: convert ke string biasa
    const str = String(value).trim()
    return str ? [str] : []
  }

  try {
    const parsed = JSON.parse(raw)
    const items = flatten(parsed)
    if (items.length > 0) {
      return items.join(", ")
    }
  } catch {
    // Jika raw bukan JSON valid, coba pecah manual berdasarkan koma
    const cleaned = raw
      .replace(/[\[\]\\"']+/g, " ")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    if (cleaned.length > 0) {
      return cleaned.join(", ")
    }
  }

  // Jika semua gagal, kembalikan string asli
  return raw
}

const roomSchema = z.object({
  name: z.string().min(1),
  roomNumber: z.number().positive(),
  floor: z.number().positive(),
  capacity: z.number().positive(),
  size: z.string(),
  facilities: z.string(),
  isAvailable: z.boolean(),
  mainImageUrl: z.string().optional(),
  prices: z.record(z.number()),
})

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const rawRooms = await prisma.room.findMany({
      include: { prices: true },
      orderBy: { createdAt: "desc" },
    })

    // Rapikan field facilities sebelum dikirim ke frontend admin
    const rooms = rawRooms.map((room) => ({
      ...room,
      facilities: formatFacilities(room.facilities as string | null),
    }))

    return NextResponse.json(rooms)
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { name, roomNumber, floor, capacity, size, facilities, isAvailable, mainImageUrl, prices } =
      roomSchema.parse(body)

    // Generate slug & idRoom
    const slug = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now()
    const idRoom = generateRoomId(name, floor, roomNumber)

    const kost = await prisma.kost.findFirst()
    if (!kost) {
      console.error("[admin][rooms][POST] Tidak ada data kost. Harap jalankan inisialisasi database terlebih dahulu.")
      return NextResponse.json(
        { error: "Data kost belum diinisialisasi. Silakan jalankan inisialisasi database terlebih dahulu." },
        { status: 400 },
      )
    }

    const room = await prisma.room.create({
      data: {
        kostId: kost.id,
        slug,
        name,
        idRoom,
        roomNumber,
        floor,
        capacity,
        size,
        facilities: JSON.stringify(facilities.split(",").map((f: string) => f.trim())),
        isAvailable,
        mainImageUrl: mainImageUrl || null,
        prices: {
          create: Object.entries(prices).map(([period, amount]) => ({
            period,
            amount: amount as number,
          })),
        },
      } as any,
      include: { prices: true },
    })

    // Revalidate Next.js cache untuk halaman public
    revalidatePath("/rooms", "page")
    if (room.slug) {
      revalidatePath(`/rooms/${room.slug}`, "page")
    }
    revalidateTag("rooms")
    revalidateTag(`room-${room.id}`)

    return NextResponse.json(room, { 
      status: 201,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    })
  } catch (error) {
    console.error("[admin][rooms][POST] Error saat membuat kamar:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 })
    }

    return NextResponse.json(
      {
        error: "Gagal membuat kamar",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 },
    )
  }
}
