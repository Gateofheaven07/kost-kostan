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
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [snapLoaded, setSnapLoaded] = useState(false)

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

    // Load Midtrans Snap script dynamically
    const loadMidtransScript = () => {
      if (typeof window === "undefined") return

      // Check if script already loaded
      if ((window as any).snap) {
        setSnapLoaded(true)
        return
      }

      // Check if script tag already exists
      const existingScript = document.querySelector('script[src*="midtrans.com/snap/snap.js"]')
      if (existingScript) {
        // Wait a bit for script to initialize
        const checkSnap = setInterval(() => {
          if ((window as any).snap) {
            setSnapLoaded(true)
            clearInterval(checkSnap)
          }
        }, 100)

        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkSnap)
        }, 5000)
        return
      }

      // Create and load script
      const script = document.createElement("script")
      script.src = "https://app.sandbox.midtrans.com/snap/snap.js"
      script.setAttribute("data-client-key", "Mid-client-6ynAvOYFntPXk6wC")
      script.async = true
      script.onload = () => {
        console.log("Midtrans Snap script loaded")
        setSnapLoaded(true)
      }
      script.onerror = () => {
        console.error("Failed to load Midtrans Snap script")
      }
      document.head.appendChild(script)
    }

    loadMidtransScript()

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

      // Create booking first
      const bookingResponse = await fetch("/api/bookings", {
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

      if (!bookingResponse.ok) {
        const data = await bookingResponse.json()
        toast({
          title: "Error",
          description: data.error || "Gagal membuat booking",
          variant: "destructive",
        })
        setSubmitting(false)
        return
      }

      const booking = await bookingResponse.json()

      // Create payment token
      setPaymentProcessing(true)
      const paymentResponse = await fetch("/api/payments/create-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id }),
      })

      if (!paymentResponse.ok) {
        const data = await paymentResponse.json()
        toast({
          title: "Error",
          description: data.error || "Gagal membuat token pembayaran",
          variant: "destructive",
        })
        setPaymentProcessing(false)
        setSubmitting(false)
        return
      }

      const { token } = await paymentResponse.json()

      // Wait for Midtrans Snap script to be loaded
      const waitForSnap = (): Promise<void> => {
        return new Promise((resolve, reject) => {
          if (typeof window === "undefined") {
            reject(new Error("Window is not defined"))
            return
          }

          // Check if snap is already available
          if ((window as any).snap && typeof (window as any).snap.pay === "function") {
            resolve()
            return
          }

          // Wait for snap to be loaded (max 10 seconds)
          let attempts = 0
          const maxAttempts = 100
          const checkInterval = setInterval(() => {
            attempts++
            if ((window as any).snap && typeof (window as any).snap.pay === "function") {
              clearInterval(checkInterval)
              resolve()
            } else if (attempts >= maxAttempts) {
              clearInterval(checkInterval)
              reject(new Error("Midtrans Snap script gagal dimuat. Silakan refresh halaman dan coba lagi."))
            }
          }, 100)
        })
      }

      try {
        // Wait for Snap script to be ready
        await waitForSnap()

        // Open Midtrans payment popup immediately - NO ADMIN CONFIRMATION NEEDED
        ;(window as any).snap.pay(token, {
          onSuccess: function (result: any) {
            toast({
              title: "Pembayaran Berhasil",
              description: "Terima kasih! Pembayaran Anda berhasil diproses.",
            })
            router.push(`/bookings/${booking.id}`)
          },
          onPending: function (result: any) {
            toast({
              title: "Pembayaran Pending",
              description: "Pembayaran Anda sedang diproses. Silakan selesaikan pembayaran.",
            })
            router.push(`/bookings/${booking.id}`)
          },
          onError: function (result: any) {
            toast({
              title: "Pembayaran Gagal",
              description: "Pembayaran gagal diproses. Silakan coba lagi.",
              variant: "destructive",
            })
          },
          onClose: function () {
            toast({
              title: "Pembayaran Dibatalkan",
              description: "Anda menutup popup pembayaran.",
            })
          },
        })
      } catch (snapError: any) {
        console.error("Error opening Midtrans popup:", snapError)
        toast({
          title: "Error",
          description: snapError.message || "Gagal membuka popup pembayaran. Silakan refresh halaman dan coba lagi.",
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
      setPaymentProcessing(false)
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
      {/* Midtrans Snap.js Script - Loaded dynamically in useEffect */}

      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-8">Pesan Kamar</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl">
                <CardHeader className="bg-gradient-to-br from-red-50 via-white to-white pb-6">
                  <CardTitle className="text-2xl font-bold text-gray-900">Detail Booking</CardTitle>
                  <CardDescription>Isi informasi booking Anda</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Kamar</label>
                      <Input value={room.name} disabled className="h-12 border-2 border-gray-200 rounded-xl" />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Periode Sewa</label>
                      <Select
                        value={formData.period}
                        onValueChange={(value) => setFormData({ ...formData, period: value })}
                      >
                        <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl">
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
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Tanggal Mulai</label>
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        min={new Date().toISOString().split("T")[0]}
                        required
                        className="h-12 border-2 border-gray-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Catatan (Opsional)</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Tulis catatan atau pertanyaan khusus..."
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20 transition-all resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                      disabled={submitting || paymentProcessing || !formData.startDate}
                    >
                      {submitting || paymentProcessing
                        ? "Memproses..."
                        : "Lanjutkan ke Pembayaran"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Summary */}
            <div>
              <Card className="sticky top-4 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl">
                <CardHeader className="bg-gradient-to-br from-gray-50 to-white pb-6">
                  <CardTitle className="text-xl font-bold text-gray-900">Ringkasan Booking</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Kamar</p>
                    <p className="font-bold text-gray-900">{room.name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Periode</p>
                    <p className="font-bold text-gray-900">
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
                        <p className="text-sm text-gray-600 mb-1">Tanggal Mulai</p>
                        <p className="font-bold text-gray-900">
                          {new Date(formData.startDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-1">Tanggal Selesai</p>
                        <p className="font-bold text-gray-900">
                          {calculateEndDate(formData.startDate, formData.period).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </>
                  )}

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Harga</span>
                      <span className="font-bold text-gray-900">Rp {totalPrice.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                      <span className="text-gray-900">Total</span>
                      <span className="text-red-600">Rp {totalPrice.toLocaleString("id-ID")}</span>
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
