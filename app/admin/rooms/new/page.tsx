"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function NewRoomPage() {
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    name: "",
    roomNumber: 101,
    floor: 1,
    capacity: 1,
    size: "",
    facilities: "",
    isAvailable: true,
    mainImageUrl: "",
    prices: {
      MONTH: 0,
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

  const createRoomMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/admin/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to create room")
      return response.json()
    },
    onSuccess: () => {
      toast({ title: "Berhasil", description: "Kamar berhasil ditambahkan" })
      // Invalidate admin queries
      queryClient.invalidateQueries({ queryKey: ["admin-rooms"] })
      // Invalidate public rooms query to update UI website - force refetch
      queryClient.invalidateQueries({ queryKey: ["rooms"] })
      queryClient.refetchQueries({ queryKey: ["rooms"] }) // Force immediate refetch
      router.push("/admin/rooms")
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal menambahkan kamar",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Pastikan nilai numerik dikirim sebagai number ke backend (sesuai schema Zod)
    const payload = {
      ...formData,
      floor: Number(formData.floor),
      capacity: Number(formData.capacity),
      roomNumber: Number(formData.roomNumber),
    }
    createRoomMutation.mutate(payload as typeof formData)
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
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nama Kamar</label>
                <Input name="name" value={formData.name} onChange={handleChange} placeholder="Kamar 101" required />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Lantai</label>
                <Input name="floor" type="number" value={formData.floor} onChange={handleChange} min="1" required />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Nomor Kamar</label>
                <Input
                  name="roomNumber"
                  type="number"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  min="1"
                  required
                  placeholder="101"
                />
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
                      {period === "MONTH"
                        ? "1 Bulan"
                        : period === "6MO"
                          ? "6 Bulan"
                          : "1 Tahun"}
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

            <Button type="submit" className="w-full" disabled={createRoomMutation.isPending}>
              {createRoomMutation.isPending ? "Menambahkan..." : "Tambah Kamar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
