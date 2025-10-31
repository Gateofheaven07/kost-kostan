import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// DELETE - Delete admin (Super Admin only)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = params

    // Check if admin exists
    const admin = await prisma.user.findUnique({
      where: { id },
    })

    if (!admin) {
      return NextResponse.json({ error: "Admin tidak ditemukan" }, { status: 404 })
    }

    // Prevent deleting Super Admin
    if (admin.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Super Admin tidak bisa dihapus" },
        { status: 400 }
      )
    }

    // Prevent deleting self
    if (admin.id === (session.user as any).id) {
      return NextResponse.json(
        { error: "Tidak bisa menghapus akun sendiri" },
        { status: 400 }
      )
    }

    // Delete admin
    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting admin:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

