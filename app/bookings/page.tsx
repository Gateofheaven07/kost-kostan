import { requireAuth } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default async function BookingsPage() {
  const session = await requireAuth()

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    include: { room: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-8">Booking Saya</h1>

          {bookings.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">Anda belum memiliki booking</p>
                <Link href="/rooms">
                  <Button>Lihat Kamar</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{booking.room.name}</CardTitle>
                        <CardDescription>Booking ID: {booking.id}</CardDescription>
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
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Tanggal Mulai</p>
                        <p className="font-bold">{new Date(booking.startDate).toLocaleDateString("id-ID")}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tanggal Selesai</p>
                        <p className="font-bold">{new Date(booking.endDate).toLocaleDateString("id-ID")}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Harga</p>
                        <p className="font-bold">Rp {booking.totalPrice.toLocaleString("id-ID")}</p>
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
                    </div>
                    {booking.notes && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">Catatan</p>
                        <p className="text-sm">{booking.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
