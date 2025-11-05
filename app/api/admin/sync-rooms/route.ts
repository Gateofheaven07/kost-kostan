import { requireAdmin } from "@/lib/auth-utils"
import { syncRoomAvailability } from "@/lib/sync-room-availability"
import { type NextRequest, NextResponse } from "next/server"

/**
 * POST /api/admin/sync-rooms
 * 
 * Manual sync room availability based on CONFIRMED bookings
 * Only accessible by admin
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    // Sync room availability
    await syncRoomAvailability()

    return NextResponse.json({
      success: true,
      message: "Status kamar berhasil di-sync",
    })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("[Sync Rooms] Error:", error)
    return NextResponse.json(
      {
        error: "Gagal sync status kamar",
        message: error.message || "Internal server error",
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/sync-rooms
 * 
 * Get sync status info
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    return NextResponse.json({
      message: "Sync Room Availability API",
      endpoint: "/api/admin/sync-rooms",
      method: "POST",
      description: "Sync room availability based on CONFIRMED bookings",
    })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(
      {
        error: "Gagal mengambil info",
        message: error.message || "Internal server error",
      },
      { status: 500 }
    )
  }
}

