import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import Image from "next/image"
import { Building2, MapPin, Phone, Mail, MessageCircle, CheckCircle2, Sparkles, Users, Shield } from "lucide-react"

// Make this page dynamic to avoid build-time database access
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AboutPage() {
  // Fetch kost and owner data with error handling
  let kost = null
  let owner = null
  
  try {
    kost = await prisma.kost.findFirst()
    owner = await prisma.owner.findFirst()
  } catch (error) {
    console.error("Error fetching kost/owner data:", error)
    // Continue with null values, page will still render without data
  }

  // Parse facilities dengan handle nested array
  let facilities: string[] = []
  if (kost) {
    try {
      let parsed = JSON.parse(kost.facilities || "[]")
      // Handle nested arrays
      while (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0])) {
        parsed = parsed[0]
      }
      // Ensure it's an array of strings
      if (Array.isArray(parsed)) {
        facilities = parsed
          .flat()
          .filter((f: any) => f && typeof f === "string" && f.trim() !== "")
          .map((f: string) => f.trim())
      } else if (typeof parsed === "string") {
        facilities = [parsed]
      }
    } catch {
      facilities = []
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
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 mb-6 shadow-xl">
                <Building2 className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
                Tentang <span className="text-red-600">Kami</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Solusi terpadu untuk kebutuhan kost Anda dengan pelayanan terbaik dan fasilitas lengkap
              </p>
            </div>
          </div>
        </section>

        {/* Kost Info Section */}
        {kost && (
          <section className="pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-2xl rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-red-50 via-white to-white pb-8 pt-8">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg">
                      <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        {kost.name}
                      </CardTitle>
                      <CardDescription className="text-lg text-gray-600 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-red-600" />
                        {kost.address}, {kost.city}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-8 space-y-8">
                  {/* About Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="h-6 w-6 text-red-600" />
                      <h2 className="text-2xl font-bold text-gray-900">Tentang Kost</h2>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                      {kost.description}
                    </p>
                  </div>

                  {/* Rules Section */}
                  <div className="space-y-4 pt-8 border-t border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="h-6 w-6 text-red-600" />
                      <h2 className="text-2xl font-bold text-gray-900">Peraturan</h2>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                      <p className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">
                        {kost.rules}
                      </p>
                    </div>
                  </div>

                  {/* Facilities Section */}
                  {facilities.length > 0 && (
                    <div className="space-y-6 pt-8 border-t border-gray-200">
                      <div className="flex items-center gap-3 mb-6">
                        <CheckCircle2 className="h-6 w-6 text-red-600" />
                        <h2 className="text-2xl font-bold text-gray-900">Fasilitas Umum</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {facilities.map((facility: string, index: number) => (
                          <div
                            key={index}
                            className="bg-gradient-to-br from-red-50 to-white border border-red-100 rounded-xl p-4 flex items-center gap-3 hover:shadow-lg transition-all group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <CheckCircle2 className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-semibold text-gray-900">{facility}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-200">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-center gap-3 mb-3">
                        <Phone className="h-5 w-5 text-blue-600" />
                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Telepon</p>
                      </div>
                      <p className="font-bold text-lg text-gray-900">{kost.contactPhone}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-6 border border-green-200">
                      <div className="flex items-center gap-3 mb-3">
                        <MessageCircle className="h-5 w-5 text-green-600" />
                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">WhatsApp</p>
                      </div>
                      <p className="font-bold text-lg text-gray-900">{kost.contactWhatsApp}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-6 border border-purple-200">
                      <div className="flex items-center gap-3 mb-3">
                        <Mail className="h-5 w-5 text-purple-600" />
                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Email</p>
                      </div>
                      <p className="font-bold text-lg text-gray-900">{kost.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Owner Info Section */}
        {owner && (
          <section className="pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 mb-4 shadow-xl">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                  Pemilik <span className="text-red-600">Kost</span>
                </h2>
              </div>

              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-2xl rounded-2xl overflow-hidden">
                <CardContent className="p-8 md:p-12">
                  <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                    {owner.photoUrl && (
                      <div className="flex-shrink-0">
                        <div className="relative h-64 w-64 md:h-80 md:w-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-white ring-4 ring-red-100">
                          <Image
                            src={owner.photoUrl || "/placeholder.svg"}
                            alt={owner.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex-1 space-y-6">
                      <div>
                        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{owner.name}</h3>
                        <div className="w-20 h-1 bg-gradient-to-r from-red-600 to-red-400 rounded-full mb-6"></div>
                        <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                          {owner.bio}
                        </p>
                      </div>

                      <div className="space-y-4 pt-6 border-t border-gray-200">
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200">
                          <p className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">Telepon</p>
                          <p className="font-bold text-lg text-gray-900">{owner.phone}</p>
                        </div>
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200">
                          <p className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">Email</p>
                          <p className="font-bold text-lg text-gray-900">{owner.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
