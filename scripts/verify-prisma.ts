import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🔍 Verifying Prisma Client...")

  try {
    // Test basic connection
    await prisma.$connect()
    console.log("✅ Database connection successful")

    // Test if Payment model exists
    try {
      const count = await prisma.payment.count()
      console.log(`✅ Payment model exists - Found ${count} payment records`)
    } catch (error: any) {
      if (error.message?.includes("findUnique") || error.message?.includes("prisma.payment")) {
        console.error("❌ Payment model not found in Prisma Client")
        console.error("   Please run: npx prisma generate")
        process.exit(1)
      }
      throw error
    }

    // Test if Booking model can access payment
    try {
      const booking = await prisma.booking.findFirst({
        include: {
          payment: true,
        },
      })
      console.log("✅ Booking-Payment relation working")
    } catch (error: any) {
      console.error("❌ Booking-Payment relation error:", error.message)
    }

    console.log("\n✅ All checks passed!")
  } catch (error: any) {
    console.error("❌ Error:", error.message)
    if (error.message?.includes("connection") || error.message?.includes("closed")) {
      console.error("\n💡 Connection issue detected. Possible solutions:")
      console.error("   1. Check DATABASE_URL in .env file")
      console.error("   2. Ensure database is accessible")
      console.error("   3. Try restarting dev server")
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

