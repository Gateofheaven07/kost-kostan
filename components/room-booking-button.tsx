"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface RoomBookingButtonProps {
  roomId: string
  isAuthenticated: boolean
}

export function RoomBookingButton({ roomId, isAuthenticated }: RoomBookingButtonProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleBooking = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Diperlukan",
        description: "Silakan login atau daftar akun terlebih dahulu untuk melanjutkan pemesanan.",
      })
      router.push(`/auth/signin?callbackUrl=/booking?roomId=${roomId}`)
      return
    }
    
    router.push(`/booking?roomId=${roomId}`)
  }

  return (
    <Button className="w-full" onClick={handleBooking}>
      Mulai Sewa
    </Button>
  )
}

