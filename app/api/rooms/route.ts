import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const rooms = await prisma.room.findMany({
      where: { isAvailable: true },
      include: { prices: true, images: true },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(rooms)
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data kamar" }, { status: 500 })
  }
}
