import { prisma } from "@/lib/prisma"

/**
 * Sync room availability based on CONFIRMED bookings
 * This ensures that rooms with active CONFIRMED bookings are marked as unavailable
 * 
 * This function should be called:
 * - Before fetching room listings
 * - After payment webhook/notification
 * - Periodically to ensure data consistency
 */
export async function syncRoomAvailability() {
  try {
    // Find all rooms with CONFIRMED bookings that haven't ended yet
    const confirmedBookings = await prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        endDate: {
          gte: new Date(), // Only active bookings (not expired)
        },
      },
      select: {
        roomId: true,
      },
      distinct: ["roomId"],
    })

    const roomsWithConfirmedBookings = confirmedBookings.map((b) => b.roomId)

    // Update rooms: mark as unavailable if they have active CONFIRMED bookings
    // This ensures that rooms with active bookings are always marked as unavailable
    // Even if admin manually set them as available, they will be synced back
    if (roomsWithConfirmedBookings.length > 0) {
      const result = await prisma.room.updateMany({
        where: {
          id: {
            in: roomsWithConfirmedBookings,
          },
          isAvailable: true, // Only update if currently available
        },
        data: {
          isAvailable: false,
        },
      })
      if (result.count > 0) {
        console.log(`[Sync Room Availability] Marked ${result.count} rooms as unavailable (have active CONFIRMED bookings)`)
      }
    }

    // Note: We don't automatically mark rooms as available even if they don't have active bookings
    // This is because admin may have manually set them as unavailable
    // Admin can manually change status back to available when needed
    // If admin sets a room as available but there are still active bookings, sync will mark it as unavailable again
  } catch (error) {
    console.error("[Sync Room Availability] Error:", error)
    // Don't throw error, just log it
  }
}

