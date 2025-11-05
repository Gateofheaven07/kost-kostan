"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSent(true)
        toast({
          title: "Email terkirim",
          description: "Jika email terdaftar, kami telah mengirimkan link reset password ke email Anda.",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Gagal mengirim email reset password",
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
          <div className="flex items-center gap-2 mb-2">
            <Link href="/auth/signin">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <CardTitle>Lupa Password</CardTitle>
          <CardDescription>
            {sent
              ? "Kami telah mengirimkan link reset password ke email Anda. Silakan cek email Anda."
              : "Masukkan email Anda untuk menerima link reset password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  Link reset password telah dikirim ke <strong>{email}</strong>. Silakan cek inbox email Anda. Jika tidak ada, cek juga folder spam.
                </p>
              </div>
              <div className="flex gap-2">
                <Link href="/auth/signin" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Kembali ke Login
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSent(false)
                    setEmail("")
                  }}
                >
                  Kirim Ulang
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Mengirim..." : "Kirim Link Reset Password"}
              </Button>

              <div className="text-center text-sm">
                <Link href="/auth/signin" className="text-primary hover:underline">
                  Kembali ke Login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

