import { execSync } from "child_process"

try {
  console.log("[v0] Executing database setup script...\n")
  execSync("node scripts/setup-db.js", {
    stdio: "inherit",
    shell: true,
  })
} catch (error) {
  console.error("[v0] Setup script failed:", error.message)
  process.exit(1)
}
