import type React from "react"
import { requireAdmin } from "@/lib/auth-utils"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Toaster } from "@/components/ui/toaster"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1">{children}</main>
      <Toaster />
    </div>
  )
}
