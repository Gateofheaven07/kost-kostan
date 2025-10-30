import { execSync } from "child_process"

console.log("[v0] Starting database migration...")

try {
  console.log("[v0] Step 1: Pushing Prisma schema to database...")
  execSync("npx prisma db push --skip-generate", { stdio: "inherit" })
  console.log("[v0] ✓ Schema pushed successfully")

  console.log("[v0] Step 2: Seeding database with sample data...")
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit" })
  console.log("[v0] ✓ Database seeded successfully")

  console.log("[v0] ✓ Database migration completed successfully!")
  process.exit(0)
} catch (error) {
  console.error("[v0] ✗ Migration failed:", error instanceof Error ? error.message : error)
  process.exit(1)
}
