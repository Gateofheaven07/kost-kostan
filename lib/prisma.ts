import { PrismaClient } from "@prisma/client"

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Create Prisma Client with better connection handling
function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })

  // Handle connection errors
  client.$on("error" as never, (e: any) => {
    console.error("Prisma error:", e)
  })

  return client
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

// Graceful shutdown
if (typeof window === "undefined") {
  process.on("beforeExit", async () => {
    await prisma.$disconnect()
  })
  
  process.on("SIGINT", async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  
  process.on("SIGTERM", async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}

export async function testDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error("[v0] Database connection failed:", error)
    return false
  }
}
