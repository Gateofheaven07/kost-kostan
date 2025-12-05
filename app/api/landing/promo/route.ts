import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const promo = await prisma.promo.findFirst()
    
    if (!promo) {
      return NextResponse.json({
        title: "Premium Room",
        description: "Kamar Tidur, Kamar Mandi, 20 m²",
        price: 1000000,
        period: "/bulan",
        features: "Kamar Tidur, Kamar Mandi, 20 m²",
        isActive: true,
      })
    }

    return NextResponse.json(promo)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch promo data" }, { status: 500 })
  }
}

