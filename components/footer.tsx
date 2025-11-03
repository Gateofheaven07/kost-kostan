import Link from "next/link"
import { Mail, Phone, MessageCircle } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-xl mb-4 text-gray-900"> AKA KOST</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Platform manajemen kost terpadu untuk kemudahan booking dan pengelolaan.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-900">Tautan</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/rooms" className="text-gray-600 hover:text-red-600 transition-colors">
                  Lihat Kamar
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-red-600 transition-colors">
                  Tentang
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-red-600 transition-colors">
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-900">Hubungi Kami</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-red-600" />
                <span>+62 895-1446-1882</span>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-red-600" />
                <span>WhatsApp</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-red-600" />
                <span>akakost@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>&copy; 2025 Aka Kost. Semua hak dilindungi.</p>
        </div>
      </div>
    </footer>
  )
}
