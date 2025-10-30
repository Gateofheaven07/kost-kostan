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
import { Wifi, Users, DoorOpen } from "lucide-react"

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
      <main className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-8">Daftar Kamar</h1>

          {/* Filters */}
          <div className="bg-card border rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Periode Sewa</label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger>
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

              <div>
                <label className="text-sm font-medium mb-2 block">Harga Maksimal</label>
                <Input
                  type="number"
                  placeholder="Rp 5.000.000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value) || 5000000])}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Urutkan</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
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

          {/* Rooms Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Memuat kamar...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Tidak ada kamar yang tersedia</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => {
                const monthlyPrice = room.prices.find((p) => p.period === period)?.amount || 0
                return (
                  <Link key={room.id} href={`/rooms/${room.slug}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="relative h-48 bg-muted">
                        {room.mainImageUrl ? (
                          <Image
                            src={room.mainImageUrl || "/placeholder.svg"}
                            alt={room.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <DoorOpen className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        <Badge className="absolute top-2 right-2">Rp {monthlyPrice.toLocaleString("id-ID")}</Badge>
                      </div>
                      <CardHeader>
                        <CardTitle className="line-clamp-2">{room.name}</CardTitle>
                        <CardDescription>Lantai {room.floor}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{room.capacity} orang</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Wifi className="h-4 w-4 text-muted-foreground" />
                            <span>{room.size}</span>
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
      </main>
      <Footer />
    </>
  )
}
