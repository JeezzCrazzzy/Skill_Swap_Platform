"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  User,
  MapPin,
  Clock,
  Calendar,
  Eye,
  EyeOff,
  MessageCircle,
  ArrowLeft,
  CheckCircle,
  Star,
  Loader2,
  AlertCircle,
  Shield,
  Target,
  ThumbsUp,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { getProfileById, type DiscoverableProfile } from "@/lib/user-discovery"
import { SkillExchangeModal } from "@/components/skill-exchange-modal"
import Link from "next/link"

export default function PublicProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [profile, setProfile] = useState<DiscoverableProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showSkillExchangeModal, setShowSkillExchangeModal] = useState(false)

  const profileId = params.id as string

  useEffect(() => {
    if (profileId) {
      loadProfile()
    }
  }, [profileId, user])

  const loadProfile = async () => {
    setLoading(true)
    setError("")

    const { profile: fetchedProfile, error: fetchError } = await getProfileById(profileId, user?.id)

    if (fetchError) {
      setError(fetchError)
    } else {
      setProfile(fetchedProfile)
    }

    setLoading(false)
  }

  const handleSkillExchangeRequest = () => {
    if (!user) {
      router.push("/login")
      return
    }
    setShowSkillExchangeModal(true)
  }

  const handleSkillExchangeSuccess = () => {
    // TODO: Navigate to request management page (Screen 6)
    router.push("/")
  }

  const generateRating = (profileId: string) => {
    // Generate consistent rating based on profile ID (same as landing page)
    const hash = profileId.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)
    return ((Math.abs(hash) % 21) + 20) / 10 // Rating between 2.0 and 4.0
  }

  const generateFeedbackCount = (profileId: string) => {
    // Generate consistent feedback count
    const hash = profileId.split("").reduce((a, b) => {
      a = (a << 7) - a + b.charCodeAt(0)
      return a & a
    }, 0)
    return (Math.abs(hash) % 25) + 5 // Between 5-30 reviews
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return `${Math.floor(diffInHours / 168)}w ago`
  }

  const getVisibilityDisplay = (visibility: string) => {
    const visibilityMap: { [key: string]: { label: string; icon: React.ReactNode; color: string } } = {
      public: { label: "Public Profile", icon: <Eye className="h-4 w-4" />, color: "text-green-600" },
      private: { label: "Private Profile", icon: <EyeOff className="h-4 w-4" />, color: "text-red-600" },
      friends_only: { label: "Friends Only", icon: <Shield className="h-4 w-4" />, color: "text-blue-600" },
    }
    return visibilityMap[visibility] || visibilityMap.public
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa]">
        {/* Navigation Header */}
        <header className="bg-[#1c1d1f] text-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-xl font-bold hover:text-gray-200 transition-colors">
                Skill Swap Platform
              </Link>

              <div className="flex items-center space-x-6">
                <Link href="/swap-requests">
                  <Button variant="ghost" className="text-white hover:text-gray-200 hover:bg-gray-700">
                    Swap request
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="ghost" className="text-white hover:text-gray-200 hover:bg-gray-700">
                    Home
                  </Button>
                </Link>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gray-600 text-white">
                    {user?.user_metadata?.full_name?.charAt(0) || <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-[#17a2b8] mx-auto mb-4" />
              <p className="text-gray-600">Loading profile...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#f8f9fa]">
        {/* Navigation Header */}
        <header className="bg-[#1c1d1f] text-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-xl font-bold hover:text-gray-200 transition-colors">
                Skill Swap Platform
              </Link>

              <div className="flex items-center space-x-6">
                <Link href="/swap-requests">
                  <Button variant="ghost" className="text-white hover:text-gray-200 hover:bg-gray-700">
                    Swap request
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="ghost" className="text-white hover:text-gray-200 hover:bg-gray-700">
                    Home
                  </Button>
                </Link>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gray-600 text-white">
                    {user?.user_metadata?.full_name?.charAt(0) || <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-white shadow-lg">
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#1c1d1f] mb-2">Profile Not Found</h2>
              <p className="text-gray-600 mb-6">
                {error || "The profile you're looking for doesn't exist or is private."}
              </p>
              <Link href="/">
                <Button className="bg-[#17a2b8] hover:bg-[#138496] text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const rating = generateRating(profile.id)
  const feedbackCount = generateFeedbackCount(profile.id)
  const isOwnProfile = user?.id === profileId

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Navigation Header */}
      <header className="bg-[#1c1d1f] text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold hover:text-gray-200 transition-colors">
              Skill Swap Platform
            </Link>

            <div className="flex items-center space-x-6">
              <Link href="/swap-requests">
                <Button variant="ghost" className="text-white hover:text-gray-200 hover:bg-gray-700">
                  Swap request
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" className="text-white hover:text-gray-200 hover:bg-gray-700">
                  Home
                </Button>
              </Link>
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="bg-gray-600 text-white">
                  {user?.user_metadata?.full_name?.charAt(0) || <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Request Button - Top Left */}
        <div className="mb-6">
          {!isOwnProfile && (
            <Button
              onClick={handleSkillExchangeRequest}
              className="bg-[#17a2b8] hover:bg-[#138496] text-white px-8 py-3 text-lg font-medium rounded-lg shadow-lg"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Request
            </Button>
          )}
        </div>

        {/* Profile Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Side - Profile Info */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-[#1c1d1f] mb-4">{profile.name}</h1>

              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                {profile.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span className="text-lg">{profile.location}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span className="text-lg capitalize">{profile.availability}</span>
                </div>

                {profile.created_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span className="text-lg">
                      Member since{" "}
                      {new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Profile Photo */}
          <div className="lg:col-span-1 flex justify-center lg:justify-end">
            <Avatar className="h-48 w-48 border-4 border-white shadow-xl">
              <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.name} />
              <AvatarFallback className="bg-gray-200 text-gray-600 text-6xl">
                {profile.name?.charAt(0) || <User className="h-24 w-24" />}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Main Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Skills Offered Section */}
          <Card className="bg-white shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-2xl font-bold text-[#1c1d1f]">
                <CheckCircle className="h-6 w-6 mr-3 text-[#28a745]" />
                Skills Offered
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.skills_offered && profile.skills_offered.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-3">
                    {profile.skills_offered.map((skill, index) => (
                      <Badge
                        key={index}
                        className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-2 text-sm font-medium rounded-full"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-gray-600 mt-4">
                    {profile.name} can help you learn these skills through hands-on teaching and mentorship.
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 italic text-lg">No skills offered yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Skills Wanted Section */}
          <Card className="bg-white shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-2xl font-bold text-[#1c1d1f]">
                <Target className="h-6 w-6 mr-3 text-[#007bff]" />
                Skills Wanted
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.skills_wanted && profile.skills_wanted.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-3">
                    {profile.skills_wanted.map((skill, index) => (
                      <Badge
                        key={index}
                        className="bg-[#007bff] hover:bg-[#0056b3] text-white px-4 py-2 text-sm font-medium rounded-full"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-gray-600 mt-4">
                    {profile.name} is looking to learn these skills and would appreciate your guidance.
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 italic text-lg">No learning goals set yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Rating and Feedback Section */}
        <Card className="bg-white shadow-lg mt-8">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-2xl font-bold text-[#1c1d1f]">
              <Star className="h-6 w-6 mr-3 text-yellow-500" />
              Rating and Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Rating Overview */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-bold text-[#1c1d1f]">{rating.toFixed(1)}</div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600">Based on {feedbackCount} reviews</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-[#28a745]" />
                    <span className="text-gray-700">Excellent communication</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-[#28a745]" />
                    <span className="text-gray-700">Patient and helpful teacher</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-[#28a745]" />
                    <span className="text-gray-700">Reliable and punctual</span>
                  </div>
                </div>
              </div>

              {/* Recent Feedback */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[#1c1d1f]">Recent Feedback</h4>
                <div className="space-y-4">
                  <div className="border-l-4 border-[#17a2b8] pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">2 weeks ago</span>
                    </div>
                    <p className="text-gray-700">
                      "Great teacher! {profile.name} helped me understand JavaScript concepts clearly and patiently."
                    </p>
                    <p className="text-sm text-gray-500 mt-1">- Sarah K.</p>
                  </div>

                  <div className="border-l-4 border-[#17a2b8] pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4].map((star) => (
                          <Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                        <Star className="h-3 w-3 text-gray-300" />
                      </div>
                      <span className="text-sm text-gray-500">1 month ago</span>
                    </div>
                    <p className="text-gray-700">
                      "Very knowledgeable and willing to share expertise. Would definitely recommend!"
                    </p>
                    <p className="text-sm text-gray-500 mt-1">- Mike R.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Section */}
        {!isOwnProfile && (
          <div className="mt-8 text-center">
            <Card className="bg-[#17a2b8] text-white shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Ready to start learning?</h3>
                <p className="text-lg mb-6 opacity-90">
                  Send a skill exchange request to {profile.name} and begin your learning journey together.
                </p>
                <Button
                  onClick={handleSkillExchangeRequest}
                  className="bg-white text-[#17a2b8] hover:bg-gray-100 px-8 py-3 text-lg font-medium"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Send Skill Exchange Request
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Skill Exchange Modal */}
      {profile && (
        <SkillExchangeModal
          isOpen={showSkillExchangeModal}
          onClose={() => setShowSkillExchangeModal(false)}
          targetUser={{
            id: profile.id,
            name: profile.name,
            skills_wanted: profile.skills_wanted || [],
          }}
          onSuccess={handleSkillExchangeSuccess}
        />
      )}
    </div>
  )
}
