import { requireAuth } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface BookingDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { id } = await params
  const session = await requireAuth()

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { room: { include: { kost: true } } },
  })

  if (!booking || booking.userId !== session.user.id) {
    notFound()
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/bookings" className="text-primary hover:underline mb-4 inline-block">
            ← Kembali ke Booking Saya
          </Link>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{booking.room.name}</CardTitle>
                  <CardDescription>{booking.room.kost.name}</CardDescription>
                </div>
                <Badge
                  variant={
                    booking.status === "CONFIRMED"
                      ? "default"
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
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Booking ID</p>
                  <p className="font-mono text-sm">{booking.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal Booking</p>
                  <p className="font-bold">{new Date(booking.createdAt).toLocaleDateString("id-ID")}</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-bold mb-4">Detail Sewa</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tanggal Mulai</p>
                    <p className="font-bold">{new Date(booking.startDate).toLocaleDateString("id-ID")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tanggal Selesai</p>
                    <p className="font-bold">{new Date(booking.endDate).toLocaleDateString("id-ID")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Periode</p>
                    <p className="font-bold">
                      {booking.period === "WEEK"
                        ? "Mingguan"
                        : booking.period === "MONTH"
                          ? "Bulanan"
                          : booking.period === "3MO"
                            ? "3 Bulan"
                            : booking.period === "6MO"
                              ? "6 Bulan"
                              : "12 Bulan"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Harga</p>
                    <p className="font-bold">Rp {booking.totalPrice.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              </div>

              {booking.notes && (
                <div className="border-t pt-6">
                  <h3 className="font-bold mb-2">Catatan</h3>
                  <p className="text-muted-foreground">{booking.notes}</p>
                </div>
              )}

              <div className="border-t pt-6">
                <h3 className="font-bold mb-4">Informasi Kontak Kost</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Telepon:</span> {booking.room.kost.contactPhone}
                  </p>
                  <p>
                    <span className="text-muted-foreground">WhatsApp:</span> {booking.room.kost.contactWhatsApp}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Email:</span> {booking.room.kost.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
