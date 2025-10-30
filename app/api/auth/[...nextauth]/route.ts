import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

// Wrap the handler to catch errors and return proper JSON responses
async function wrappedHandler(req: Request) {
  try {
    return await handler(req)
  } catch (error) {
    console.error("[v0] NextAuth error:", error)
    return new Response(JSON.stringify({ error: "Authentication error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export { handler as GET, handler as POST }
