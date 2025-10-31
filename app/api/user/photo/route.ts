import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { photo } = body

    if (!photo) {
      return NextResponse.json(
        { error: "Foto diperlukan" },
        { status: 400 }
      )
    }

    // Validate base64 image
    if (!photo.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "Format foto tidak valid" },
        { status: 400 }
      )
    }

    // Check image size (max 5MB base64)
    if (photo.length > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ukuran foto terlalu besar. Maksimal 2MB." },
        { status: 400 }
      )
    }

    console.log("Updating user photo for user:", (session.user as any).id)
    console.log("Photo size:", photo.length, "bytes")

    // Update user photo
    const updatedUser = await prisma.user.update({
      where: { id: (session.user as any).id },
      data: {
        image: photo,
      },
      select: {
        id: true,
        name: true,
        image: true,
      },
    })

    console.log("Photo updated successfully")

    return NextResponse.json({
      success: true,
      image: updatedUser.image,
    })
  } catch (error: any) {
    console.error("Error uploading photo:", error)
    console.error("Error details:", error.message)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

