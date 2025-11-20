"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"

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

  const [selectedIds, setSelectedIds] = useState<string[]>([])

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

  const deleteBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "DELETE",
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || "Failed to delete booking")
      }
      return result
    },
    onSuccess: () => {
      toast({ title: "Berhasil", description: "Riwayat booking berhasil dihapus" })
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] })
      // Sinkronkan juga data publik
      queryClient.invalidateQueries({ queryKey: ["rooms"] })
      queryClient.refetchQueries({ queryKey: ["rooms"] })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus booking",
        variant: "destructive",
      })
    },
  })

  const handleDeleteBooking = (bookingId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus riwayat booking ini? Tindakan ini tidak dapat dibatalkan.")) {
      return
    }
    deleteBookingMutation.mutate(bookingId)
  }

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(bookings.map((b) => b.id))
    } else {
      setSelectedIds([])
    }
  }

  const toggleSelectOne = (bookingId: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked === true ? Array.from(new Set([...prev, bookingId])) : prev.filter((id) => id !== bookingId),
    )
  }

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      // Hapus semua booking secara paralel
      const results = await Promise.all(
        ids.map(async (id) => {
          const response = await fetch(`/api/admin/bookings/${id}`, { method: "DELETE" })
          const json = await response.json()
          if (!response.ok) {
            throw new Error(json.error || `Gagal menghapus booking dengan ID ${id}`)
          }
          return json
        }),
      )
      return results
    },
    onSuccess: () => {
      setSelectedIds([])
      toast({ title: "Berhasil", description: "Riwayat booking terpilih berhasil dihapus" })
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] })
      queryClient.invalidateQueries({ queryKey: ["rooms"] })
      queryClient.refetchQueries({ queryKey: ["rooms"] })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus beberapa booking",
        variant: "destructive",
      })
    },
  })

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      toast({
        title: "Info",
        description: "Pilih minimal satu booking yang ingin dihapus.",
      })
      return
    }

    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus ${selectedIds.length} riwayat booking terpilih? Tindakan ini tidak dapat dibatalkan.`,
      )
    ) {
      return
    }

    bulkDeleteMutation.mutate(selectedIds)
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Kelola Booking</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Daftar Booking</CardTitle>
            <CardDescription>Kelola semua booking dari penyewa</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-destructive text-destructive hover:bg-destructive/10"
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending || selectedIds.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Hapus Terpilih
            </Button>
          </div>
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
                    <TableHead className="w-10">
                      <Checkbox
                        aria-label="Pilih semua booking"
                        checked={bookings.length > 0 && selectedIds.length === bookings.length}
                        onCheckedChange={(checked: boolean | "indeterminate") =>
                          toggleSelectAll(checked === true)
                        }
                      />
                    </TableHead>
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
                      <TableCell>
                        <Checkbox
                          aria-label={`Pilih booking ${booking.room.name}`}
                          checked={selectedIds.includes(booking.id)}
                          onCheckedChange={(checked: boolean | "indeterminate") =>
                            toggleSelectOne(booking.id, checked === true)
                          }
                        />
                      </TableCell>
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
                        <div className="flex gap-2">
                          {booking.status === "PENDING" && (
                            <>
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
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-destructive text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteBooking(booking.id)}
                            disabled={deleteBookingMutation.isPending}
                            title="Hapus riwayat booking"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
