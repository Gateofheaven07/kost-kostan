import { getSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const bookingSchema = z.object({
  roomId: z.string(),
  period: z.enum(["WEEK", "MONTH", "3MO", "6MO", "12MO"]),
  startDate: z.string(),
  endDate: z.string(),
  totalPrice: z.number().positive(),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { roomId, period, startDate, endDate, totalPrice, notes } = bookingSchema.parse(body)

    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        roomId,
        period,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalPrice,
        notes: notes || null,
        status: "PENDING",
      },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 })
    }
    return NextResponse.json({ error: "Gagal membuat booking" }, { status: 500 })
  }
}
