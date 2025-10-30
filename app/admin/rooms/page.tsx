"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Room {
  id: string
  name: string
  floor: number
  capacity: number
  isAvailable: boolean
  prices: Array<{ period: string; amount: number }>
}

export default function RoomsPage() {
  const { toast } = useToast()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/admin/rooms")
      if (response.ok) {
        const data = await response.json()
        setRooms(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data kamar",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kamar ini?")) return

    try {
      const response = await fetch(`/api/admin/rooms/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast({ title: "Berhasil", description: "Kamar berhasil dihapus" })
        fetchRooms()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus kamar",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Kelola Kamar</h1>
        <Link href="/admin/rooms/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Kamar
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kamar</CardTitle>
          <CardDescription>Kelola semua kamar di kost Anda</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Memuat data...</p>
          ) : rooms.length === 0 ? (
            <p className="text-muted-foreground">Tidak ada kamar</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Lantai</TableHead>
                    <TableHead>Kapasitas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Harga Bulanan</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room) => {
                    const monthlyPrice = room.prices.find((p) => p.period === "MONTH")?.amount || 0
                    return (
                      <TableRow key={room.id}>
                        <TableCell className="font-medium">{room.name}</TableCell>
                        <TableCell>{room.floor}</TableCell>
                        <TableCell>{room.capacity} orang</TableCell>
                        <TableCell>
                          <Badge variant={room.isAvailable ? "default" : "secondary"}>
                            {room.isAvailable ? "Tersedia" : "Tidak Tersedia"}
                          </Badge>
                        </TableCell>
                        <TableCell>Rp {monthlyPrice.toLocaleString("id-ID")}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Link href={`/admin/rooms/${room.id}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(room.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
