import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const minPrice = Number.parseInt(searchParams.get("minPrice") || "0")
    const maxPrice = Number.parseInt(searchParams.get("maxPrice") || "999999999")
    const period = searchParams.get("period") || "MONTH"
    const sort = searchParams.get("sort") || "newest"

    let rooms = await prisma.room.findMany({
      where: { isAvailable: true },
      include: { prices: true, images: true },
    })

    // Filter by price
    rooms = rooms.filter((room) => {
      const price = room.prices.find((p) => p.period === period)
      return price && price.amount >= minPrice && price.amount <= maxPrice
    })

    // Sort
    if (sort === "price-asc") {
      rooms.sort((a, b) => {
        const priceA = a.prices.find((p) => p.period === period)?.amount || 0
        const priceB = b.prices.find((p) => p.period === period)?.amount || 0
        return priceA - priceB
      })
    } else if (sort === "price-desc") {
      rooms.sort((a, b) => {
        const priceA = a.prices.find((p) => p.period === period)?.amount || 0
        const priceB = b.prices.find((p) => p.period === period)?.amount || 0
        return priceB - priceA
      })
    } else {
      rooms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return NextResponse.json(rooms)
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data kamar" }, { status: 500 })
  }
}
