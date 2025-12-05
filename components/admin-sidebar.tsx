"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { LayoutDashboard, DoorOpen, Calendar, Users, Settings, LogOut, Home, Shield, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, superAdminOnly: false },
  { href: "/admin/rooms", label: "Kamar", icon: DoorOpen, superAdminOnly: false },
  { href: "/admin/bookings", label: "Booking", icon: Calendar, superAdminOnly: false },
  { href: "/admin/tenants", label: "Penyewa", icon: Users, superAdminOnly: false },
  { href: "/admin/messages", label: "Pesan", icon: MessageSquare, superAdminOnly: false },
  { href: "/admin/admins", label: "Admins", icon: Shield, superAdminOnly: true },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings, superAdminOnly: false },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const getInitials = (name?: string | null) => {
    if (!name) return "A"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const userRole = (session?.user as any)?.role || "ADMIN"

  return (
    <aside className="w-64 border-r bg-muted/50 min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Admin Panel
        </h2>
      </div>

      {/* User Info */}
      <div className="p-4 border-b bg-background/50">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(session?.user?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{session?.user?.name || "Admin"}</p>
            <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
            <Badge variant="secondary" className="mt-1 text-xs">
              {userRole === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 px-3 py-4 flex-1">
        {menuItems
          .filter((item) => !item.superAdminOnly || userRole === "SUPER_ADMIN")
          .map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
      </nav>

      <Separator />

      {/* Bottom Actions */}
      <div className="p-3 space-y-2">
        <Link href="/">
          <Button variant="outline" className="w-full justify-start" size="sm">
            <Home className="mr-2 h-4 w-4" />
            Kembali ke Home
          </Button>
        </Link>
        <Button
          variant="destructive"
          className="w-full justify-start"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
