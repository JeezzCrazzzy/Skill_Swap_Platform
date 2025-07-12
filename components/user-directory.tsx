"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  User,
  MapPin,
  Clock,
  Calendar,
  Activity,
  Users,
  Filter,
  Eye,
  MessageCircle,
  Loader2,
  AlertCircle,
} from "lucide-react"
import {
  getDiscoverableProfiles,
  getPlatformStats,
  type DiscoverableProfile,
  type DiscoveryFilters,
} from "@/lib/user-discovery"
import Link from "next/link"

interface UserDirectoryProps {
  currentUserId?: string
  showFilters?: boolean
  limit?: number
}

export function UserDirectory({ currentUserId, showFilters = true, limit = 20 }: UserDirectoryProps) {
  const [profiles, setProfiles] = useState<DiscoverableProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, totalSkills: 0 })

  // Filter state
  const [filters, setFilters] = useState<DiscoveryFilters>({
    sortBy: "newest",
  })
  const [locationFilter, setLocationFilter] = useState("")

  useEffect(() => {
    loadProfiles()
    loadStats()
  }, [filters, currentPage])

  const loadProfiles = async () => {
    setLoading(true)
    setError("")

    const offset = (currentPage - 1) * limit
    const appliedFilters = {
      ...filters,
      location: locationFilter || undefined,
    }

    const {
      profiles: fetchedProfiles,
      total: totalCount,
      error: fetchError,
    } = await getDiscoverableProfiles(currentUserId, appliedFilters, limit, offset)

    if (fetchError) {
      setError(fetchError)
    } else {
      setProfiles(fetchedProfiles)
      setTotal(totalCount)
    }

    setLoading(false)
  }

  const loadStats = async () => {
    const platformStats = await getPlatformStats()
    if (!platformStats.error) {
      setStats(platformStats)
    }
  }

  const handleFilterChange = (key: keyof DiscoveryFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
    }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleLocationSearch = () => {
    setCurrentPage(1)
    loadProfiles()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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

  if (loading && profiles.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#1c1d1f]">Community Members</h2>
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-[#17a2b8]" />
            <span className="text-sm text-gray-600">Loading profiles...</span>
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1c1d1f] flex items-center gap-2">
            <Users className="h-6 w-6 text-[#17a2b8]" />
            Community Members
          </h2>
          <p className="text-gray-600">
            {total > 0 ? `${total} member${total !== 1 ? "s" : ""} ready to share skills` : "No members found"}
          </p>
        </div>

        {/* Platform Stats */}
        <div className="flex gap-4 text-sm">
          <div className="text-center">
            <div className="font-bold text-[#17a2b8]">{stats.totalUsers}</div>
            <div className="text-gray-600">Total Users</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-[#28a745]">{stats.activeUsers}</div>
            <div className="text-gray-600">Active</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-[#007bff]">{stats.totalSkills}</div>
            <div className="text-gray-600">Skills</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#17a2b8]" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <Select
                  value={filters.availability || "all"}
                  onValueChange={(value) => handleFilterChange("availability", value)}
                >
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="Availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Availability</SelectItem>
                    <SelectItem value="weekends">Weekends</SelectItem>
                    <SelectItem value="weekdays">Weekdays</SelectItem>
                    <SelectItem value="evenings">Evenings</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Input
                    placeholder="Filter by location..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full sm:w-48"
                    onKeyPress={(e) => e.key === "Enter" && handleLocationSearch()}
                  />
                  <Button onClick={handleLocationSearch} size="sm" variant="outline">
                    Apply
                  </Button>
                </div>

                <Select
                  value={filters.sortBy || "newest"}
                  onValueChange={(value) => handleFilterChange("sortBy", value)}
                >
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="most_active">Most Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profiles Grid */}
      {profiles.length > 0 ? (
        <div className="grid gap-4">
          {profiles.map((profile) => (
            <Card
              key={profile.id}
              className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
            >
              <Link href={`/profile/${profile.id}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                    {/* Profile Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar className="h-16 w-16 border-2 border-gray-200">
                        <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.name} />
                        <AvatarFallback className="bg-gray-100 text-gray-600 text-lg">
                          {profile.name?.charAt(0) || <User className="h-6 w-6" />}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-semibold text-[#1c1d1f] truncate hover:text-[#17a2b8] transition-colors">
                            {profile.name}
                          </h3>
                          <div className="flex items-center gap-2 ml-4">
                            <Progress value={profile.profile_completion} className="w-16 h-2" />
                            <span className="text-xs text-gray-500">{profile.profile_completion}%</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                          {profile.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{profile.location}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span className="capitalize">{profile.availability}</span>
                          </div>

                          {profile.created_at && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Joined {formatDate(profile.created_at)}</span>
                            </div>
                          )}

                          {profile.updated_at && (
                            <div className="flex items-center gap-1">
                              <Activity className="h-4 w-4" />
                              <span>Updated {getTimeAgo(profile.updated_at)}</span>
                            </div>
                          )}
                        </div>

                        {/* Skills */}
                        <div className="space-y-3">
                          {profile.skills_offered && profile.skills_offered.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">Skills Offered:</p>
                              <div className="flex flex-wrap gap-1">
                                {profile.skills_offered.slice(0, 4).map((skill, index) => (
                                  <Badge key={index} className="bg-[#28a745] text-white text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {profile.skills_offered.length > 4 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{profile.skills_offered.length - 4} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {profile.skills_wanted && profile.skills_wanted.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">Skills Wanted:</p>
                              <div className="flex flex-wrap gap-1">
                                {profile.skills_wanted.slice(0, 4).map((skill, index) => (
                                  <Badge key={index} className="bg-[#007bff] text-white text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {profile.skills_wanted.length > 4 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{profile.skills_wanted.length - 4} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                      <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                      <Button
                        className="w-full sm:w-auto bg-[#17a2b8] hover:bg-[#138496] text-white"
                        onClick={(e) => {
                          e.preventDefault()
                          alert(`Connect request sent to ${profile.name}!`)
                        }}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        !loading && (
          <Card className="bg-white shadow-sm">
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Members Found</h3>
              <p className="text-gray-500 mb-4">
                {Object.keys(filters).length > 1 || locationFilter
                  ? "Try adjusting your filters to see more members."
                  : "Be the first to complete your profile and start connecting with others!"}
              </p>
              {currentUserId && (
                <Link href="/profile-setup">
                  <Button className="bg-[#17a2b8] hover:bg-[#138496] text-white">Complete Your Profile</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || loading}
          >
            Previous
          </Button>

          <span className="text-sm text-gray-600 px-4">
            Page {currentPage} of {Math.ceil(total / limit)}
          </span>

          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage >= Math.ceil(total / limit) || loading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
