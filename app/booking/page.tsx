"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface Room {
  id: string
  name: string
  prices: Array<{ period: string; amount: number }>
}

export default function BookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const { toast } = useToast()

  const roomId = searchParams.get("roomId")
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    period: "MONTH",
    startDate: "",
    notes: "",
  })

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin")
      return
    }

    if (!roomId) {
      router.push("/rooms")
      return
    }

    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}`)
        if (response.ok) {
          const data = await response.json()
          setRoom(data)
        }
      } catch (error) {
        console.error("Error fetching room:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRoom()
  }, [session, roomId, router])

  const calculateEndDate = (startDate: string, period: string): Date => {
    const start = new Date(startDate)
    const end = new Date(start)

    switch (period) {
      case "WEEK":
        end.setDate(end.getDate() + 7)
        break
      case "MONTH":
        end.setMonth(end.getMonth() + 1)
        break
      case "3MO":
        end.setMonth(end.getMonth() + 3)
        break
      case "6MO":
        end.setMonth(end.getMonth() + 6)
        break
      case "12MO":
        end.setMonth(end.getMonth() + 12)
        break
    }

    return end
  }

  const getTotalPrice = (): number => {
    if (!room || !formData.startDate) return 0
    const price = room.prices.find((p) => p.period === formData.period)
    return price?.amount || 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const endDate = calculateEndDate(formData.startDate, formData.period)
      const totalPrice = getTotalPrice()

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          period: formData.period,
          startDate: formData.startDate,
          endDate: endDate.toISOString().split("T")[0],
          totalPrice,
          notes: formData.notes,
        }),
      })

      if (response.ok) {
        const booking = await response.json()
        toast({
          title: "Berhasil",
          description: "Booking berhasil dibuat. Silakan tunggu konfirmasi dari admin.",
        })
        router.push(`/bookings/${booking.id}`)
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Gagal membuat booking",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Memuat data kamar...</p>
        </div>
        <Footer />
      </>
    )
  }

  if (!room) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Kamar tidak ditemukan</p>
            <Link href="/rooms">
              <Button>Kembali ke Daftar Kamar</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  const totalPrice = getTotalPrice()

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-8">Pesan Kamar</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Detail Booking</CardTitle>
                  <CardDescription>Isi informasi booking Anda</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Kamar</label>
                      <Input value={room.name} disabled />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Periode Sewa</label>
                      <Select
                        value={formData.period}
                        onValueChange={(value) => setFormData({ ...formData, period: value })}
                      >
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
                      <label className="text-sm font-medium mb-2 block">Tanggal Mulai</label>
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Catatan (Opsional)</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Tulis catatan atau pertanyaan khusus..."
                        rows={4}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={submitting || !formData.startDate}>
                      {submitting ? "Memproses..." : "Lanjutkan ke Pembayaran"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Summary */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Ringkasan Booking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Kamar</p>
                    <p className="font-bold">{room.name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Periode</p>
                    <p className="font-bold">
                      {formData.period === "WEEK"
                        ? "Mingguan"
                        : formData.period === "MONTH"
                          ? "Bulanan"
                          : formData.period === "3MO"
                            ? "3 Bulan"
                            : formData.period === "6MO"
                              ? "6 Bulan"
                              : "12 Bulan"}
                    </p>
                  </div>

                  {formData.startDate && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Tanggal Mulai</p>
                        <p className="font-bold">{new Date(formData.startDate).toLocaleDateString("id-ID")}</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Tanggal Selesai</p>
                        <p className="font-bold">
                          {calculateEndDate(formData.startDate, formData.period).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                    </>
                  )}

                  <div className="border-t pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Harga</span>
                      <span className="font-bold">Rp {totalPrice.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
