import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const bookings = await prisma.booking.findMany({
      include: { room: true, user: true },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
