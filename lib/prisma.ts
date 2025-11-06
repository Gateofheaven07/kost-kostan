import { PrismaClient } from "@prisma/client"

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Create Prisma Client with better connection handling
function createPrismaClient() {
  // Get DATABASE_URL and add connection pool parameters if not present
  let databaseUrl = process.env.DATABASE_URL || ""
  
  // Add connection pool parameters if not already present
  if (databaseUrl && !databaseUrl.includes("connection_limit")) {
    const url = new URL(databaseUrl)
    url.searchParams.set("connection_limit", "10")
    url.searchParams.set("pool_timeout", "20")
    url.searchParams.set("connect_timeout", "10")
    databaseUrl = url.toString()
  }

  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  })

  // Handle connection errors - reduce noise from closed connection errors
  // These errors are usually transient and Prisma will automatically reconnect
  client.$on("error" as never, (e: any) => {
    // Only log non-connection-closed errors to reduce noise
    // Connection closed errors are usually transient and Prisma handles them automatically
    const errorMessage = e.message || String(e)
    if (!errorMessage.includes("Closed") && !errorMessage.includes("connection")) {
      console.error("Prisma error:", e)
    }
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
