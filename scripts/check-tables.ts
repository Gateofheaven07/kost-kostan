import "dotenv/config"
import { prisma } from "../lib/prisma"

async function main() {
  console.log("🔍 Checking database tables...\n")
  
  try {
    // Check if tables exist by querying them
    const tables = [
      { name: "User", query: () => prisma.user.count() },
      { name: "Kost", query: () => prisma.kost.count() },
      { name: "Owner", query: () => prisma.owner.count() },
      { name: "Room", query: () => prisma.room.count() },
      { name: "Booking", query: () => prisma.booking.count() },
      { name: "Payment", query: () => prisma.payment.count() },
      { name: "Price", query: () => prisma.price.count() },
      { name: "RoomImage", query: () => prisma.roomImage.count() },
    ]

    console.log("Checking tables and record counts:")
    console.log("=" .repeat(50))
    
    for (const table of tables) {
      try {
        const count = await table.query()
        console.log(`✅ ${table.name.padEnd(15)} - ${count} records`)
      } catch (error: any) {
        if (error.message?.includes("does not exist") || error.code === "P2021") {
          console.log(`❌ ${table.name.padEnd(15)} - Table does not exist`)
        } else {
          console.log(`⚠️  ${table.name.padEnd(15)} - Error: ${error.message}`)
        }
      }
    }
    
    console.log("=" .repeat(50))
    
    // Check database URL
    const dbUrl = process.env.DATABASE_URL
    if (dbUrl) {
      try {
        const url = new URL(dbUrl)
        console.log(`\n📊 Database Connection:`)
        console.log(`   Host: ${url.hostname}`)
        console.log(`   Database: ${url.pathname.substring(1)}`)
      } catch {
        console.log(`\n📊 Database URL: ${dbUrl.substring(0, 50)}...`)
      }
    }
    
    console.log("\n✅ Check completed!")
  } catch (error: any) {
    console.error("\n❌ Error:", error.message)
    if (error.message?.includes("connection") || error.code === "P1001") {
      console.error("\n💡 Connection issue. Please check:")
      console.error("   1. DATABASE_URL in .env file")
      console.error("   2. Database is accessible")
      console.error("   3. Network connection")
    }
  } finally {
    await prisma.$disconnect()
  }
}

main()

