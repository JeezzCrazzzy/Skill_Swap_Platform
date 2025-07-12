"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react"
import { authUtils } from "@/lib/auth-utils"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/")
    }
  }, [user, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)

    try {
      const { user, error } = await authUtils.signIn(formData.email, formData.password)

      if (error) {
        setError(error.message)
      } else if (user) {
        // Check if user has completed profile
        const hasProfile = await authUtils.hasCompletedProfile(user.id)

        if (hasProfile) {
          router.push("/")
        } else {
          router.push("/profile-setup")
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-[#1c1d1f] text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold hover:text-gray-200 transition-colors">
                Skill Swap Platform
              </Link>
            </div>
            <Link href="/">
              <Button
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-[#1c1d1f] transition-colors duration-200"
              >
                Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content - Centered Login Form */}
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="space-y-1 pb-8 pt-8">
              <h2 className="text-2xl font-bold text-center text-[#1c1d1f]">Welcome Back</h2>
              <p className="text-sm text-gray-600 text-center">Sign in to your Skillswap account</p>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-600">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#17a2b8] focus:border-[#17a2b8] transition-colors duration-200 bg-white"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#17a2b8] focus:border-[#17a2b8] transition-colors duration-200 bg-white"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#17a2b8] hover:bg-[#138496] text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 focus:ring-2 focus:ring-[#17a2b8] focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                {/* Forgot Password Link */}
                <div className="text-center">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-[#007bff] hover:text-[#0056b3] hover:underline transition-colors duration-200"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </form>

              {/* Additional Options */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-center text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    href="/signup"
                    className="text-[#007bff] hover:text-[#0056b3] hover:underline font-medium transition-colors duration-200"
                  >
                    Sign up here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
