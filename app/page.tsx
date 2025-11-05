import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { RoomsCarousel } from "@/components/rooms-carousel"
import { MapPin, Wifi, Shield, Users, Bed, Bath, Square, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section - Unified Design dengan Gradient Elegant */}
        <section className="min-h-[90vh] bg-gradient-to-br from-white via-gray-50 to-white relative overflow-hidden">
          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Side - Content */}
              <div className="space-y-8">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="text-gray-900">Temukan</span>
                  <br />
                  <span className="text-gray-900">Kamar Kost,</span>
                  <br />
                  <span className="text-red-600">impian Anda.</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-xl">
                Buat keputusan makin cepat dan tepat. AKA Kost jadi solusi lengkap buat kamu yang lagi cari kamar kost, fasilitasnya lengkap, harganya ramah di kantong, dan proses booking-nya anti ribet.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/rooms">
                    <Button className="bg-gray-900 text-white hover:bg-gray-800 rounded-lg px-8 py-6 text-base font-medium flex items-center gap-2 h-auto shadow-lg hover:shadow-xl transition-all">
                      Lihat Kamar Tersedia
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button variant="outline" className="border-2 border-red-600 text-red-600 hover:bg-red-50 rounded-lg px-8 py-6 text-base font-medium h-auto transition-all">
                      Apa itu Aka Kost?
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Side - Elegant 3D Cards dengan Shadow yang Halus */}
              <div className="relative lg:h-[600px] flex items-center justify-center">
                {/* Premium Room Card - Main Focus */}
                <div className="relative z-20 transform hover:scale-105 transition-transform duration-300">
                  <Card className="bg-white shadow-2xl border border-gray-100 w-72 rounded-xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-br from-red-50 to-white pb-3">
                      <div className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">Tipe Kamar</div>
                      <CardTitle className="text-2xl font-bold text-gray-900">Premium Room</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-3 text-sm text-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-red-600/10 flex items-center justify-center">
                            <Bed className="h-4 w-4 text-red-600" />
                          </div>
                          <span className="font-medium">Kamar Tidur</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-red-600/10 flex items-center justify-center">
                            <Bath className="h-4 w-4 text-red-600" />
                          </div>
                          <span className="font-medium">Kamar Mandi</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-red-600/10 flex items-center justify-center">
                            <Square className="h-4 w-4 text-red-600" />
                          </div>
                          <span className="font-medium">20 m²</span>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-red-600">Rp 2.500.000</span>
                          <span className="text-xs text-gray-500">/bulan</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Status Card - Bottom Left dengan elegant shadow */}
                <div className="absolute bottom-0 left-0 z-10 transform rotate-[-3deg] hover:rotate-[-1deg] transition-transform duration-300">
                  <Card className="bg-gradient-to-br from-blue-600 to-blue-700 shadow-xl border-0 w-56 text-white rounded-xl overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="text-xs text-white/80 font-medium mb-2 uppercase tracking-wide">Status</div>
                      <CardTitle className="text-xl font-bold">Tersedia</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="text-sm text-white/90 mb-4">
                        <p>Siap untuk ditinggali</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs bg-white/20 rounded-lg px-3 py-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="font-medium">Booking Sekarang</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Features Card - Top Right */}
                <div className="absolute top-0 right-0 z-10 transform rotate-[3deg] hover:rotate-[1deg] transition-transform duration-300">
                  <Card className="bg-gradient-to-br from-red-600 to-red-700 shadow-xl border-0 w-56 text-white rounded-xl overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="text-xs text-white/80 font-medium mb-2 uppercase tracking-wide">Fasilitas</div>
                      <CardTitle className="text-xl font-bold">Lengkap & Nyaman</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-3">
                      <div className="space-y-2 text-sm text-white/90">
                        <div className="flex items-center gap-2">
                          <Wifi className="h-4 w-4" />
                          <span>WiFi Gratis</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          <span>Keamanan 24/7</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>Lokasi Strategis</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Process Card - Bottom Right */}
                <div className="absolute bottom-20 right-10 z-10 transform rotate-[2deg] hover:rotate-[0deg] transition-transform duration-300">
                  <Card className="bg-white shadow-xl border border-gray-100 w-60 rounded-xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-br from-gray-50 to-white pb-3">
                      <div className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">Proses Booking</div>
                      <CardTitle className="text-xl font-bold text-gray-900">Mudah & Cepat</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-3">
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                          <span className="font-medium">Pilih Kamar</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                          <span className="font-medium">Isi Data</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                          <span className="font-medium">Konfirmasi</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Decorative Elements - Subtle Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-5" style={{ zIndex: 5 }}>
                  <line x1="10%" y1="30%" x2="25%" y2="30%" stroke="gray" strokeWidth="2" />
                  <line x1="70%" y1="15%" x2="85%" y2="15%" stroke="gray" strokeWidth="2" />
                  <line x1="20%" y1="75%" x2="35%" y2="75%" stroke="gray" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Rooms Carousel Section */}
        <RoomsCarousel />

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">
              Mengapa Memilih Kami?
            </h2>
            <p className="text-lg text-gray-600 text-center mb-16 max-w-2xl mx-auto">
              Solusi lengkap untuk kebutuhan kost Anda dengan layanan terbaik
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="border border-gray-100 hover:border-red-600/30 transition-all hover:shadow-xl rounded-xl overflow-hidden group">
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <MapPin className="h-7 w-7 text-red-600" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Lokasi Strategis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Kamar kost di lokasi terbaik dengan akses mudah ke transportasi umum dan pusat kota.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-100 hover:border-red-600/30 transition-all hover:shadow-xl rounded-xl overflow-hidden group">
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Wifi className="h-7 w-7 text-red-600" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Fasilitas Lengkap</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    WiFi gratis, listrik, air, dan fasilitas umum yang nyaman untuk kenyamanan maksimal.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-100 hover:border-red-600/30 transition-all hover:shadow-xl rounded-xl overflow-hidden group">
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Shield className="h-7 w-7 text-red-600" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Aman & Terpercaya</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Sistem keamanan terjamin dengan pengelola yang profesional dan terpercaya.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-100 hover:border-red-600/30 transition-all hover:shadow-xl rounded-xl overflow-hidden group">
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Users className="h-7 w-7 text-red-600" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Komunitas Baik</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Bergabung dengan komunitas penghuni yang ramah dan suportif untuk pengalaman terbaik.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-gray-50 via-white to-gray-50 py-20 relative overflow-hidden">
          {/* Subtle Pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Siap Mencari Kamar?
            </h2>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
              Jelajahi koleksi kamar kost kami dan temukan tempat tinggal yang sempurna untuk Anda.
            </p>
            <Link href="/rooms">
              <Button className="bg-gray-900 text-white hover:bg-gray-800 rounded-lg px-8 py-6 text-base font-medium flex items-center gap-2 mx-auto h-auto shadow-lg hover:shadow-xl transition-all">
                Mulai Pencarian
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}