"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Mail, Trash2, Eye, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  name: string
  email: string
  subject: string
  message: string
  isRead: boolean
  createdAt: string
}

export default function MessagesPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const response = await fetch("/api/admin/messages")
      if (!response.ok) throw new Error("Failed to fetch messages")
      return response.json()
    },
  })

  const deleteMessageMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete message")
      return response.json()
    },
    onSuccess: () => {
      toast({ title: "Berhasil", description: "Pesan berhasil dihapus" })
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] })
      setSelectedIds([])
      setSelectedMessage(null)
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal menghapus pesan", variant: "destructive" })
    },
  })

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      })
      if (!response.ok) throw new Error("Failed to update message")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] })
    },
  })

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus pesan ini?")) {
      deleteMessageMutation.mutate(id)
    }
  }

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return
    if (confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} pesan terpilih?`)) {
      // Execute delete for each selected ID
      Promise.all(selectedIds.map((id) => 
        fetch(`/api/admin/messages/${id}`, { method: "DELETE" })
      )).then(() => {
        toast({ title: "Berhasil", description: "Pesan terpilih berhasil dihapus" })
        queryClient.invalidateQueries({ queryKey: ["admin-messages"] })
        setSelectedIds([])
      }).catch(() => {
        toast({ title: "Error", description: "Gagal menghapus beberapa pesan", variant: "destructive" })
      })
    }
  }

  const handleViewDetail = (message: Message) => {
    setSelectedMessage(message)
    if (!message.isRead) {
      markAsReadMutation.mutate(message.id)
    }
  }

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(messages.map((m) => m.id))
    } else {
      setSelectedIds([])
    }
  }

  const toggleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id])
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id))
    }
  }

  if (isLoading) {
    return <div className="p-8">Memuat pesan...</div>
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Mail className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Pesan Masuk</h1>
        </div>
        {selectedIds.length > 0 && (
          <Button 
            variant="destructive" 
            onClick={handleBulkDelete}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Hapus Terpilih ({selectedIds.length})
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pesan</CardTitle>
          <CardDescription>Pesan dari formulir kontak</CardDescription>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Belum ada pesan masuk.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedIds.length === messages.length && messages.length > 0}
                        onCheckedChange={(checked) => toggleSelectAll(checked as boolean)}
                      />
                    </TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Pengirim</TableHead>
                    <TableHead>Subjek</TableHead>
                    <TableHead>Pesan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((msg) => (
                    <TableRow key={msg.id} className={!msg.isRead ? "bg-muted/20" : ""}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedIds.includes(msg.id)}
                          onCheckedChange={(checked) => toggleSelectOne(msg.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {new Date(msg.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{msg.name}</div>
                        <div className="text-xs text-muted-foreground">{msg.email}</div>
                      </TableCell>
                      <TableCell className="font-medium">{msg.subject}</TableCell>
                      <TableCell className="max-w-md truncate text-muted-foreground">
                        {msg.message}
                      </TableCell>
                      <TableCell>
                        <Badge variant={msg.isRead ? "secondary" : "default"}>
                          {msg.isRead ? "Sudah Dibaca" : "Baru"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetail(msg)}
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(msg.id)}
                            title="Hapus Pesan"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
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

      {/* Detail Message Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-xl">{selectedMessage?.subject}</DialogTitle>
                <DialogDescription className="mt-1">
                  Dari: <span className="font-medium text-foreground">{selectedMessage?.name}</span> &lt;{selectedMessage?.email}&gt;
                </DialogDescription>
                <div className="text-xs text-muted-foreground mt-1">
                  Diterima: {selectedMessage && new Date(selectedMessage.createdAt).toLocaleString("id-ID", {
                    dateStyle: "full",
                    timeStyle: "short"
                  })}
                </div>
              </div>
            </div>
          </DialogHeader>
          <div className="mt-4 p-4 bg-muted/30 rounded-lg border min-h-[200px] whitespace-pre-wrap text-sm leading-relaxed">
            {selectedMessage?.message}
          </div>
          <div className="flex justify-end mt-4 gap-2">
            <Button variant="outline" onClick={() => setSelectedMessage(null)}>
              Tutup
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (selectedMessage) handleDelete(selectedMessage.id)
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

