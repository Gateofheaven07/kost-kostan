import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Wifi, Users, Shield, MapPin } from "lucide-react"

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Temukan Kamar Kost Impian Anda</h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
                Platform terpercaya untuk menemukan dan menyewa kamar kost dengan harga terjangkau dan fasilitas
                lengkap.
              </p>
              <Link href="/rooms">
                <Button size="lg">Lihat Kamar Tersedia</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Mengapa Memilih Kami?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <MapPin className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Lokasi Strategis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Kamar kost di lokasi terbaik dengan akses mudah ke transportasi umum.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Wifi className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Fasilitas Lengkap</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    WiFi gratis, listrik, air, dan fasilitas umum yang nyaman.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Aman & Terpercaya</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Sistem keamanan terjamin dengan pengelola yang profesional.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Komunitas Baik</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Bergabung dengan komunitas penghuni yang ramah dan suportif.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary/5 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">Siap Mencari Kamar?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Jelajahi koleksi kamar kost kami dan temukan tempat tinggal yang sempurna untuk Anda.
            </p>
            <Link href="/rooms">
              <Button size="lg">Mulai Pencarian</Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
