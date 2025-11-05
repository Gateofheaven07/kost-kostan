import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Mulai seeding database...")

  // Clear existing data
  await prisma.booking.deleteMany()
  await prisma.roomImage.deleteMany()
  await prisma.price.deleteMany()
  await prisma.room.deleteMany()
  await prisma.tenantProfile.deleteMany()
  await prisma.user.deleteMany()
  await prisma.owner.deleteMany()
  await prisma.kost.deleteMany()

  // Create Kost
  const kost = await prisma.kost.create({
    data: {
      name: "Aka Kost",
      address: "Jl. Babakan Lio No.11, Bogor",
      city: "Bogor",
      description:
        "Kost nyaman dengan lokasi strategis dekat pusat kota Bogor dan Universitas IPB, Aka Kost menawarkan hunian nyaman dengan fasilitas lengkap kamar rapi, kamar mandi bersih, Wi-Fi cepat, area parkir, dapur bersama, serta keamanan terjaga. Akses mudah ke kampus, transportasi umum, dan pusat belanja membuat aktivitas harian lebih praktis. Semua kenyamanan ini hadir dengan harga terjangkau, cocok untuk mahasiswa maupun pekerja.",
      rules:
        "1. Jam malam pukul 22:00\n2. Tidak boleh membawa tamu lawan jenis ke kamar\n3. Menjaga kebersihan area umum\n4. Tidak boleh membuat keributan\n5. Bayar tepat waktu",
      facilities: JSON.stringify(["WiFi Gratis", "Listrik 24 Jam", "Air Panas", "Parkir Motor", "Keamanan 24 Jam"]),
      contactPhone: "+62 895-1446-1882",
      contactWhatsApp: "+62 895-1446-1882",
      email: "akakost@gmail.com",
      coverImageUrl: "/boarding-house-exterior.jpg",
    },
  })

  // Create Owner
  const owner = await prisma.owner.create({
    data: {
      name: "Ibu Hikmah",
      photoUrl: "/profile_kost.png",
      bio: "Pemilik kost berpengalaman lebih dari 10 tahun. Berkomitmen memberikan pelayanan terbaik untuk kenyamanan penghuni.",
      phone: "+62 895-1446-1882",
      email: "akakost@gmail.com",
      socials: JSON.stringify({
        instagram: "@kostnyanambandung",
        facebook: "Kost Nyaman Bandung",
        whatsapp: "+62 895-1446-1882",
      }),
    },
  })

  // Create Rooms
  const rooms = [
    {
      name: "Kamar Premium 101",
      slug: "kamar-premium-101",
      floor: 1,
      capacity: 1,
      size: "3.5x4.5m",
      facilities: JSON.stringify([
        "Kasur Premium",
        "Lemari",
        "Meja",
        "Kursi",
        "AC",
        "WiFi",
        "Kamar Mandi Dalam",
      ]),
      mainImageUrl: "/Kamar_Premium.jpeg",
        prices: {
          MONTH: 1000000,
          "6MO": 5700000,
          "12MO": 11000000,
        },
    },
    {
      name: "Kamar Premium 201",
      slug: "kamar-premium-201",
      floor: 2,
      capacity: 1,
      size: "3.5x4.5m",
      facilities: JSON.stringify([
        "Kasur Premium",
        "Lemari",
        "Meja",
        "Kursi",
        "AC",
        "WiFi",
        "Kamar Mandi Dalam",
      ]),
      mainImageUrl: "/Kamar_Premium.jpeg",
        prices: {
          MONTH: 1000000,
          "6MO": 5700000,
          "12MO": 11000000,
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
        "Lemari",
        "Meja",
        "Kursi",
        "AC",
        "WiFi",
        "Kamar Mandi Dalam",
      ]),
      mainImageUrl: "/Kamar_Premium.jpeg",
        prices: {
          MONTH: 1000000,
          "6MO": 5700000,
          "12MO": 11000000,
        },
    },
    {
      name: "Kamar Standart 102",
      slug: "kamar-standart-102",
      floor: 1,
      capacity: 1,
      size: "3x4m",
      facilities: JSON.stringify(["Kasur", "Lemari", "Meja", "Kursi", "AC", "WiFi"]),
      mainImageUrl: "/Kamar_Strandart.jpeg",
        prices: {
          MONTH: 700000,
          "6MO": 3900000,
          "12MO": 7500000,
        },
    },
    {
      name: "Kamar Standart 202",
      slug: "kamar-standart-202",
      floor: 2,
      capacity: 1,
      size: "3x4m",
      facilities: JSON.stringify(["Kasur", "Lemari", "Meja", "Kursi", "AC", "WiFi"]),
      mainImageUrl: "/Kamar_Strandart.jpeg",
        prices: {
          MONTH: 700000,
          "6MO": 3900000,
          "12MO": 7500000,
        },
    },
    {
      name: "Kamar Standart 302",
      slug: "kamar-standart-302",
      floor: 3,
      capacity: 1,
      size: "3x4m",
      facilities: JSON.stringify(["Kasur", "Lemari", "Meja", "Kursi", "AC", "WiFi"]),
      mainImageUrl: "/Kamar_Strandart.jpeg",
        prices: {
          MONTH: 700000,
          "6MO": 3900000,
          "12MO": 7500000,
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

  // Create Super Admin User
  const superAdminPassword = await bcrypt.hash("SuperAdmin123!", 10)
  const superAdmin = await prisma.user.create({
    data: {
      name: "Super Administrator",
      email: "superadmin@kost.test",
      passwordHash: superAdminPassword,
      role: "SUPER_ADMIN",
      phone: "+62 811-9999-9999",
    },
  })

  // Create Admin User
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
        endDate: new Date("2025-08-15"),
        period: "6MO",
        totalPrice: 3900000,
        status: "PENDING",
        notes: "Menunggu konfirmasi",
      },
    })
  }

  console.log("✅ Seeding berhasil!")
  console.log("\n👑 Akun Super Admin:")
  console.log("   Email: superadmin@kost.test")
  console.log("   Password: SuperAdmin123!")
  console.log("\n📝 Akun Admin:")
  console.log("   Email: admin@kost.test")
  console.log("   Password: Admin123!")
  console.log("\n📝 Akun User (untuk testing):")
  console.log("   Email: budi@example.com")
  console.log("   Password: User123!")
  console.log("   Email: siti@example.com")
  console.log("   Password: User123!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
