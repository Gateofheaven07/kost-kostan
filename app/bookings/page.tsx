import { requireAuth } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, DollarSign, MapPin, Package, FileText, ArrowRight, CheckCircle2, XCircle, Hourglass } from "lucide-react"
import Image from "next/image"

// Make this page dynamic to avoid build-time database access
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function BookingsPage() {
  const session = await requireAuth()

  let bookings = []
  
  try {
    bookings = await prisma.booking.findMany({
      where: { userId: session.user.id },
      include: { room: true },
      orderBy: { createdAt: "desc" },
    })
  } catch (error) {
    console.error("Error fetching bookings:", error)
    // Continue with empty array, page will still render
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "CANCELLED":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Hourglass className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-gradient-to-r from-green-50 to-green-100 border-green-200 text-green-800"
      case "CANCELLED":
        return "bg-gradient-to-r from-red-50 to-red-100 border-red-200 text-red-800"
      default:
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-800"
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          {/* Subtle Pattern Background */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 mb-6 shadow-xl">
                <Package className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
                Booking <span className="text-red-600">Saya</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Kelola semua booking kamar kost Anda di satu tempat
              </p>
            </div>
          </div>
        </section>

        {/* Bookings Section */}
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {bookings.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-2xl rounded-2xl overflow-hidden">
                <CardContent className="pt-12 pb-12 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 mb-6">
                    <Package className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Belum Ada Booking</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Mulai jelajahi kamar kost yang tersedia dan lakukan booking pertama Anda
                  </p>
                  <Link href="/rooms">
                    <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                      Lihat Kamar Tersedia
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {bookings.map((booking) => (
                  <Card
                    key={booking.id}
                    className="bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-red-600/50 transition-all shadow-xl rounded-2xl overflow-hidden group"
                  >
                    {/* Header with Status */}
                    <CardHeader className="bg-gradient-to-br from-gray-50 to-white pb-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="relative h-16 w-16 rounded-xl overflow-hidden border-2 border-gray-200">
                              {booking.room.mainImageUrl ? (
                                <Image
                                  src={booking.room.mainImageUrl}
                                  alt={booking.room.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                                  <Package className="h-8 w-8 text-red-600" />
                                </div>
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                                {booking.room.name}
                              </CardTitle>
                              <CardDescription className="text-base flex items-center gap-2 mt-1">
                                <MapPin className="h-4 w-4" />
                                Lantai {booking.room.floor}
                              </CardDescription>
                            </div>
                          </div>
                        </div>
                        <Badge
                          className={`${getStatusColor(booking.status)} px-4 py-2 text-sm font-semibold border-2 flex items-center gap-2 w-fit`}
                        >
                          {getStatusIcon(booking.status)}
                          {booking.status === "PENDING"
                            ? "Menunggu Konfirmasi"
                            : booking.status === "CONFIRMED"
                              ? "Dikonfirmasi"
                              : "Dibatalkan"}
                        </Badge>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Booking ID
                        </p>
                        <p className="text-sm font-mono text-gray-700 mt-1">{booking.id}</p>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6">
                      {/* Booking Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-5 border border-blue-200">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                              <Calendar className="h-5 w-5 text-white" />
                            </div>
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Mulai
                            </p>
                          </div>
                          <p className="font-bold text-lg text-gray-900">
                            {new Date(booking.startDate).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-5 border border-purple-200">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                              <Clock className="h-5 w-5 text-white" />
                            </div>
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Selesai
                            </p>
                          </div>
                          <p className="font-bold text-lg text-gray-900">
                            {new Date(booking.endDate).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-5 border border-green-200">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                              <DollarSign className="h-5 w-5 text-white" />
                            </div>
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Total Harga
                            </p>
                          </div>
                          <p className="font-bold text-lg text-gray-900">
                            Rp {booking.totalPrice.toLocaleString("id-ID")}
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-5 border border-orange-200">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center">
                              <Package className="h-5 w-5 text-white" />
                            </div>
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Periode
                            </p>
                          </div>
                          <p className="font-bold text-lg text-gray-900">
                            {booking.period === "MONTH"
                              ? "1 Bulan"
                              : booking.period === "6MO"
                                ? "6 Bulan"
                                : "1 Tahun"}
                          </p>
                        </div>
                      </div>

                      {/* Notes Section */}
                      {booking.notes && (
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                          <div className="flex items-center gap-3 mb-3">
                            <FileText className="h-5 w-5 text-gray-600" />
                            <p className="text-sm font-semibold text-gray-700">Catatan</p>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{booking.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
