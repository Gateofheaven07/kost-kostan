"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog"
import { User, Mail, Phone, Calendar, Shield, Edit, Camera, Lock, MapPin } from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false)
  
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
  })
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (session?.user) {
      setEditForm({
        name: session.user.name || "",
        phone: (session.user as any).phone || "",
      })
    }
  }, [status, session, router])

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof editForm) => {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Gagal memperbarui profile.")
      }
      return response.json()
    },
    onSuccess: async () => {
      await update()
      setTimeout(() => {
        toast({
          title: "Berhasil!",
          description: "Profile berhasil diperbarui.",
        })
        setIsEditDialogOpen(false)
        router.refresh()
      }, 500)
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan.",
        variant: "destructive",
      })
    },
  })

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    updateProfileMutation.mutate(editForm)
  }

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Gagal mengubah password.")
      }
      return response.json()
    },
    onSuccess: () => {
      toast({
        title: "Berhasil!",
        description: "Password berhasil diubah.",
      })
      setIsPasswordDialogOpen(false)
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan.",
        variant: "destructive",
      })
    },
  })

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Password baru tidak cocok.",
        variant: "destructive",
      })
      return
    }

    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    })
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFileName(file.name)
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: "Error",
          description: "Ukuran file maksimal 2MB.",
          variant: "destructive",
        })
        setSelectedFileName(null)
        return
      }

      // Compress and resize image
      const reader = new FileReader()
      reader.onloadend = () => {
        const img = new Image()
        img.onload = () => {
          // Create canvas to resize image
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          // Set max dimensions
          const MAX_WIDTH = 400
          const MAX_HEIGHT = 400
          let width = img.width
          let height = img.height
          
          // Calculate new dimensions
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height
              height = MAX_HEIGHT
            }
          }
          
          canvas.width = width
          canvas.height = height
          
          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height)
          
          // Convert to base64 with compression (quality 0.7)
          const compressedImage = canvas.toDataURL('image/jpeg', 0.7)
          setPhotoPreview(compressedImage)
        }
        img.src = reader.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadPhotoMutation = useMutation({
    mutationFn: async (photo: string) => {
      const response = await fetch("/api/user/photo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Gagal mengupload foto.")
      }
      return response.json()
    },
    onSuccess: async () => {
      await update()
      setTimeout(() => {
        toast({
          title: "Berhasil!",
          description: "Foto profile berhasil diperbarui.",
        })
        setIsPhotoDialogOpen(false)
        setPhotoPreview(null)
        router.refresh()
      }, 500)
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan.",
        variant: "destructive",
      })
    },
  })

  const handleUploadPhoto = async () => {
    if (!photoPreview) return
    uploadPhotoMutation.mutate(photoPreview)
  }

  if (status === "loading") {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Memuat profile...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (!session) {
    return null
  }

  const getInitials = (name?: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const userRole = (session.user as any)?.role || "USER"

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Profile Saya</h1>
            <p className="text-muted-foreground">
              Kelola informasi profile dan lihat aktivitas Anda
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Profile Card */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Informasi Profile</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center text-center space-y-4">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-4 border-primary/20">
                    <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                      {getInitials(session.user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => setIsPhotoDialogOpen(true)}
                    className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">{session.user?.name}</h2>
                  <p className="text-sm text-muted-foreground">{session.user?.email}</p>
                </div>

                <Badge variant={userRole === "ADMIN" || userRole === "SUPER_ADMIN" ? "default" : "secondary"} className="mt-2">
                  <Shield className="mr-1 h-3 w-3" />
                  {userRole === "SUPER_ADMIN" ? "Super Admin" : userRole === "ADMIN" ? "Administrator" : "Pengguna"}
                </Badge>
              </CardContent>
            </Card>

            {/* Details Card */}
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Detail Akun</CardTitle>
                  <CardDescription>Informasi lengkap tentang akun Anda</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditDialogOpen(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPasswordDialogOpen(true)}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Ganti Password
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Nama Lengkap</p>
                      <p className="text-base font-semibold">{session.user?.name || "-"}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="text-base font-semibold">{session.user?.email || "-"}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Nomor Telepon</p>
                      <p className="text-base font-semibold">{(session.user as any)?.phone || "Belum diisi"}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Role</p>
                      <p className="text-base font-semibold">
                        {userRole === "SUPER_ADMIN" ? "Super Administrator" : userRole === "ADMIN" ? "Administrator" : "Pengguna Reguler"}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Member Sejak</p>
                      <p className="text-base font-semibold">
                        {new Date().toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Aksi Cepat</CardTitle>
                <CardDescription>Navigasi cepat ke halaman penting</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Link href="/bookings">
                  <Button variant="outline" className="w-full justify-start h-auto py-4">
                    <Calendar className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Riwayat Booking</div>
                      <div className="text-xs text-muted-foreground">Lihat semua booking Anda</div>
                    </div>
                  </Button>
                </Link>

                <Link href="/rooms">
                  <Button variant="outline" className="w-full justify-start h-auto py-4">
                    <MapPin className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Cari Kamar</div>
                      <div className="text-xs text-muted-foreground">Jelajahi kamar tersedia</div>
                    </div>
                  </Button>
                </Link>

                {(userRole === "ADMIN" || userRole === "SUPER_ADMIN") && (
                  <Link href="/admin">
                    <Button variant="outline" className="w-full justify-start h-auto py-4">
                      <Shield className="mr-3 h-5 w-5" />
                      <div className="text-left">
                        <div className="font-semibold">Admin Dashboard</div>
                        <div className="text-xs text-muted-foreground">Kelola sistem</div>
                      </div>
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Perbarui informasi profile Anda
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateProfile}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nama Lengkap</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Nomor Telepon</Label>
                <Input
                  id="edit-phone"
                  placeholder="+62 812-3456-7890"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={updateProfileMutation.isPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ganti Password</DialogTitle>
            <DialogDescription>
              Masukkan password lama dan password baru Anda
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Password Lama</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Password Baru</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  required
                  minLength={8}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsPasswordDialogOpen(false)
                  setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  })
                }}
                disabled={changePasswordMutation.isPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={changePasswordMutation.isPending}>
                {changePasswordMutation.isPending ? "Mengubah..." : "Ubah Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upload Photo Dialog */}
      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ganti Foto Profile</DialogTitle>
            <DialogDescription>
              Upload foto profile baru Anda (Maksimal 2MB)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-4">
              {photoPreview ? (
                <Avatar className="h-32 w-32 border-4 border-primary/20">
                  <AvatarImage src={photoPreview} alt="Preview" />
                </Avatar>
              ) : (
                <Avatar className="h-32 w-32 border-4 border-primary/20">
                  <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary text-3xl font-semibold">
                    {getInitials(session?.user?.name)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex flex-col items-center gap-2 w-full max-w-xs">
                <label className="w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    id="photo-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 cursor-pointer"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Pilih File
                  </Button>
                </label>
                {selectedFileName && (
                  <p className="text-xs text-gray-600 text-center font-medium truncate w-full max-w-xs">
                    {selectedFileName}
                  </p>
                )}
                {!selectedFileName && (
                  <p className="text-xs text-gray-400 text-center">
                    Belum ada file dipilih
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsPhotoDialogOpen(false)
                setPhotoPreview(null)
                setSelectedFileName(null)
              }}
              disabled={uploadPhotoMutation.isPending}
            >
              Batal
            </Button>
            <Button
              onClick={handleUploadPhoto}
              disabled={!photoPreview || uploadPhotoMutation.isPending}
            >
              {uploadPhotoMutation.isPending ? "Mengupload..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

