import { PrismaClient } from "@prisma/client"

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Create Prisma Client with better connection handling
function createPrismaClient() {
  // Get DATABASE_URL and add connection pool parameters if not present
  let databaseUrl = process.env.DATABASE_URL || ""
  
  // Add connection pool parameters if not already present
  if (databaseUrl && !databaseUrl.includes("connection_limit")) {
    try {
      const url = new URL(databaseUrl)
      url.searchParams.set("connection_limit", "10")
      url.searchParams.set("pool_timeout", "20")
      url.searchParams.set("connect_timeout", "10")
      databaseUrl = url.toString()
    } catch (e) {
      // Ignore URL parsing errors
    }
  }

  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  })

  return client
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
