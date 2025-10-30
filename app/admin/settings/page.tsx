"use client"

import type React from "react"

import { useEffect, useState } from "react"
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

export default function SettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

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

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const [kostRes, ownerRes] = await Promise.all([
        fetch("/api/admin/settings/kost"),
        fetch("/api/admin/settings/owner"),
      ])

      if (kostRes.ok) {
        const kost = await kostRes.json()
        setKostData({
          ...kost,
          facilities: Array.isArray(kost.facilities) ? kost.facilities.join(", ") : kost.facilities,
        })
      }

      if (ownerRes.ok) {
        const owner = await ownerRes.json()
        setOwnerData({
          ...owner,
          socials: typeof owner.socials === "string" ? owner.socials : JSON.stringify(owner.socials),
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat pengaturan",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKostChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setKostData((prev) => ({ ...prev, [name]: value }))
  }

  const handleOwnerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setOwnerData((prev) => ({ ...prev, [name]: value }))
  }

  const handleKostSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/admin/settings/kost", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...kostData,
          facilities: kostData.facilities.split(",").map((f) => f.trim()),
        }),
      })

      if (response.ok) {
        toast({ title: "Berhasil", description: "Pengaturan kost berhasil disimpan" })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan pengaturan",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleOwnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/admin/settings/owner", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ownerData),
      })

      if (response.ok) {
        toast({ title: "Berhasil", description: "Pengaturan pemilik berhasil disimpan" })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan pengaturan",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
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

            <Button type="submit" disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan Pengaturan Kost"}
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

            <Button type="submit" disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan Pengaturan Pemilik"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
