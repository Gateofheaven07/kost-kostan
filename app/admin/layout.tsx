import type React from "react"
import { requireAdmin } from "@/lib/auth-utils"
import { AdminSidebar } from "@/components/admin-sidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1">{children}</main>
    </div>
  )
}
