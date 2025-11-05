import { Suspense } from "react"
import ClientResetPassword from "./client-reset-password"

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-primary mb-4"></div>
          <p className="text-sm text-muted-foreground">Memuat...</p>
        </div>
      </div>
    }>
      <ClientResetPassword />
    </Suspense>
  )
}

