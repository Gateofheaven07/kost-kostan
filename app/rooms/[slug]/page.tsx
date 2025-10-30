import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import { Wifi, Users, DoorOpen, MapPin } from "lucide-react"

interface RoomDetailPageProps {
  params: Promise<{ slug: string }>
}

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const { slug } = await params

  const room = await prisma.room.findUnique({
    where: { slug },
    include: {
      images: true,
      prices: true,
      kost: true,
    },
  })

  if (!room) {
    notFound()
  }

  const facilities = JSON.parse(room.facilities || "[]")

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="mb-6 text-sm text-muted-foreground">
            <Link href="/rooms" className="hover:text-primary">
              Kamar
            </Link>
            {" / "}
            <span>{room.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Images */}
            <div className="lg:col-span-2">
              <div className="relative h-96 bg-muted rounded-lg overflow-hidden mb-4">
                {room.mainImageUrl ? (
                  <Image src={room.mainImageUrl || "/placeholder.svg"} alt={room.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <DoorOpen className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>

              {room.images.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {room.images.map((image) => (
                    <div key={image.id} className="relative h-20 bg-muted rounded">
                      <Image
                        src={image.url || "/placeholder.svg"}
                        alt={image.alt || "Kamar"}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Details */}
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Deskripsi Kamar</h2>
                <div className="space-y-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span>Kapasitas: {room.capacity} orang</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wifi className="h-5 w-5" />
                    <span>Ukuran: {room.size}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span>Lantai: {room.floor}</span>
                  </div>
                </div>

                {facilities.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-bold mb-3">Fasilitas Kamar</h3>
                    <div className="flex flex-wrap gap-2">
                      {facilities.map((facility: string) => (
                        <Badge key={facility} variant="secondary">
                          {facility}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>{room.name}</CardTitle>
                  <CardDescription>{room.kost.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Prices */}
                  <div>
                    <h3 className="font-bold mb-3">Harga Sewa</h3>
                    <div className="space-y-2">
                      {room.prices.map((price) => (
                        <div key={price.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {price.period === "WEEK"
                              ? "Mingguan"
                              : price.period === "MONTH"
                                ? "Bulanan"
                                : price.period === "3MO"
                                  ? "3 Bulan"
                                  : price.period === "6MO"
                                    ? "6 Bulan"
                                    : "12 Bulan"}
                          </span>
                          <span className="font-bold">Rp {price.amount.toLocaleString("id-ID")}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link href={`/booking?roomId=${room.id}`} className="w-full">
                    <Button className="w-full">Mulai Sewa</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
