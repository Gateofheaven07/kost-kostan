import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { SessionProvider } from "next-auth/react"
import "./globals.css"
import { Provider } from "./provider"
import { Toaster } from "@/components/ui/toaster"


export const metadata: Metadata = {
  title: "Aka Kost",
  description: "Platform manajemen kost terpadu",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className={`font-sans antialiased`}>
        <Provider>{children}</Provider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
