import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("[v0] Starting database initialization...")

  try {
    // Check if data already exists
    const existingUser = await prisma.user.findFirst()
    if (existingUser) {
      console.log("[v0] Database already initialized with data")
      return
    }

    console.log("[v0] Creating Owner...")
    const owner = await prisma.owner.create({
      data: {
        name: "Budi Santoso",
        photoUrl: "/professional-woman-portrait.png",
        bio: "Pemilik kost berpengalaman dengan standar kualitas tinggi",
        phone: "+62812345678",
        email: "owner@kost.test",
        socials: JSON.stringify({
          instagram: "@budikost",
          whatsapp: "+62812345678",
        }),
      },
    })
    console.log("[v0] Owner created:", owner.id)

    console.log("[v0] Creating Kost...")
    const kost = await prisma.kost.create({
      data: {
        name: "Kost Nyaman Pusat Kota",
        address: "Jl. Merdeka No. 123",
        city: "Jakarta",
        description: "Kost modern dengan fasilitas lengkap di pusat kota",
        rules: "Jam malam 22:00, Tidak boleh bising, Jaga kebersihan",
        facilities: JSON.stringify(["WiFi", "AC", "Kamar Mandi Dalam", "Dapur Bersama", "Parkir"]),
        contactPhone: "+62812345678",
        contactWhatsApp: "+62812345678",
        email: "kost@example.com",
        coverImageUrl: "/boarding-house-exterior.jpg",
      },
    })
    console.log("[v0] Kost created:", kost.id)

    console.log("[v0] Creating Rooms...")
    const rooms = [
      {
        name: "Kamar Standar A",
        size: "3x4m",
        floor: 1,
        capacity: 1,
        facilities: JSON.stringify(["AC", "Kasur", "Lemari"]),
        mainImageUrl: "/bedroom-interior-modern.jpg",
      },
      {
        name: "Kamar Standar B",
        size: "3x4m",
        floor: 1,
        capacity: 1,
        facilities: JSON.stringify(["AC", "Kasur", "Lemari"]),
        mainImageUrl: "/bedroom-interior-modern.jpg",
      },
      {
        name: "Kamar Premium",
        size: "4x5m",
        floor: 2,
        capacity: 2,
        facilities: JSON.stringify(["AC", "Kasur Double", "Lemari", "Meja Kerja"]),
        mainImageUrl: "/luxury-bedroom.png",
      },
      {
        name: "Kamar VIP Suite",
        size: "5x6m",
        floor: 3,
        capacity: 2,
        facilities: JSON.stringify(["AC", "Kasur Double", "Lemari", "Meja Kerja", "Sofa"]),
        mainImageUrl: "/vip-suite-luxury-apartment.jpg",
      },
    ]

    for (let i = 0; i < rooms.length; i++) {
      const room = await prisma.room.create({
        data: {
          ...rooms[i],
          slug: `kamar-${i + 1}`,
          kostId: kost.id,
        },
      })

      // Create prices for each room
      const prices = [
        { period: "WEEK", amount: 350000 },
        { period: "MONTH", amount: 1200000 },
        { period: "3MO", amount: 3300000 },
        { period: "6MO", amount: 6000000 },
        { period: "12MO", amount: 11000000 },
      ]

      for (const price of prices) {
        await prisma.price.create({
          data: {
            roomId: room.id,
            ...price,
          },
        })
      }

      console.log("[v0] Room created:", room.name)
    }

    console.log("[v0] Creating Admin User...")
    const adminPassword = await bcrypt.hash("Admin123!", 10)
    const adminUser = await prisma.user.create({
      data: {
        name: "Admin Kost",
        email: "admin@kost.test",
        passwordHash: adminPassword,
        phone: "+62812345678",
        role: "ADMIN",
      },
    })
    console.log("[v0] Admin user created:", adminUser.email)

    console.log("[v0] Creating Sample Users...")
    const userPassword = await bcrypt.hash("User123!", 10)
    const user1 = await prisma.user.create({
      data: {
        name: "Andi Wijaya",
        email: "andi@example.com",
        passwordHash: userPassword,
        phone: "+62812345679",
        role: "USER",
      },
    })

    const user2 = await prisma.user.create({
      data: {
        name: "Siti Nurhaliza",
        email: "siti@example.com",
        passwordHash: userPassword,
        phone: "+62812345680",
        role: "USER",
      },
    })
    console.log("[v0] Sample users created")

    console.log("[v0] Creating Sample Bookings...")
    const startDate = new Date()
    startDate.setDate(startDate.getDate() + 7)
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + 1)

    await prisma.booking.create({
      data: {
        userId: user1.id,
        roomId: (await prisma.room.findFirst({ where: { kostId: kost.id } }))!.id,
        startDate,
        endDate,
        period: "MONTH",
        totalPrice: 1200000,
        status: "CONFIRMED",
      },
    })
    console.log("[v0] Sample booking created")

    console.log("[v0] Database initialization completed successfully!")
    console.log("[v0] Admin credentials: admin@kost.test / Admin123!")
    console.log("[v0] User credentials: andi@example.com / User123!")
  } catch (error) {
    console.error("[v0] Database initialization failed:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error("[v0] Fatal error:", error)
  process.exit(1)
})
