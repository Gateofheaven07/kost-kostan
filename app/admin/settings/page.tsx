"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface KostSettings {
  name: string
  address: string
  city: string
  description: string
  rules: string
  facilities: string
  contactPhone: string
  contactWhatsApp: string
  email: string
  coverImageUrl: string
}

interface OwnerSettings {
  name: string
  photoUrl: string
  bio: string
  phone: string
  email: string
  socials: string
}

interface PromoSettings {
  title: string
  description: string
  price: number
  period: string
  features: string
  isActive: boolean
}

export default function SettingsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [kostData, setKostData] = useState<KostSettings>({
    name: "",
    address: "",
    city: "",
    description: "",
    rules: "",
    facilities: "",
    contactPhone: "",
    contactWhatsApp: "",
    email: "",
    coverImageUrl: "",
  })

  const [ownerData, setOwnerData] = useState<OwnerSettings>({
    name: "",
    photoUrl: "",
    bio: "",
    phone: "",
    email: "",
    socials: "",
  })

  const [promoData, setPromoData] = useState<PromoSettings>({
    title: "",
    description: "",
    price: 0,
    period: "",
    features: "",
    isActive: true,
  })

  const { isLoading: loading, isError } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const [kostRes, ownerRes, promoRes] = await Promise.all([
        fetch("/api/admin/settings/kost"),
        fetch("/api/admin/settings/owner"),
        fetch("/api/admin/settings/promo"),
      ])

      let kost = null
      let owner = null
      let promo = null

      if (kostRes.ok) {
        kost = await kostRes.json()
        setKostData({
          ...kost,
          facilities: Array.isArray(kost.facilities) ? kost.facilities.join(", ") : kost.facilities,
        })
      }

      if (ownerRes.ok) {
        owner = await ownerRes.json()
        setOwnerData({
          ...owner,
          socials: typeof owner.socials === "string" ? owner.socials : JSON.stringify(owner.socials),
        })
      }

      if (promoRes.ok) {
        promo = await promoRes.json()
        setPromoData(promo)
      }

      return { kost, owner, promo }
    },
  })

  useEffect(() => {
    if (isError) {
      toast({
        title: "Error",
        description: "Gagal memuat pengaturan",
        variant: "destructive",
      })
    }
  }, [isError, toast])

  const handleKostChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setKostData((prev) => ({ ...prev, [name]: value }))
  }

  const handleOwnerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setOwnerData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePromoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setPromoData((prev) => ({ 
      ...prev, 
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value 
    }))
  }

  const updateKostMutation = useMutation({
    mutationFn: async (data: KostSettings) => {
      const response = await fetch("/api/admin/settings/kost", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          facilities: data.facilities.split(",").map((f) => f.trim()),
        }),
      })
      if (!response.ok) throw new Error("Failed to update kost settings")
      return response.json()
    },
    onSuccess: () => {
      toast({ title: "Berhasil", description: "Pengaturan kost berhasil disimpan" })
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal menyimpan pengaturan",
        variant: "destructive",
      })
    },
  })

  const updateOwnerMutation = useMutation({
    mutationFn: async (data: OwnerSettings) => {
      const response = await fetch("/api/admin/settings/owner", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to update owner settings")
      return response.json()
    },
    onSuccess: () => {
      toast({ title: "Berhasil", description: "Pengaturan pemilik berhasil disimpan" })
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal menyimpan pengaturan",
        variant: "destructive",
      })
    },
  })

  const updatePromoMutation = useMutation({
    mutationFn: async (data: PromoSettings) => {
      const response = await fetch("/api/admin/settings/promo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          price: Number(data.price),
        }),
      })
      if (!response.ok) throw new Error("Failed to update promo settings")
      return response.json()
    },
    onSuccess: () => {
      toast({ title: "Berhasil", description: "Pengaturan promo berhasil disimpan" })
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal menyimpan pengaturan",
        variant: "destructive",
      })
    },
  })

  const handleKostSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    updateKostMutation.mutate(kostData)
  }

  const handleOwnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    updateOwnerMutation.mutate(ownerData)
  }

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    updatePromoMutation.mutate(promoData)
  }

  if (loading) {
    return <div className="p-8">Memuat...</div>
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Pengaturan</h1>

      {/* Kost Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Kost</CardTitle>
          <CardDescription>Kelola informasi kost Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleKostSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nama Kost</label>
              <Input name="name" value={kostData.name} onChange={handleKostChange} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Alamat</label>
                <Input name="address" value={kostData.address} onChange={handleKostChange} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Kota</label>
                <Input name="city" value={kostData.city} onChange={handleKostChange} required />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Deskripsi</label>
              <textarea
                name="description"
                value={kostData.description}
                onChange={handleKostChange}
                rows={4}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Peraturan</label>
              <textarea
                name="rules"
                value={kostData.rules}
                onChange={handleKostChange}
                rows={4}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Fasilitas (pisahkan dengan koma)</label>
              <Input
                name="facilities"
                value={kostData.facilities}
                onChange={handleKostChange}
                placeholder="WiFi, Parkir, Keamanan 24 jam"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Telepon</label>
                <Input name="contactPhone" value={kostData.contactPhone} onChange={handleKostChange} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">WhatsApp</label>
                <Input name="contactWhatsApp" value={kostData.contactWhatsApp} onChange={handleKostChange} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input name="email" type="email" value={kostData.email} onChange={handleKostChange} />
            </div>

            <Button type="submit" disabled={updateKostMutation.isPending}>
              {updateKostMutation.isPending ? "Menyimpan..." : "Simpan Pengaturan Kost"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Owner Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Pemilik</CardTitle>
          <CardDescription>Kelola profil pemilik kost</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleOwnerSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nama</label>
              <Input name="name" value={ownerData.name} onChange={handleOwnerChange} required />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">URL Foto</label>
              <Input
                name="photoUrl"
                value={ownerData.photoUrl}
                onChange={handleOwnerChange}
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Bio</label>
              <textarea
                name="bio"
                value={ownerData.bio}
                onChange={handleOwnerChange}
                rows={4}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Telepon</label>
                <Input name="phone" value={ownerData.phone} onChange={handleOwnerChange} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input name="email" type="email" value={ownerData.email} onChange={handleOwnerChange} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Media Sosial (JSON)</label>
              <textarea
                name="socials"
                value={ownerData.socials}
                onChange={handleOwnerChange}
                rows={3}
                placeholder='{"instagram": "@username", "facebook": "username"}'
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm"
              />
            </div>

            <Button type="submit" disabled={updateOwnerMutation.isPending}>
              {updateOwnerMutation.isPending ? "Menyimpan..." : "Simpan Pengaturan Pemilik"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Promo Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Promo Card (Landing Page)</CardTitle>
          <CardDescription>Kelola tampilan kartu promo di halaman utama</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePromoSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Judul Promo</label>
              <Input name="title" value={promoData.title} onChange={handlePromoChange} required />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Deskripsi (Fasilitas Singkat)</label>
              <textarea
                name="description"
                value={promoData.description}
                onChange={handlePromoChange}
                rows={2}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Harga</label>
                <Input 
                  name="price" 
                  type="number" 
                  value={promoData.price} 
                  onChange={handlePromoChange} 
                  required 
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Periode</label>
                <Input 
                  name="period" 
                  value={promoData.period} 
                  onChange={handlePromoChange} 
                  placeholder="/bulan" 
                  required 
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Fitur Lengkap (pisahkan dengan koma)</label>
              <textarea
                name="features"
                value={promoData.features}
                onChange={handlePromoChange}
                rows={3}
                placeholder="WiFi Gratis, Keamanan 24/7, Lokasi Strategis"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={promoData.isActive}
                onChange={handlePromoChange}
                id="isActive"
                className="rounded border-gray-300"
              />
              <label htmlFor="isActive" className="text-sm font-medium">Tampilkan Promo</label>
            </div>

            <Button type="submit" disabled={updatePromoMutation.isPending}>
              {updatePromoMutation.isPending ? "Menyimpan..." : "Simpan Pengaturan"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
