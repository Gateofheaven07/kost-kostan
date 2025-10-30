"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function NewRoomPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    floor: 1,
    capacity: 1,
    size: "",
    facilities: "",
    isAvailable: true,
    mainImageUrl: "",
    prices: {
      WEEK: 0,
      MONTH: 0,
      "3MO": 0,
      "6MO": 0,
      "12MO": 0,
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handlePriceChange = (period: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      prices: {
        ...prev.prices,
        [period]: Number.parseInt(value) || 0,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/admin/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({ title: "Berhasil", description: "Kamar berhasil ditambahkan" })
        router.push("/admin/rooms")
      } else {
        toast({
          title: "Error",
          description: "Gagal menambahkan kamar",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-8">
      <Link href="/admin/rooms" className="text-primary hover:underline mb-4 inline-block">
        ← Kembali
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Tambah Kamar Baru</CardTitle>
          <CardDescription>Tambahkan kamar baru ke kost Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nama Kamar</label>
                <Input name="name" value={formData.name} onChange={handleChange} placeholder="Kamar 101" required />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Lantai</label>
                <Input name="floor" type="number" value={formData.floor} onChange={handleChange} min="1" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Kapasitas (orang)</label>
                <Input
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Ukuran</label>
                <Input name="size" value={formData.size} onChange={handleChange} placeholder="3x4m" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Fasilitas (pisahkan dengan koma)</label>
              <textarea
                name="facilities"
                value={formData.facilities}
                onChange={handleChange}
                placeholder="WiFi, AC, Kasur, Lemari"
                rows={3}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">URL Gambar Utama</label>
              <Input
                name="mainImageUrl"
                value={formData.mainImageUrl}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleChange}
                  className="rounded border-input"
                />
                <span className="text-sm font-medium">Kamar Tersedia</span>
              </label>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-bold mb-4">Harga Sewa</h3>
              <div className="space-y-3">
                {Object.entries(formData.prices).map(([period, price]) => (
                  <div key={period}>
                    <label className="text-sm font-medium mb-2 block">
                      {period === "WEEK"
                        ? "Mingguan"
                        : period === "MONTH"
                          ? "Bulanan"
                          : period === "3MO"
                            ? "3 Bulan"
                            : period === "6MO"
                              ? "6 Bulan"
                              : "12 Bulan"}
                    </label>
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => handlePriceChange(period, e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Menambahkan..." : "Tambah Kamar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
