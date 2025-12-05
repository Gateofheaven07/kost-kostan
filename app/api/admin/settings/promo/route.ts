import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    await requireAdmin()

    const promo = await prisma.promo.findFirst()
    
    // Default values if no promo exists
    if (!promo) {
      return NextResponse.json({
        title: "Premium Room",
        description: "Kamar Tidur, Kamar Mandi, 20 m²",
        price: 1000000,
        period: "/bulan",
        features: "WiFi Gratis, Keamanan 24/7, Lokasi Strategis",
        isActive: true,
      })
    }

    return NextResponse.json(promo)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch promo settings" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()

    const promo = await prisma.promo.findFirst()

    if (promo) {
      const updated = await prisma.promo.update({
        where: { id: promo.id },
        data: body,
      })
      return NextResponse.json(updated)
    } else {
      const created = await prisma.promo.create({
        data: body,
      })
      return NextResponse.json(created)
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to update promo settings" }, { status: 500 })
  }
}

