"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  name: string
  email: string
  phone: string | null
  createdAt: string
}

export default function TenantsPage() {
  const { toast } = useToast()

  const { data: users = [], isLoading: loading } = useQuery<User[]>({
    queryKey: ["admin-tenants"],
    queryFn: async () => {
      const response = await fetch("/api/admin/tenants")
      if (!response.ok) throw new Error("Failed to fetch tenants")
      return response.json()
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal memuat data penyewa",
        variant: "destructive",
      })
    },
  })

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Kelola Penyewa</h1>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Penyewa</CardTitle>
          <CardDescription>Lihat semua penyewa yang terdaftar</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Memuat data...</p>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground">Tidak ada penyewa</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telepon</TableHead>
                    <TableHead>Tanggal Daftar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || "-"}</TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString("id-ID")}</TableCell>
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
