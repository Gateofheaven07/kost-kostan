import "dotenv/config"
import { execSync } from "child_process"

console.log("🚀 Setup Neon Database...\n")

// Check if DATABASE_URL is set
const dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
  console.error("❌ Error: DATABASE_URL tidak ditemukan di .env file")
  console.error("\n💡 Solusi:")
  console.error("   1. Buka Neon Console")
  console.error("   2. Pilih project dan branch")
  console.error("   3. Copy connection string")
  console.error("   4. Tambahkan ke .env: DATABASE_URL=\"<connection-string>\"")
  process.exit(1)
}

try {
  // Parse database URL
  const url = new URL(dbUrl)
  console.log("📊 Database Connection:")
  console.log(`   Host: ${url.hostname}`)
  console.log(`   Database: ${url.pathname.substring(1)}`)
  console.log(`   User: ${url.username}`)
  console.log("\n")

  console.log("📋 Step 1: Pushing Prisma schema to database...")
  execSync("npx prisma db push --skip-generate", { stdio: "inherit" })
  console.log("✅ Schema pushed successfully\n")

  console.log("📋 Step 2: Seeding database with sample data...")
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit" })
  console.log("✅ Database seeded successfully\n")

  console.log("🎉 Setup completed!")
  console.log("\n💡 Next steps:")
  console.log("   1. Refresh Neon Console di browser")
  console.log("   2. Klik 'Tables' di sidebar")
  console.log("   3. Pastikan tabel-tabel sudah muncul")
} catch (error) {
  console.error("\n❌ Setup failed:", error instanceof Error ? error.message : error)
  console.error("\n💡 Troubleshooting:")
  console.error("   1. Pastikan DATABASE_URL benar di .env")
  console.error("   2. Pastikan database accessible dari internet")
  console.error("   3. Check network connection")
  process.exit(1)
}

