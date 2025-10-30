import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const users = await prisma.user.findMany({
      where: { role: "USER" },
      select: { id: true, name: true, email: true, phone: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
