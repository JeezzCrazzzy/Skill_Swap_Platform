"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Plus, Camera, User, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function ProfileSetupPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    availability: "weekends",
    profileVisibility: "public",
  })
  const [skillsOffered, setSkillsOffered] = useState<string[]>([])
  const [skillsWanted, setSkillsWanted] = useState<string[]>([])
  const [newSkillOffered, setNewSkillOffered] = useState("")
  const [newSkillWanted, setNewSkillWanted] = useState("")

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  // Pre-fill name from user metadata
  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setFormData((prev) => ({
        ...prev,
        name: user.user_metadata.full_name,
      }))
    }
  }, [user])

  // Load existing profile data for editing
  useEffect(() => {
    const loadExistingProfile = async () => {
      if (!user) return

      const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (profile && !error) {
        // Pre-fill form with existing data
        setFormData({
          name: profile.name || "",
          location: profile.location || "",
          availability: profile.availability || "weekends",
          profileVisibility: profile.profile_visibility || "public",
        })
        setSkillsOffered(profile.skills_offered || [])
        setSkillsWanted(profile.skills_wanted || [])
      }
    }

    if (user) {
      loadExistingProfile()
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const addSkillOffered = () => {
    if (newSkillOffered.trim() && !skillsOffered.includes(newSkillOffered.trim())) {
      setSkillsOffered([...skillsOffered, newSkillOffered.trim()])
      setNewSkillOffered("")
    }
  }

  const addSkillWanted = () => {
    if (newSkillWanted.trim() && !skillsWanted.includes(newSkillWanted.trim())) {
      setSkillsWanted([...skillsWanted, newSkillWanted.trim()])
      setNewSkillWanted("")
    }
  }

  const removeSkillOffered = (skill: string) => {
    setSkillsOffered(skillsOffered.filter((s) => s !== skill))
  }

  const removeSkillWanted = (skill: string) => {
    setSkillsWanted(skillsWanted.filter((s) => s !== skill))
  }

  const handleSave = async () => {
    if (!user) return

    setError("")
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        setError("Name is required")
        return
      }

      // Save comprehensive profile to database
      const { error: dbError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          name: formData.name,
          location: formData.location || null,
          skills_offered: skillsOffered,
          skills_wanted: skillsWanted,
          availability: formData.availability,
          profile_visibility: formData.profileVisibility,
          avatar_url: user.user_metadata?.avatar_url || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        },
      )

      if (dbError) {
        setError(dbError.message)
      } else {
        setSuccess(true)
        // Redirect to profile view after success
        setTimeout(() => {
          router.push("/profile")
        }, 2000)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDiscard = () => {
    router.push("/")
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#17a2b8]" />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-white shadow-lg border-0">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#1c1d1f] mb-2">Profile Saved!</h2>
            <p className="text-gray-600 mb-4">
              Your profile has been successfully created. You can now start connecting with other skill swappers!
            </p>
            <div className="flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-gray-500">Redirecting to home...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Navigation Header */}
      <header className="bg-[#1c1d1f] text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold hover:text-gray-200 transition-colors">
                Skill Swap Platform
              </Link>
            </div>

            {/* Navigation Items */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-[#28a745] hover:bg-[#218838] text-white font-medium px-4 py-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save
              </Button>
              <Button
                onClick={handleDiscard}
                disabled={loading}
                variant="outline"
                className="bg-transparent border-[#dc3545] text-[#dc3545] hover:bg-[#dc3545] hover:text-white font-medium px-4 py-2"
              >
                Discard
              </Button>
              <Button variant="ghost" className="text-white hover:text-gray-200 hover:bg-gray-700">
                Swap request
              </Button>
              <Link href="/">
                <Button variant="ghost" className="text-white hover:text-gray-200 hover:bg-gray-700">
                  Home
                </Button>
              </Link>

              {/* User Profile Icon */}
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="bg-gray-600 text-white">
                  {user.user_metadata?.full_name?.charAt(0) || <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1c1d1f] mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">
            Help others discover your skills and find the perfect skill exchange partners.
          </p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}

        <Card className="bg-white shadow-lg">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Form - Left Side */}
              <div className="lg:col-span-2 space-y-8">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="border-0 border-b-2 border-gray-300 rounded-none px-0 py-2 focus:border-[#17a2b8] focus:ring-0 bg-transparent"
                    disabled={loading}
                  />
                </div>

                {/* Location Field */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                    Location
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter your city, country"
                    className="border-0 border-b-2 border-gray-300 rounded-none px-0 py-2 focus:border-[#17a2b8] focus:ring-0 bg-transparent"
                    disabled={loading}
                  />
                </div>

                {/* Skills Offered */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700">Skills Offered</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {skillsOffered.map((skill, index) => (
                      <Badge
                        key={index}
                        className="bg-[#28a745] hover:bg-[#218838] text-white px-3 py-1 flex items-center gap-2"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkillOffered(skill)}
                          className="hover:bg-[#218838] rounded-full p-0.5"
                          disabled={loading}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newSkillOffered}
                      onChange={(e) => setNewSkillOffered(e.target.value)}
                      placeholder="Add a skill you can offer"
                      className="flex-1"
                      onKeyPress={(e) => e.key === "Enter" && addSkillOffered()}
                      disabled={loading}
                    />
                    <Button
                      onClick={addSkillOffered}
                      size="sm"
                      className="bg-[#28a745] hover:bg-[#218838] text-white"
                      disabled={loading}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Skills Wanted */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700">Skills Wanted</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {skillsWanted.map((skill, index) => (
                      <Badge
                        key={index}
                        className="bg-[#007bff] hover:bg-[#0056b3] text-white px-3 py-1 flex items-center gap-2"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkillWanted(skill)}
                          className="hover:bg-[#0056b3] rounded-full p-0.5"
                          disabled={loading}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newSkillWanted}
                      onChange={(e) => setNewSkillWanted(e.target.value)}
                      placeholder="Add a skill you want to learn"
                      className="flex-1"
                      onKeyPress={(e) => e.key === "Enter" && addSkillWanted()}
                      disabled={loading}
                    />
                    <Button
                      onClick={addSkillWanted}
                      size="sm"
                      className="bg-[#007bff] hover:bg-[#0056b3] text-white"
                      disabled={loading}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Availability */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Availability</Label>
                  <Select
                    value={formData.availability}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, availability: value }))}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekends">Weekends</SelectItem>
                      <SelectItem value="weekdays">Weekdays</SelectItem>
                      <SelectItem value="evenings">Evenings</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Profile Visibility */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Profile</Label>
                  <Select
                    value={formData.profileVisibility}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, profileVisibility: value }))}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="friends_only">Friends Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Profile Photo - Right Side */}
              <div className="lg:col-span-1 flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-40 w-40 border-4 border-gray-200">
                    <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gray-100 text-gray-400 text-4xl">
                      {formData.name.charAt(0) || <User className="h-16 w-16" />}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute bottom-2 right-2 rounded-full h-10 w-10 p-0 bg-[#17a2b8] hover:bg-[#138496]"
                    disabled={loading}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 mb-1">Profile Photo</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[#17a2b8] border-[#17a2b8] hover:bg-[#17a2b8] hover:text-white bg-transparent"
                    disabled={loading}
                  >
                    Add/Edit Photo
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
