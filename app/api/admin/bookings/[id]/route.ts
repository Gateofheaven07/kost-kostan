import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params

    const body = await request.json()
    const { status } = body

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(booking)
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui booking" }, { status: 500 })
  }
}
