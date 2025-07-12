"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, Mail } from "lucide-react"
import { authUtils } from "@/lib/auth-utils"
import Link from "next/link"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    subscribeNewsletter: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError("Full name is required")
      return false
    }
    if (!formData.email.trim()) {
      setError("Email is required")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return false
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, and one number")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    if (!formData.agreeToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) return

    setLoading(true)

    try {
      const { user, error, needsEmailVerification } = await authUtils.signUp(
        formData.email,
        formData.password,
        formData.fullName,
      )

      if (error) {
        setError(error.message)
      } else if (needsEmailVerification) {
        setNeedsVerification(true)
      } else if (user) {
        setSuccess(true)
        // Redirect to profile setup after a short delay
        setTimeout(() => {
          router.push("/profile-setup")
        }, 2000)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setLoading(true)
    const { error } = await authUtils.resendEmailVerification(formData.email)

    if (error) {
      setError(error.message)
    } else {
      setError("")
      // Show success message briefly
      const originalMessage = "Verification email resent! Please check your inbox."
      setError(originalMessage)
      setTimeout(() => setError(""), 5000)
    }
    setLoading(false)
  }

  if (needsVerification) {
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

        <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
          <Card className="w-full max-w-md bg-white shadow-lg border-0">
            <CardContent className="p-8 text-center">
              <Mail className="h-16 w-16 text-[#17a2b8] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#1c1d1f] mb-2">Check Your Email</h2>
              <p className="text-gray-600 mb-6">
                We've sent a verification link to <strong>{formData.email}</strong>. Please click the link in your email
                to verify your account and complete the signup process.
              </p>

              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-600">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Button
                  onClick={handleResendVerification}
                  disabled={loading}
                  variant="outline"
                  className="w-full bg-transparent"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Resend Verification Email"
                  )}
                </Button>

                <p className="text-sm text-gray-500">
                  Didn't receive the email? Check your spam folder or try resending.
                </p>

                <Link href="/login">
                  <Button variant="ghost" className="w-full text-[#007bff] hover:text-[#0056b3]">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-white shadow-lg border-0">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#1c1d1f] mb-2">Account Created!</h2>
            <p className="text-gray-600 mb-4">
              Your account has been successfully created. You'll be redirected to complete your profile shortly.
            </p>
            <div className="flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-gray-500">Redirecting...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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

      {/* Main Content - Centered Signup Form */}
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="space-y-1 pb-8 pt-8">
              <h2 className="text-2xl font-bold text-center text-[#1c1d1f]">Join Skillswap</h2>
              <p className="text-sm text-gray-600 text-center">Create your account to start skill sharing</p>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-600">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#17a2b8] focus:border-[#17a2b8] transition-colors duration-200 bg-white"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#17a2b8] focus:border-[#17a2b8] transition-colors duration-200 bg-white"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password *
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a strong password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#17a2b8] focus:border-[#17a2b8] transition-colors duration-200 bg-white"
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500">
                    Must be at least 8 characters with uppercase, lowercase, and number
                  </p>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm Password *
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#17a2b8] focus:border-[#17a2b8] transition-colors duration-200 bg-white"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, agreeToTerms: checked as boolean }))
                    }
                    className="mt-1"
                    disabled={loading}
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm text-gray-600 leading-relaxed">
                    I agree to the{" "}
                    <Link href="/terms" className="text-[#007bff] hover:text-[#0056b3] hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-[#007bff] hover:text-[#0056b3] hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                {/* Newsletter Subscription */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="subscribeNewsletter"
                    name="subscribeNewsletter"
                    checked={formData.subscribeNewsletter}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, subscribeNewsletter: checked as boolean }))
                    }
                    className="mt-1"
                    disabled={loading}
                  />
                  <Label htmlFor="subscribeNewsletter" className="text-sm text-gray-600">
                    Send me updates about new features and skill-sharing opportunities
                  </Label>
                </div>

                {/* Create Account Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#17a2b8] hover:bg-[#138496] text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 focus:ring-2 focus:ring-[#17a2b8] focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              {/* Login Link */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-[#007bff] hover:text-[#0056b3] hover:underline font-medium transition-colors duration-200"
                  >
                    Sign in here
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
