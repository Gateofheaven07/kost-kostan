import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const roomSchema = z.object({
  name: z.string().min(1),
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

    const rooms = await prisma.room.findMany({
      include: { prices: true },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(rooms)
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { name, floor, capacity, size, facilities, isAvailable, mainImageUrl, prices } = roomSchema.parse(body)

    // Generate slug
    const slug = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now()

    const room = await prisma.room.create({
      data: {
        kostId: (await prisma.kost.findFirst())?.id || "",
        slug,
        name,
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
      },
      include: { prices: true },
    })

    return NextResponse.json(room, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 })
    }
    return NextResponse.json({ error: "Gagal membuat kamar" }, { status: 500 })
  }
}
