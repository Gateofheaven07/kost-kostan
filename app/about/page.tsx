import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import Image from "next/image"

export default async function AboutPage() {
  // Fetch kost and owner data
  const kost = await prisma.kost.findFirst()
  const owner = await prisma.owner.findFirst()

  const facilities = kost ? JSON.parse(kost.facilities || "[]") : []
  const socials = owner ? JSON.parse(owner.socials || "{}") : {}

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-12 text-center">Tentang Kami</h1>

          {/* Kost Info */}
          {kost && (
            <div className="mb-16">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{kost.name}</CardTitle>
                  <CardDescription>
                    {kost.address}, {kost.city}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-bold mb-2">Tentang Kost</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{kost.description}</p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">Peraturan</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{kost.rules}</p>
                  </div>

                  {facilities.length > 0 && (
                    <div>
                      <h3 className="font-bold mb-3">Fasilitas Umum</h3>
                      <ul className="grid grid-cols-2 gap-2">
                        {facilities.map((facility: string) => (
                          <li key={facility} className="text-sm text-muted-foreground">
                            • {facility}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Telepon</p>
                      <p className="font-bold">{kost.contactPhone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">WhatsApp</p>
                      <p className="font-bold">{kost.contactWhatsApp}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-bold">{kost.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Owner Info */}
          {owner && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Pemilik Kost</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-8">
                    {owner.photoUrl && (
                      <div className="flex-shrink-0">
                        <div className="relative h-48 w-48 rounded-lg overflow-hidden">
                          <Image
                            src={owner.photoUrl || "/placeholder.svg"}
                            alt={owner.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">{owner.name}</h3>
                      <p className="text-muted-foreground mb-4 whitespace-pre-wrap">{owner.bio}</p>

                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="font-bold">Telepon:</span> {owner.phone}
                        </p>
                        <p className="text-sm">
                          <span className="font-bold">Email:</span> {owner.email}
                        </p>
                      </div>

                      {Object.keys(socials).length > 0 && (
                        <div className="mt-4">
                          <p className="font-bold mb-2">Media Sosial</p>
                          <div className="space-y-1">
                            {Object.entries(socials).map(([platform, handle]) => (
                              <p key={platform} className="text-sm text-muted-foreground">
                                {platform}: {handle as string}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
