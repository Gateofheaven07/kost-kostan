"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wifi, Users, DoorOpen, Bed, Bath, Square, Search, SlidersHorizontal, ArrowRight, MapPin } from "lucide-react"
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
  prices: Array<{ period: string; amount: number }>
}

export default function RoomsPage() {
  const searchParams = useSearchParams()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000])
  const [period, setPeriod] = useState("MONTH")
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const params = new URLSearchParams()
        params.set("minPrice", priceRange[0].toString())
        params.set("maxPrice", priceRange[1].toString())
        params.set("period", period)
        params.set("sort", sortBy)

        const response = await fetch(`/api/rooms?${params}`)
        const data = await response.json()
        setRooms(data)
      } catch (error) {
        console.error("Error fetching rooms:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [priceRange, period, sortBy])

  const minPrice = Math.min(...rooms.flatMap((r) => r.prices.map((p) => p.amount)), 0)
  const maxPrice = Math.max(...rooms.flatMap((r) => r.prices.map((p) => p.amount)), 5000000)

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

            {/* Enhanced Filters */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl p-6 md:p-8 mb-12">
              <div className="flex items-center gap-3 mb-6">
                <SlidersHorizontal className="h-5 w-5 text-red-600" />
                <h2 className="text-xl font-bold text-gray-900">Filter Pencarian</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Search className="h-4 w-4 text-red-600" />
                    Periode Sewa
                  </label>
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:border-red-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WEEK">Mingguan</SelectItem>
                      <SelectItem value="MONTH">Bulanan</SelectItem>
                      <SelectItem value="3MO">3 Bulan</SelectItem>
                      <SelectItem value="6MO">6 Bulan</SelectItem>
                      <SelectItem value="12MO">12 Bulan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Harga Maksimal</label>
                  <Input
                    type="number"
                    placeholder="Rp 5.000.000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value) || 5000000])}
                    className="h-12 border-2 border-gray-200 rounded-xl focus:border-red-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Urutkan</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:border-red-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Terbaru</SelectItem>
                      <SelectItem value="price-asc">Harga Termurah</SelectItem>
                      <SelectItem value="price-desc">Harga Termahal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
                          <div className="absolute top-4 right-4">
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
                          <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2">
                            {room.name}
                          </CardTitle>
                          <CardDescription className="text-base text-gray-600">
                            Kapasitas: {room.capacity} orang • {room.size}
                          </CardDescription>
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
