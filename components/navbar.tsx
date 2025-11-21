"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu, User, History, LogOut, LayoutDashboard, Building2, ChevronDown, Globe, ArrowRight } from "lucide-react"
import { useState } from "react"

export function Navbar() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getInitials = (name?: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 relative">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center shadow-md shadow-red-200">
                <Building2 className="h-5 w-5 text-white" strokeWidth={2.2} />
              </div>
              <span className="font-bold text-xl text-gray-900">
                AKA <span className="text-red-600">KOST</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Center dengan titik pemisah */}
          <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            <Link 
              href="/rooms" 
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors px-3 py-2 flex items-center gap-1 group"
            >
              Kamar
              <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
            </Link>
            <span className="text-gray-400 text-xs">•</span>
            <Link 
              href="/about" 
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors px-3 py-2 flex items-center gap-1 group"
            >
              Tentang
              <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
            </Link>
            <span className="text-gray-400 text-xs">•</span>
            <Link 
              href="/contact" 
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors px-3 py-2 flex items-center gap-1 group"
            >
              Kontak
              <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
            </Link>
            {session && (
              <>
                <span className="text-gray-400 text-xs">•</span>
                <Link 
                  href="/bookings" 
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors px-3 py-2 flex items-center gap-1 group"
                >
                  Booking
                  <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Link>
              </>
            )}
          </div>

          {/* Right Side - Globe & Auth */}
          <div className="hidden md:flex items-center gap-3">
            <button className="text-gray-700 hover:text-gray-900 p-2 transition-colors">
              <Globe className="h-5 w-5" />
            </button>
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    type="button"
                    className="relative h-10 w-10 rounded-full hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                  >
                    <Avatar className="h-10 w-10 border-2 border-gray-200 transition-all hover:border-gray-300">
                      <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                      <AvatarFallback className="bg-gray-100 text-gray-900 font-semibold">
                        {getInitials(session.user?.name)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                      <p className="text-xs leading-none text-gray-500">
                        {session.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {((session.user as any)?.role === "ADMIN" || (session.user as any)?.role === "SUPER_ADMIN") && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>Admin Kost</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Lihat Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/bookings" className="cursor-pointer">
                      <History className="mr-2 h-4 w-4" />
                      <span>Riwayat Booking</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/signin">
                <Button className="bg-gray-900 text-white hover:bg-gray-800 rounded-md px-6 h-9 text-sm font-medium flex items-center gap-2">
                  Masuk
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden relative z-50">
            <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button 
                  type="button"
                  className="inline-flex items-center justify-center rounded-full h-10 w-10 relative z-50 hover:bg-accent transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 z-50">
                <DropdownMenuItem asChild>
                  <Link href="/rooms" className="cursor-pointer">Lihat Kamar</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/about" className="cursor-pointer">Tentang</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/contact" className="cursor-pointer">Kontak</Link>
                </DropdownMenuItem>
                {session ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session.user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {((session.user as any)?.role === "ADMIN" || (session.user as any)?.role === "SUPER_ADMIN") && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>Admin Kost</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Lihat Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/bookings" className="cursor-pointer">
                        <History className="mr-2 h-4 w-4" />
                        <span>Riwayat Booking</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log Out</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/auth/signin" className="cursor-pointer">Masuk</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
