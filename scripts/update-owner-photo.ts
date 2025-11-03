import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🔄 Memperbarui foto pemilik kost...")

  try {
    // Update owner photo yang sudah ada
    const result = await prisma.owner.updateMany({
      data: {
        photoUrl: "/profile_kost.png",
      },
    })

    console.log(`✅ Berhasil memperbarui ${result.count} foto pemilik kost`)
    console.log("📸 Foto: /profile_kost.png")
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

