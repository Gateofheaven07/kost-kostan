import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, CreditCard, Package, User, Mail, Phone, ArrowLeft, Printer } from "lucide-react"

import { PrintButton } from "./print-button"

interface AdminBookingDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function AdminBookingDetailPage({ params }: AdminBookingDetailPageProps) {
  const { id } = await params
  await requireAdmin()

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      room: { include: { kost: true } },
      user: { include: { tenantProfile: true } },
      payment: true
    },
  })

  if (!booking) {
    notFound()
  }

  const startDate = new Date(booking.startDate)
  const endDate = new Date(booking.endDate)
  const createdDate = new Date(booking.createdAt)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href="/admin/bookings">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
        </Link>
        <PrintButton />
      </div>

      <div className="bg-white border rounded-xl shadow-sm p-8 print:shadow-none print:border-none">
        {/* Header Invoice */}
        <div className="flex justify-between items-start border-b pb-8 mb-8">
          <div className="flex gap-4">
            <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-muted">
              {booking.room.mainImageUrl ? (
                <Image
                  src={booking.room.mainImageUrl}
                  alt={booking.room.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full text-muted-foreground">
                  No Image
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-red-600 mb-1">{booking.room.name}</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <span className="text-sm">Lantai {booking.room.floor}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">{booking.room.kost.name}</p>
            </div>
          </div>
          <div className="text-right">
            <Badge
              className="mb-2"
              variant={
                booking.status === "CONFIRMED"
                  ? "default" // green-like usually
                  : booking.status === "CANCELLED"
                  ? "destructive"
                  : "secondary"
              }
            >
              {booking.status === "PENDING"
                ? "Menunggu Konfirmasi"
                : booking.status === "CONFIRMED"
                ? "Dikonfirmasi"
                : "Dibatalkan"}
            </Badge>
            <p className="text-sm text-muted-foreground">Invoice #{booking.payment?.orderId || "-"}</p>
            <p className="text-sm text-muted-foreground">ID Booking: {booking.id}</p>
          </div>
        </div>

        {/* Informasi Penyewa */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Informasi Penyewa</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Nama Penyewa</p>
                <p className="font-medium">{booking.user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border">
                <Mail className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium">{booking.user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border">
                <Phone className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Nomor Telepon</p>
                <p className="font-medium">{booking.user.phone || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Detail */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Mulai */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center">
                <CalendarDays className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-semibold text-blue-700 uppercase">Mulai</span>
            </div>
            <p className="font-bold text-gray-900 text-lg">{formatDate(startDate)}</p>
          </div>

          {/* Selesai */}
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-purple-500 flex items-center justify-center">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-semibold text-purple-700 uppercase">Selesai</span>
            </div>
            <p className="font-bold text-gray-900 text-lg">{formatDate(endDate)}</p>
          </div>

          {/* Total Harga */}
          <div className="bg-green-50 p-4 rounded-xl border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-green-500 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-semibold text-green-700 uppercase">Total Harga</span>
            </div>
            <p className="font-bold text-gray-900 text-lg">{formatCurrency(booking.totalPrice)}</p>
          </div>

          {/* Periode */}
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
                <Package className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-semibold text-orange-700 uppercase">Periode</span>
            </div>
            <p className="font-bold text-gray-900 text-lg">
              {booking.period === "MONTH"
                ? "1 Bulan"
                : booking.period === "6MO"
                ? "6 Bulan"
                : "1 Tahun"}
            </p>
          </div>
        </div>

        {/* Catatan */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2 text-gray-500">
            <span className="font-medium">Catatan</span>
          </div>
          <p className="text-gray-900">{booking.notes || "Tidak ada catatan"}</p>
        </div>

        {/* Payment Info Details if available */}
        {booking.payment && (
          <div className="mt-8 border-t pt-6">
             <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Detail Transaksi</h3>
             <div className="grid grid-cols-2 gap-4 text-sm">
               <div className="flex justify-between py-2 border-b border-dashed">
                 <span className="text-muted-foreground">Metode Pembayaran</span>
                 <span className="font-medium">{booking.payment.paymentType || "-"}</span>
               </div>
               <div className="flex justify-between py-2 border-b border-dashed">
                 <span className="text-muted-foreground">Status Transaksi</span>
                 <span className="font-medium uppercase">{booking.payment.status}</span>
               </div>
               <div className="flex justify-between py-2 border-b border-dashed">
                 <span className="text-muted-foreground">Waktu Transaksi</span>
                 <span className="font-medium">{formatDate(booking.payment.createdAt)}</span>
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}

