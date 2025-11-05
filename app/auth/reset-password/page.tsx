"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [valid, setValid] = useState(false)
  const [token, setToken] = useState("")
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (tokenParam) {
      setToken(tokenParam)
      validateToken(tokenParam)
    } else {
      setValidating(false)
      setValid(false)
    }
  }, [searchParams])

  const validateToken = async (token: string) => {
    try {
      const response = await fetch(`/api/auth/reset-password?token=${token}`)
      const data = await response.json()

      if (response.ok && data.valid) {
        setValid(true)
      } else {
        setValid(false)
        toast({
          title: "Token tidak valid",
          description: data.error || "Link reset password tidak valid atau sudah kedaluwarsa.",
          variant: "destructive",
        })
      }
    } catch (error) {
      setValid(false)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memvalidasi token.",
        variant: "destructive",
      })
    } finally {
      setValidating(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Password dan konfirmasi password tidak cocok.",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password minimal 6 karakter.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Password berhasil diubah. Silakan login dengan password baru.",
        })
        router.push("/auth/signin")
      } else {
        toast({
          title: "Error",
          description: data.error || "Gagal mengubah password",
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
      setLoading(false)
    }
  }

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-primary mb-4"></div>
              <p className="text-sm text-muted-foreground">Memvalidasi token...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Token Tidak Valid</CardTitle>
            <CardDescription>
              Link reset password tidak valid atau sudah kedaluwarsa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/forgot-password">
              <Button className="w-full">Minta Link Baru</Button>
            </Link>
            <div className="mt-4 text-center text-sm">
              <Link href="/auth/signin" className="text-primary hover:underline">
                Kembali ke Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/auth/signin">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Masukkan password baru Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Password Baru</label>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Konfirmasi Password</label>
              <Input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Mengubah..." : "Ubah Password"}
            </Button>

            <div className="text-center text-sm">
              <Link href="/auth/signin" className="text-primary hover:underline">
                Kembali ke Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

