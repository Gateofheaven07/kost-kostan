import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DoorOpen, Calendar, CheckCircle, Clock } from "lucide-react"

export default async function AdminDashboard() {
  const [totalRooms, pendingBookings, confirmedBookings, totalUsers] = await Promise.all([
    prisma.room.count(),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.user.count({ where: { role: "USER" } }),
  ])

  const stats = [
    { label: "Total Kamar", value: totalRooms, icon: DoorOpen },
    { label: "Booking Menunggu", value: pendingBookings, icon: Clock },
    { label: "Booking Dikonfirmasi", value: confirmedBookings, icon: CheckCircle },
    { label: "Total Penyewa", value: totalUsers, icon: Calendar },
  ]

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard Admin</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
