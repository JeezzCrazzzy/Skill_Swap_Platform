"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          setStatus("error")
          setMessage(error.message)
          return
        }

        if (data.session) {
          setStatus("success")
          setMessage("Email verified successfully! Redirecting to profile setup...")

          // Redirect to profile setup after a short delay
          setTimeout(() => {
            router.push("/profile-setup")
          }, 2000)
        } else {
          setStatus("error")
          setMessage("No valid session found. Please try signing up again.")
        }
      } catch (err) {
        setStatus("error")
        setMessage("An unexpected error occurred during email verification.")
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-white shadow-lg border-0">
        <CardContent className="p-8 text-center">
          {status === "loading" && (
            <>
              <Loader2 className="h-16 w-16 text-[#17a2b8] mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-[#1c1d1f] mb-2">Verifying Email</h2>
              <p className="text-gray-600">Please wait while we verify your email address...</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#1c1d1f] mb-2">Email Verified!</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <div className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-gray-500">Redirecting...</span>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#1c1d1f] mb-2">Verification Failed</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="space-y-3">
                <Link href="/signup">
                  <Button className="w-full bg-[#17a2b8] hover:bg-[#138496] text-white">Try Signing Up Again</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="w-full bg-transparent">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
