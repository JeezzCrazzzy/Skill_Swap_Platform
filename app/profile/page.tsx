"use client"

import { Label } from "@/components/ui/label"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  User,
  MapPin,
  Eye,
  EyeOff,
  Edit,
  Mail,
  Clock,
  Star,
  Settings,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { authUtils } from "@/lib/auth-utils"
import type { Profile } from "@/lib/supabase"
import Link from "next/link"

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      setLoading(true)
      const { profile, error } = await authUtils.getUserProfile(user.id)

      if (error) {
        setError(error)
      } else if (profile) {
        setProfile(profile)
      } else {
        // No profile found, redirect to setup
        router.push("/profile-setup")
      }

      setLoading(false)
    }

    if (user) {
      fetchProfile()
    }
  }, [user, router])

  const getAvailabilityDisplay = (availability: string) => {
    const availabilityMap: { [key: string]: string } = {
      weekends: "Weekends",
      weekdays: "Weekdays",
      evenings: "Evenings",
      flexible: "Flexible",
    }
    return availabilityMap[availability] || availability
  }

  const getVisibilityDisplay = (visibility: string) => {
    const visibilityMap: { [key: string]: { label: string; icon: React.ReactNode } } = {
      public: { label: "Public", icon: <Eye className="h-4 w-4" /> },
      private: { label: "Private", icon: <EyeOff className="h-4 w-4" /> },
      friends_only: { label: "Friends Only", icon: <User className="h-4 w-4" /> },
    }
    return visibilityMap[visibility] || { label: visibility, icon: <Eye className="h-4 w-4" /> }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#17a2b8] mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-white shadow-lg border-0">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#1c1d1f] mb-2">Error Loading Profile</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Link href="/profile-setup">
                <Button className="w-full bg-[#17a2b8] hover:bg-[#138496] text-white">Complete Profile Setup</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full bg-transparent">
                  Back to Home
                </Button>
              </Link>
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

            <div className="flex items-center space-x-4">
              <Link href="/profile-setup">
                <Button
                  variant="outline"
                  className="bg-transparent border-white text-white hover:bg-white hover:text-[#1c1d1f] transition-colors duration-200"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" className="text-white hover:text-gray-200 hover:bg-gray-700">
                  Home
                </Button>
              </Link>

              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || user.user_metadata?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="bg-gray-600 text-white">
                  {profile?.name?.charAt(0) || user.user_metadata?.full_name?.charAt(0) || <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1c1d1f] mb-2">My Profile</h1>
          <p className="text-gray-600">View and manage your skill exchange profile information.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview Card */}
          <div className="lg:col-span-1">
            <Card className="bg-white shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="mb-6">
                  <Avatar className="h-32 w-32 mx-auto mb-4 border-4 border-gray-200">
                    <AvatarImage
                      src={profile?.avatar_url || user.user_metadata?.avatar_url || "/placeholder.svg"}
                      alt={profile?.name || "Profile"}
                    />
                    <AvatarFallback className="bg-gray-100 text-gray-400 text-4xl">
                      {profile?.name?.charAt(0) || user.user_metadata?.full_name?.charAt(0) || (
                        <User className="h-16 w-16" />
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <h2 className="text-2xl font-bold text-[#1c1d1f] mb-2">
                    {profile?.name || user.user_metadata?.full_name || "Unknown User"}
                  </h2>

                  {profile?.location && (
                    <div className="flex items-center justify-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{profile.location}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-center text-gray-600 mb-4">
                    <Mail className="h-4 w-4 mr-1" />
                    <span className="text-sm">{user.email}</span>
                  </div>

                  {/* Profile Visibility */}
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                      {getVisibilityDisplay(profile?.profile_visibility || "public").icon}
                      <span className="ml-1">
                        {getVisibilityDisplay(profile?.profile_visibility || "public").label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#28a745]">{profile?.skills_offered?.length || 0}</div>
                    <div className="text-sm text-gray-600">Skills Offered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#007bff]">{profile?.skills_wanted?.length || 0}</div>
                    <div className="text-sm text-gray-600">Skills Wanted</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Availability Card */}
            <Card className="bg-white shadow-lg mt-6">
              <CardHeader>
                <CardTitle className="flex items-center text-[#1c1d1f]">
                  <Clock className="h-5 w-5 mr-2" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current Status:</span>
                  <Badge className="bg-[#17a2b8] text-white">
                    {getAvailabilityDisplay(profile?.availability || "flexible")}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skills and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skills Offered */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-[#1c1d1f]">
                  <CheckCircle className="h-5 w-5 mr-2 text-[#28a745]" />
                  Skills I Can Offer
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile?.skills_offered && profile.skills_offered.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills_offered.map((skill, index) => (
                      <Badge key={index} className="bg-[#28a745] hover:bg-[#218838] text-white px-3 py-1 text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    No skills offered yet. Add some skills to help others find you!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Skills Wanted */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-[#1c1d1f]">
                  <Star className="h-5 w-5 mr-2 text-[#007bff]" />
                  Skills I Want to Learn
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile?.skills_wanted && profile.skills_wanted.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills_wanted.map((skill, index) => (
                      <Badge key={index} className="bg-[#007bff] hover:bg-[#0056b3] text-white px-3 py-1 text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No learning goals set yet. Add skills you'd like to learn!</p>
                )}
              </CardContent>
            </Card>

            {/* Profile Information */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-[#1c1d1f]">
                  <Settings className="h-5 w-5 mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                    <p className="text-gray-900 mt-1">{profile?.name || "Not provided"}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Email</Label>
                    <p className="text-gray-900 mt-1">{user.email}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Location</Label>
                    <p className="text-gray-900 mt-1">{profile?.location || "Not provided"}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Availability</Label>
                    <p className="text-gray-900 mt-1">{getAvailabilityDisplay(profile?.availability || "flexible")}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Profile Visibility</Label>
                    <p className="text-gray-900 mt-1">
                      {getVisibilityDisplay(profile?.profile_visibility || "public").label}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Member Since</Label>
                    <p className="text-gray-900 mt-1">
                      {profile?.created_at ? formatDate(profile.created_at) : "Recently joined"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium text-gray-700">Last Updated</Label>
                  <p className="text-gray-600 text-sm mt-1">
                    {profile?.updated_at ? formatDate(profile.updated_at) : "Never updated"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/profile-setup" className="flex-1">
                <Button className="w-full bg-[#17a2b8] hover:bg-[#138496] text-white">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>

              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full bg-transparent">
                  Browse Skills
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
