import Link from "next/link"
import { Mail, Phone, MessageCircle } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-muted/50 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold mb-4">Kost</h3>
            <p className="text-sm text-muted-foreground">
              Platform manajemen kost terpadu untuk kemudahan booking dan pengelolaan.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-4">Tautan</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/rooms" className="hover:text-primary">
                  Lihat Kamar
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary">
                  Tentang
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary">
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Hubungi Kami</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+62 812-3456-7890</span>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@kost.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Kost Management. Semua hak dilindungi.</p>
        </div>
      </div>
    </footer>
  )
}
