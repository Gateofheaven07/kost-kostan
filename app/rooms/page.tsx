"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wifi, Users, DoorOpen, Bed, Bath, Square, ArrowRight, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Room {
  id: string
  slug: string
  name: string
  floor: number
  capacity: number
  size: string
  facilities: string
  mainImageUrl: string | null
  isAvailable: boolean
  prices: Array<{ period: string; amount: number }>
}

export default function RoomsPage() {
  const period = "MONTH" // Default period untuk menampilkan harga

  const { data: rooms = [], isLoading: loading } = useQuery<Room[]>({
    queryKey: ["rooms"],
    queryFn: async () => {
      // Add timestamp to bust cache
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/rooms?t=${timestamp}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
        },
      })
      if (!response.ok) throw new Error("Failed to fetch rooms")
      return response.json()
    },
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache in memory
    refetchOnMount: true, // Always refetch on mount
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnReconnect: true, // Refetch when reconnecting
    refetchInterval: 10000, // Refetch every 10 seconds to ensure real-time updates (only when tab is active)
    refetchIntervalInBackground: false, // Don't refetch when tab is in background
  })

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          {/* Subtle Pattern Background */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
                Daftar <span className="text-red-600">Kamar</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Temukan kamar kost impian Anda dengan fasilitas lengkap dan harga terjangkau
              </p>
            </div>
          </div>
        </section>

        {/* Rooms Grid Section */}
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-red-600"></div>
                <p className="text-gray-600 mt-4 font-medium">Memuat kamar...</p>
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-20">
                <DoorOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg text-gray-600 font-medium">Tidak ada kamar yang tersedia</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rooms.map((room) => {
                  const monthlyPrice = room.prices.find((p) => p.period === period)?.amount || 0
                  return (
                    <Link key={room.id} href={`/rooms/${room.slug}`}>
                      <Card className="group h-full bg-white border border-gray-200 hover:border-red-600/50 transition-all hover:shadow-2xl rounded-2xl overflow-hidden">
                        {/* Image Section */}
                        <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                          {room.mainImageUrl ? (
                            <Image
                              src={room.mainImageUrl || "/placeholder.svg"}
                              alt={room.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
                              <DoorOpen className="h-16 w-16 text-red-600/30" />
                            </div>
                          )}
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          {/* Price Badge */}
                          <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                            {!room.isAvailable && (
                              <Badge className="bg-red-600 text-white border-2 border-red-700 px-4 py-2 font-bold text-base shadow-lg z-10">
                                Tersewa
                              </Badge>
                            )}
                            <Badge className="bg-white/95 text-red-600 border-2 border-red-600/20 px-4 py-2 font-bold text-base shadow-lg">
                              Rp {monthlyPrice.toLocaleString("id-ID")}
                            </Badge>
                          </div>

                          {/* Floor Badge */}
                          <div className="absolute top-4 left-4">
                            <Badge className="bg-white/90 text-gray-700 px-3 py-1.5 font-semibold shadow-md flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" />
                              Lantai {room.floor}
                            </Badge>
                          </div>
                        </div>

                        {/* Content Section */}
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2">
                                {room.name}
                              </CardTitle>
                              <CardDescription className="text-base text-gray-600">
                                Kapasitas: {room.capacity} orang • {room.size}
                              </CardDescription>
                            </div>
                            {!room.isAvailable && (
                              <Badge variant="destructive" className="shrink-0">
                                Tersewa
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          {/* Features */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-gray-700">
                              <div className="w-8 h-8 rounded-lg bg-red-600/10 flex items-center justify-center">
                                <Bed className="h-4 w-4 text-red-600" />
                              </div>
                              <span className="font-medium">{room.capacity} Kamar Tidur</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-700">
                              <div className="w-8 h-8 rounded-lg bg-red-600/10 flex items-center justify-center">
                                <Bath className="h-4 w-4 text-red-600" />
                              </div>
                              <span className="font-medium">Kamar Mandi</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-700">
                              <div className="w-8 h-8 rounded-lg bg-red-600/10 flex items-center justify-center">
                                <Square className="h-4 w-4 text-red-600" />
                              </div>
                              <span className="font-medium">{room.size}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-700">
                              <div className="w-8 h-8 rounded-lg bg-red-600/10 flex items-center justify-center">
                                <Wifi className="h-4 w-4 text-red-600" />
                              </div>
                              <span className="font-medium truncate">{room.facilities}</span>
                            </div>
                          </div>

                          {/* CTA Button */}
                          <div className="pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between text-red-600 font-semibold group-hover:gap-3 transition-all">
                              <span>Lihat Detail</span>
                              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
