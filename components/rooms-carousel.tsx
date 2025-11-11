"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bed, Bath, Square, ArrowRight } from "lucide-react"

interface Room {
  id: string
  slug: string
  name: string
  floor: number
  capacity: number
  size: string
  facilities: string
  mainImageUrl: string | null
  prices: Array<{ period: string; amount: number }>
}

function formatFacilities(facilitiesString: string): string {
  if (!facilitiesString || facilitiesString.trim() === "") {
    return ""
  }

  // Helper function untuk recursively parse dan flatten
  const parseAndFlatten = (data: any, depth: number = 0): string[] => {
    // Prevent infinite recursion
    if (depth > 5) {
      return []
    }

    // Jika data adalah array
    if (Array.isArray(data)) {
      const result: string[] = []
      for (const item of data) {
        if (typeof item === "string") {
          // Jika string terlihat seperti JSON (double-stringified), coba parse lagi
          const trimmed = item.trim()
          if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || 
              (trimmed.startsWith("{") && trimmed.endsWith("}"))) {
            try {
              const parsed = JSON.parse(item)
              result.push(...parseAndFlatten(parsed, depth + 1))
            } catch {
              // Jika parse gagal, gunakan string asli
              if (trimmed !== "") {
                result.push(trimmed)
              }
            }
          } else {
            // String biasa, tambahkan jika tidak kosong
            if (trimmed !== "") {
              result.push(trimmed)
            }
          }
        } else if (Array.isArray(item)) {
          // Nested array, recurse
          result.push(...parseAndFlatten(item, depth + 1))
        } else if (item !== null && item !== undefined) {
          // Convert to string
          const str = String(item).trim()
          if (str !== "") {
            result.push(str)
          }
        }
      }
      return result
    }
    
    // Jika data adalah string
    if (typeof data === "string") {
      const trimmed = data.trim()
      // Jika string terlihat seperti JSON, coba parse
      if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || 
          (trimmed.startsWith("{") && trimmed.endsWith("}"))) {
        try {
          const parsed = JSON.parse(data)
          return parseAndFlatten(parsed, depth + 1)
        } catch {
          return trimmed !== "" ? [trimmed] : []
        }
      }
      return trimmed !== "" ? [trimmed] : []
    }
    
    return []
  }

  try {
    // Coba parse sebagai JSON
    const parsed = JSON.parse(facilitiesString)
    const facilities = parseAndFlatten(parsed)
    return facilities.length > 0 ? facilities.join(", ") : ""
  } catch {
    // Jika bukan JSON valid, coba extract dari string
    // Handle kasus seperti: ["[\"Wifi\", \"Kasur\"]"]
    if (facilitiesString.includes("[") && facilitiesString.includes("]")) {
      try {
        // Coba extract semua array dari string
        const arrayMatches = facilitiesString.matchAll(/\[(.*?)\]/g)
        const allItems: string[] = []
        
        for (const match of arrayMatches) {
          if (match[1]) {
            // Split by comma, handle quoted strings
            const items = match[1]
              .split(/,/)
              .map(s => s.trim().replace(/^["']|["']$/g, "").trim())
              .filter(s => s !== "")
            allItems.push(...items)
          }
        }
        
        if (allItems.length > 0) {
          return allItems.join(", ")
        }
      } catch {
        // Ignore
      }
    }
    
    // Jika semua gagal, return string asli (mungkin sudah dalam format yang benar)
    return facilitiesString
  }
}

export function RoomsCarousel() {
  const [rooms, setRooms] = useState<Room[]>([])

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch("/api/rooms?period=MONTH")
        const data = await response.json()
        // Ambil 8 kamar pertama dan duplicate untuk infinite scroll effect
        const limitedRooms = data.slice(0, 8)
        if (limitedRooms.length > 0) {
          // Duplicate rooms untuk infinite scroll effect
          setRooms([...limitedRooms, ...limitedRooms, ...limitedRooms])
        } else {
          // Fallback jika tidak ada kamar
          const dummyRooms: Room[] = [
            {
              id: "1",
              slug: "premium-room",
              name: "Premium Room",
              floor: 1,
              capacity: 1,
              size: "20 m²",
              facilities: "WiFi, AC, Kamar Mandi Dalam",
              mainImageUrl: "/bedroom-interior-modern.jpg",
              prices: [{ period: "MONTH", amount: 2500000 }]
            },
            {
              id: "2",
              slug: "standard-room",
              name: "Standard Room",
              floor: 2,
              capacity: 1,
              size: "15 m²",
              facilities: "WiFi, AC, Kamar Mandi Luar",
              mainImageUrl: "/luxury-bedroom.png",
              prices: [{ period: "MONTH", amount: 1800000 }]
            },
            {
              id: "3",
              slug: "deluxe-room",
              name: "Deluxe Room",
              floor: 3,
              capacity: 2,
              size: "25 m²",
              facilities: "WiFi, AC, Kamar Mandi Dalam, Balkon",
              mainImageUrl: "/premium-bedroom-luxury.jpg",
              prices: [{ period: "MONTH", amount: 3200000 }]
            }
          ]
          setRooms([...dummyRooms, ...dummyRooms, ...dummyRooms])
        }
      } catch (error) {
        console.error("Error fetching rooms:", error)
        // Fallback dummy data jika API error
        const dummyRooms: Room[] = [
          {
            id: "1",
            slug: "premium-room",
            name: "Premium Room",
            floor: 1,
            capacity: 1,
            size: "20 m²",
            facilities: "WiFi, AC, Kamar Mandi Dalam",
            mainImageUrl: "/bedroom-interior-modern.jpg",
            prices: [{ period: "MONTH", amount: 2500000 }]
          },
          {
            id: "2",
            slug: "standard-room",
            name: "Standard Room",
            floor: 2,
            capacity: 1,
            size: "15 m²",
            facilities: "WiFi, AC, Kamar Mandi Luar",
            mainImageUrl: "/luxury-bedroom.png",
            prices: [{ period: "MONTH", amount: 1800000 }]
          },
          {
            id: "3",
            slug: "deluxe-room",
            name: "Deluxe Room",
            floor: 3,
            capacity: 2,
            size: "25 m²",
            facilities: "WiFi, AC, Kamar Mandi Dalam, Balkon",
            mainImageUrl: "/premium-bedroom-luxury.jpg",
            prices: [{ period: "MONTH", amount: 3200000 }]
          }
        ]
        setRooms([...dummyRooms, ...dummyRooms, ...dummyRooms])
      }
    }

    fetchRooms()
  }, [])

  if (rooms.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Kamar Tersedia
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Jelajahi koleksi kamar kost terbaik kami dengan fasilitas lengkap
          </p>
        </div>

        {/* Marquee Container */}
        <div className="relative">
          {/* Gradient Overlay kiri dan kanan untuk fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50/95 via-gray-50/50 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50/95 via-gray-50/50 to-transparent z-10 pointer-events-none"></div>

          {/* Marquee Wrapper */}
          <div className="overflow-hidden">
            <div className="flex animate-marquee gap-6">
              {rooms.map((room, index) => {
                const monthlyPrice = room.prices.find((p) => p.period === "MONTH")?.amount || 0
                return (
                  <Link
                    key={`${room.id}-${index}`}
                    href={`/rooms/${room.slug}`}
                    className="flex-shrink-0 w-80 group"
                  >
                    <Card className="bg-white border border-gray-200 hover:border-red-600/50 transition-all hover:shadow-xl rounded-xl overflow-hidden h-full group">
                      {/* Image */}
                      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                        {room.mainImageUrl ? (
                          <Image
                            src={room.mainImageUrl || "/placeholder.svg"}
                            alt={room.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
                            <Bed className="h-12 w-12 text-red-600/50" />
                          </div>
                        )}
                        {/* Badge Price */}
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-white/95 text-red-600 border border-red-600/20 px-3 py-1 font-bold shadow-lg">
                            Rp {monthlyPrice.toLocaleString("id-ID")}
                          </Badge>
                        </div>
                        {/* Overlay gradient on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>

                      {/* Content */}
                      <CardContent className="p-5">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                          {room.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">Lantai {room.floor}</p>

                        {/* Features */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-6 h-6 rounded-lg bg-red-600/10 flex items-center justify-center">
                              <Bed className="h-3.5 w-3.5 text-red-600" />
                            </div>
                            <span>Kapasitas: {room.capacity} orang</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-6 h-6 rounded-lg bg-red-600/10 flex items-center justify-center">
                              <Square className="h-3.5 w-3.5 text-red-600" />
                            </div>
                            <span>{room.size}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-6 h-6 rounded-lg bg-red-600/10 flex items-center justify-center">
                              <Bath className="h-3.5 w-3.5 text-red-600" />
                            </div>
                            <span className="truncate">{formatFacilities(room.facilities)}</span>
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="flex items-center gap-2 text-red-600 font-medium text-sm group-hover:gap-3 transition-all">
                          <span>Lihat Detail</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link href="/rooms">
            <button className="bg-gray-900 text-white hover:bg-gray-800 rounded-lg px-8 py-3 text-base font-medium flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transition-all">
              Lihat Semua Kamar
              <ArrowRight className="h-5 w-5" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}

