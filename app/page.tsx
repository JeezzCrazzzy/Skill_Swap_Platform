"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, User, LogOut, Loader2, AlertCircle, X } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { authUtils } from "@/lib/auth-utils"
import { searchUsersBySkills, type SearchResult, type SearchFilters } from "@/lib/search-utils"
import { SearchResults } from "@/components/search-results"
import { SkillSuggestions } from "@/components/skill-suggestions"
import Link from "next/link"
import { UserDirectory } from "@/components/user-directory"

export default function SkillswapLanding() {
  const { user, loading: authLoading } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchedSkills, setSearchedSkills] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState("")
  const [hasSearched, setHasSearched] = useState(false)

  // Filter state
  const [filters, setFilters] = useState<SearchFilters>({})
  const [showFilters, setShowFilters] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    await authUtils.signOut()
    setSigningOut(false)
  }

  const handleSearch = async (query: string = searchQuery) => {
    if (!query.trim()) {
      setSearchResults([])
      setSearchedSkills([])
      setHasSearched(false)
      setSearchError("")
      return
    }

    setIsSearching(true)
    setSearchError("")
    setHasSearched(true)

    try {
      const { results, searchedSkills, error } = await searchUsersBySkills(query, filters, user?.id)

      if (error) {
        setSearchError(error)
      } else {
        setSearchResults(results)
        setSearchedSkills(searchedSkills)
      }
    } catch (err) {
      setSearchError("An unexpected error occurred while searching")
    } finally {
      setIsSearching(false)
    }
  }

  const handleSkillSuggestionClick = (skill: string) => {
    setSearchQuery(skill)
    handleSearch(skill)
  }

  const handleRequestSkill = (userId: string, userName: string) => {
    // TODO: Implement skill request functionality
    alert(`Skill request sent to ${userName}!`)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setSearchedSkills([])
    setHasSearched(false)
    setSearchError("")
  }

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value === "all" ? undefined : value }
    setFilters(newFilters)

    // Re-search with new filters if we have a query
    if (searchQuery.trim()) {
      handleSearch()
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#17a2b8] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
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
              <h1 className="text-xl font-bold">Skill Swap Platform</h1>
            </div>

            {/* Navigation based on auth state */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-300 hidden sm:block">
                    Welcome, {user.user_metadata?.full_name || user.email}
                  </span>
                  <Link href="/profile">
                    <Button variant="ghost" className="text-white hover:text-gray-200 hover:bg-gray-700">
                      My Profile
                    </Button>
                  </Link>
                  <Button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    variant="outline"
                    className="bg-transparent border-white text-white hover:bg-white hover:text-[#1c1d1f] transition-colors duration-200"
                  >
                    {signingOut ? <LogOut className="h-4 w-4 animate-spin" /> : "Sign Out"}
                  </Button>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gray-600 text-white">
                      {user.user_metadata?.full_name?.charAt(0) || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </>
              ) : (
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="bg-transparent border-white text-white hover:bg-white hover:text-[#1c1d1f]"
                  >
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message for Authenticated Users */}
        {user && !hasSearched && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border-l-4 border-[#17a2b8]">
            <h2 className="text-xl font-semibold text-[#1c1d1f] mb-2">
              Welcome to Skillswap, {user.user_metadata?.full_name || "there"}! 👋
            </h2>
            <p className="text-gray-600">
              Search for skills to find amazing learning and teaching opportunities with our community.
            </p>
          </div>
        )}

        {/* Enhanced Search and Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex flex-col space-y-4">
              {/* Main Search Bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Search for skills (e.g., JavaScript, Design, Marketing)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full pl-4 pr-10 py-3 text-lg bg-white border-2 border-gray-200 focus:border-[#17a2b8] focus:ring-0"
                    disabled={isSearching}
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <Button
                  onClick={() => handleSearch()}
                  disabled={isSearching || !searchQuery.trim()}
                  className="bg-[#17a2b8] hover:bg-[#138496] text-white px-8 py-3 text-lg"
                >
                  {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                </Button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Select
                  value={filters.availability || "all"}
                  onValueChange={(value) => handleFilterChange("availability", value)}
                >
                  <SelectTrigger className="w-full sm:w-[180px] bg-white">
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

                <Input
                  placeholder="Filter by location..."
                  value={filters.location || ""}
                  onChange={(e) => handleFilterChange("location", e.target.value)}
                  className="w-full sm:w-64 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Skill Suggestions */}
          {!hasSearched && <SkillSuggestions onSkillClick={handleSkillSuggestionClick} />}
        </div>

        {/* Search Error */}
        {searchError && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">{searchError}</AlertDescription>
          </Alert>
        )}

        {/* Search Results, User Directory, or Default User Cards */}
        {hasSearched ? (
          <SearchResults
            results={searchResults}
            searchedSkills={searchedSkills}
            query={searchQuery}
            loading={isSearching}
            onRequestSkill={handleRequestSkill}
          />
        ) : (
          <UserDirectory currentUserId={user?.id} />
        )}
      </main>
    </div>
  )
}
