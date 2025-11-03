import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🔄 Memperbarui data kost...")

  try {
    // Update kost yang sudah ada
    const result = await prisma.kost.updateMany({
      data: {
        name: "Aka Kost",
        address: "Jl. Babakan Lio No.11, Bogor",
        city: "Bogor",
      },
    })

    console.log(`✅ Berhasil memperbarui ${result.count} data kost`)
    console.log("📝 Nama: Aka Kost")
    console.log("📍 Alamat: Jl. Babakan Lio No.11, Bogor")
    console.log("🏙️  Kota: Bogor")
  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

