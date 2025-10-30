import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function POST() {
  try {
    console.log("[v0] Starting database initialization...")

    // Clear existing data
    console.log("[v0] Clearing existing data...")
    await prisma.booking.deleteMany()
    await prisma.roomImage.deleteMany()
    await prisma.price.deleteMany()
    await prisma.room.deleteMany()
    await prisma.tenantProfile.deleteMany()
    await prisma.user.deleteMany()
    await prisma.owner.deleteMany()
    await prisma.kost.deleteMany()

    // Create Kost
    console.log("[v0] Creating kost...")
    const kost = await prisma.kost.create({
      data: {
        name: "Kost Nyaman Bandung",
        address: "Jl. Raya Bandung No. 123",
        city: "Bandung",
        description:
          "Kost nyaman dengan lokasi strategis di pusat kota Bandung. Dekat dengan kampus, mall, dan transportasi umum. Fasilitas lengkap dan pengelola yang ramah.",
        rules:
          "1. Jam malam pukul 22:00\n2. Tidak boleh membawa tamu lawan jenis ke kamar\n3. Menjaga kebersihan area umum\n4. Tidak boleh membuat keributan\n5. Bayar tepat waktu",
        facilities: JSON.stringify(["WiFi Gratis", "Listrik 24 Jam", "Air Panas", "Parkir Motor", "Keamanan 24 Jam"]),
        contactPhone: "+62 812-3456-7890",
        contactWhatsApp: "+62 812-3456-7890",
        email: "info@kostnyanambandung.com",
        coverImageUrl: "/boarding-house-exterior.jpg",
      },
    })

    // Create Owner
    console.log("[v0] Creating owner...")
    const owner = await prisma.owner.create({
      data: {
        name: "Ibu Siti Nurhaliza",
        photoUrl: "/professional-woman-portrait.png",
        bio: "Pemilik kost berpengalaman lebih dari 10 tahun. Berkomitmen memberikan pelayanan terbaik untuk kenyamanan penghuni.",
        phone: "+62 812-3456-7890",
        email: "siti@kostnyanambandung.com",
        socials: JSON.stringify({
          instagram: "@kostnyanambandung",
          facebook: "Kost Nyaman Bandung",
          whatsapp: "+62 812-3456-7890",
        }),
      },
    })

    // Create Rooms
    console.log("[v0] Creating rooms...")
    const rooms = [
      {
        name: "Kamar Standar 101",
        slug: "kamar-standar-101",
        floor: 1,
        capacity: 1,
        size: "3x4m",
        facilities: JSON.stringify(["Kasur", "Lemari", "Meja", "Kursi", "AC", "WiFi"]),
        mainImageUrl: "/bedroom-interior-modern.jpg",
        prices: {
          WEEK: 150000,
          MONTH: 500000,
          "3MO": 1400000,
          "6MO": 2700000,
          "12MO": 5000000,
        },
      },
      {
        name: "Kamar Standar 102",
        slug: "kamar-standar-102",
        floor: 1,
        capacity: 1,
        size: "3x4m",
        facilities: JSON.stringify(["Kasur", "Lemari", "Meja", "Kursi", "AC", "WiFi"]),
        mainImageUrl: "/bedroom-interior-modern.jpg",
        prices: {
          WEEK: 150000,
          MONTH: 500000,
          "3MO": 1400000,
          "6MO": 2700000,
          "12MO": 5000000,
        },
      },
      {
        name: "Kamar Deluxe 201",
        slug: "kamar-deluxe-201",
        floor: 2,
        capacity: 2,
        size: "4x5m",
        facilities: JSON.stringify(["Kasur Besar", "Lemari", "Meja", "Kursi", "AC", "WiFi", "Kamar Mandi Pribadi"]),
        mainImageUrl: "/luxury-bedroom.png",
        prices: {
          WEEK: 200000,
          MONTH: 650000,
          "3MO": 1850000,
          "6MO": 3500000,
          "12MO": 6500000,
        },
      },
      {
        name: "Kamar Deluxe 202",
        slug: "kamar-deluxe-202",
        floor: 2,
        capacity: 2,
        size: "4x5m",
        facilities: JSON.stringify(["Kasur Besar", "Lemari", "Meja", "Kursi", "AC", "WiFi", "Kamar Mandi Pribadi"]),
        mainImageUrl: "/luxury-bedroom.png",
        prices: {
          WEEK: 200000,
          MONTH: 650000,
          "3MO": 1850000,
          "6MO": 3500000,
          "12MO": 6500000,
        },
      },
      {
        name: "Kamar Premium 301",
        slug: "kamar-premium-301",
        floor: 3,
        capacity: 1,
        size: "3.5x4.5m",
        facilities: JSON.stringify([
          "Kasur Premium",
          "Lemari Besar",
          "Meja Kerja",
          "Kursi Ergonomis",
          "AC Inverter",
          "WiFi Cepat",
          "Kamar Mandi Pribadi",
          "Balkon",
        ]),
        mainImageUrl: "/premium-bedroom-luxury.jpg",
        prices: {
          WEEK: 250000,
          MONTH: 800000,
          "3MO": 2300000,
          "6MO": 4400000,
          "12MO": 8000000,
        },
      },
      {
        name: "Kamar Premium 302",
        slug: "kamar-premium-302",
        floor: 3,
        capacity: 1,
        size: "3.5x4.5m",
        facilities: JSON.stringify([
          "Kasur Premium",
          "Lemari Besar",
          "Meja Kerja",
          "Kursi Ergonomis",
          "AC Inverter",
          "WiFi Cepat",
          "Kamar Mandi Pribadi",
          "Balkon",
        ]),
        mainImageUrl: "/premium-bedroom-luxury.jpg",
        prices: {
          WEEK: 250000,
          MONTH: 800000,
          "3MO": 2300000,
          "6MO": 4400000,
          "12MO": 8000000,
        },
      },
      {
        name: "Kamar VIP 401",
        slug: "kamar-vip-401",
        floor: 4,
        capacity: 2,
        size: "5x6m",
        facilities: JSON.stringify([
          "Kasur King Size",
          "Lemari Besar",
          "Meja Kerja",
          "Sofa",
          "AC Inverter",
          "WiFi Cepat",
          "Kamar Mandi Pribadi",
          "Balkon Luas",
          "TV",
        ]),
        mainImageUrl: "/vip-suite-luxury-apartment.jpg",
        prices: {
          WEEK: 350000,
          MONTH: 1100000,
          "3MO": 3100000,
          "6MO": 6000000,
          "12MO": 11000000,
        },
      },
      {
        name: "Kamar VIP 402",
        slug: "kamar-vip-402",
        floor: 4,
        capacity: 2,
        size: "5x6m",
        facilities: JSON.stringify([
          "Kasur King Size",
          "Lemari Besar",
          "Meja Kerja",
          "Sofa",
          "AC Inverter",
          "WiFi Cepat",
          "Kamar Mandi Pribadi",
          "Balkon Luas",
          "TV",
        ]),
        mainImageUrl: "/vip-suite-luxury-apartment.jpg",
        prices: {
          WEEK: 350000,
          MONTH: 1100000,
          "3MO": 3100000,
          "6MO": 6000000,
          "12MO": 11000000,
        },
      },
    ]

    for (const roomData of rooms) {
      const { prices, ...roomInfo } = roomData
      const room = await prisma.room.create({
        data: {
          ...roomInfo,
          kostId: kost.id,
          isAvailable: true,
        },
      })

      // Create prices for each period
      for (const [period, amount] of Object.entries(prices)) {
        await prisma.price.create({
          data: {
            roomId: room.id,
            period,
            amount: Number(amount),
          },
        })
      }
    }

    // Create Admin User
    console.log("[v0] Creating admin user...")
    const adminPassword = await bcrypt.hash("Admin123!", 10)
    const admin = await prisma.user.create({
      data: {
        name: "Admin Kost",
        email: "admin@kost.test",
        passwordHash: adminPassword,
        role: "ADMIN",
        phone: "+62 812-3456-7890",
      },
    })

    // Create Sample Users
    console.log("[v0] Creating sample users...")
    const userPassword = await bcrypt.hash("User123!", 10)
    const user1 = await prisma.user.create({
      data: {
        name: "Budi Santoso",
        email: "budi@example.com",
        passwordHash: userPassword,
        role: "USER",
        phone: "+62 812-1111-1111",
      },
    })

    const user2 = await prisma.user.create({
      data: {
        name: "Siti Rahmawati",
        email: "siti@example.com",
        passwordHash: userPassword,
        role: "USER",
        phone: "+62 812-2222-2222",
      },
    })

    // Create Sample Bookings
    console.log("[v0] Creating sample bookings...")
    const room1 = await prisma.room.findFirst()
    const room2 = await prisma.room.findFirst({ skip: 1 })

    if (room1) {
      await prisma.booking.create({
        data: {
          userId: user1.id,
          roomId: room1.id,
          startDate: new Date("2025-02-01"),
          endDate: new Date("2025-03-01"),
          period: "MONTH",
          totalPrice: 500000,
          status: "CONFIRMED",
          notes: "Booking untuk semester baru",
        },
      })
    }

    if (room2) {
      await prisma.booking.create({
        data: {
          userId: user2.id,
          roomId: room2.id,
          startDate: new Date("2025-02-15"),
          endDate: new Date("2025-05-15"),
          period: "3MO",
          totalPrice: 1400000,
          status: "PENDING",
          notes: "Menunggu konfirmasi",
        },
      })
    }

    console.log("[v0] Database initialization completed successfully!")

    return NextResponse.json(
      {
        success: true,
        message: "Database initialized successfully",
        credentials: {
          admin: {
            email: "admin@kost.test",
            password: "Admin123!",
          },
          users: [
            {
              email: "budi@example.com",
              password: "User123!",
            },
            {
              email: "siti@example.com",
              password: "User123!",
            },
          ],
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Database initialization error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}
