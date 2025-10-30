import { execSync } from "child_process"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.join(__dirname, "..")

console.log("[v0] Starting database setup...")
console.log("[v0] Project root:", projectRoot)

try {
  console.log("[v0] Step 1: Running prisma db push...")
  execSync("pnpm db:push --skip-generate", {
    cwd: projectRoot,
    stdio: "inherit",
    shell: true,
  })
  console.log("[v0] Step 1 completed: Database schema pushed")

  console.log("[v0] Step 2: Running prisma db seed...")
  execSync("pnpm db:seed", {
    cwd: projectRoot,
    stdio: "inherit",
    shell: true,
  })
  console.log("[v0] Step 2 completed: Database seeded with sample data")

  console.log("[v0] Database setup completed successfully!")
  console.log("[v0] You can now run: pnpm dev")
} catch (error) {
  console.error("[v0] Database setup failed:", error.message)
  process.exit(1)
}
