"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, DoorOpen, Calendar, Users, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/rooms", label: "Kamar", icon: DoorOpen },
  { href: "/admin/bookings", label: "Booking", icon: Calendar },
  { href: "/admin/tenants", label: "Penyewa", icon: Users },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-muted/50 min-h-screen">
      <div className="p-6">
        <h2 className="font-bold text-lg">Admin Panel</h2>
      </div>
      <nav className="space-y-2 px-3">
        {menuItems.map((item) => {
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
    </aside>
  )
}
