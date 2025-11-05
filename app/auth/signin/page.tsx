"use client"

import type React from "react"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function SignInPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        router.push("/")
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      })

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Akun berhasil dibuat. Silakan login.",
        })
        setIsSignUp(false)
        setFormData({ name: "", email: "", phone: "", password: "" })
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Gagal membuat akun",
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isSignUp ? "Daftar Akun" : "Masuk"}</CardTitle>
          <CardDescription>{isSignUp ? "Buat akun baru untuk memulai" : "Masuk ke akun Anda"}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">Nama</label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nama Anda"
                    required={isSignUp}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Nomor Telepon</label>
                  <Input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+62 812-3456-7890"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Password</label>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
              {!isSignUp && (
                <div className="mt-2 text-right">
                  <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                    Lupa password?
                  </Link>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Memproses..." : isSignUp ? "Daftar" : "Masuk"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            {isSignUp ? (
              <>
                Sudah punya akun?{" "}
                <button onClick={() => setIsSignUp(false)} className="text-primary hover:underline">
                  Masuk di sini
                </button>
              </>
            ) : (
              <>
                Belum punya akun?{" "}
                <button onClick={() => setIsSignUp(true)} className="text-primary hover:underline">
                  Daftar di sini
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
