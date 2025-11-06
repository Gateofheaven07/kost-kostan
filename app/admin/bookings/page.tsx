"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface Booking {
  id: string
  room: { name: string }
  user: { name: string; email: string }
  startDate: string
  endDate: string
  totalPrice: number
  status: string
}

export default function BookingsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: bookings = [], isLoading: loading } = useQuery<Booking[]>({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const response = await fetch("/api/admin/bookings")
      if (!response.ok) throw new Error("Failed to fetch bookings")
      return response.json()
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error("Failed to update booking status")
      return response.json()
    },
    onSuccess: () => {
      toast({ title: "Berhasil", description: "Status booking berhasil diperbarui" })
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal memperbarui status",
        variant: "destructive",
      })
    },
  })

  const updateStatus = (bookingId: string, newStatus: string) => {
    updateStatusMutation.mutate({ bookingId, status: newStatus })
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Kelola Booking</h1>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Booking</CardTitle>
          <CardDescription>Kelola semua booking dari penyewa</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Memuat data...</p>
          ) : bookings.length === 0 ? (
            <p className="text-muted-foreground">Tidak ada booking</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kamar</TableHead>
                    <TableHead>Penyewa</TableHead>
                    <TableHead>Tanggal Mulai</TableHead>
                    <TableHead>Tanggal Selesai</TableHead>
                    <TableHead>Total Harga</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.room.name}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.user.name}</p>
                          <p className="text-sm text-muted-foreground">{booking.user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(booking.startDate).toLocaleDateString("id-ID")}</TableCell>
                      <TableCell>{new Date(booking.endDate).toLocaleDateString("id-ID")}</TableCell>
                      <TableCell>Rp {booking.totalPrice.toLocaleString("id-ID")}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            booking.status === "CONFIRMED"
                              ? "default"
                              : booking.status === "CANCELLED"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {booking.status === "PENDING"
                            ? "Menunggu"
                            : booking.status === "CONFIRMED"
                              ? "Dikonfirmasi"
                              : "Dibatalkan"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {booking.status === "PENDING" && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => updateStatus(booking.id, "CONFIRMED")}
                              disabled={updateStatusMutation.isPending}
                            >
                              Konfirmasi
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateStatus(booking.id, "CANCELLED")}
                              disabled={updateStatusMutation.isPending}
                            >
                              Tolak
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
