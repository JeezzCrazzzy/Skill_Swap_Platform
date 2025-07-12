"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, MapPin, Clock, Star, TrendingUp, Target, Users, Search, Filter } from "lucide-react"
import type { SearchResult } from "@/lib/search-utils"

interface SearchResultsProps {
  results: SearchResult[]
  searchedSkills: string[]
  query: string
  loading?: boolean
  onRequestSkill?: (userId: string, userName: string) => void
}

export function SearchResults({ results, searchedSkills, query, loading = false, onRequestSkill }: SearchResultsProps) {
  const getMatchTypeIcon = (matchType: "offered" | "wanted" | "both") => {
    switch (matchType) {
      case "offered":
        return <TrendingUp className="h-4 w-4 text-[#28a745]" />
      case "wanted":
        return <Target className="h-4 w-4 text-[#007bff]" />
      case "both":
        return <Users className="h-4 w-4 text-[#17a2b8]" />
    }
  }

  const getMatchTypeLabel = (matchType: "offered" | "wanted" | "both") => {
    switch (matchType) {
      case "offered":
        return "Offers these skills"
      case "wanted":
        return "Wants to learn these skills"
      case "both":
        return "Offers & wants related skills"
    }
  }

  const highlightMatchedSkills = (skills: string[], matchedSkills: string[]) => {
    return skills.map((skill, index) => {
      const isMatched = matchedSkills.some(
        (matched) =>
          matched.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(matched.toLowerCase()),
      )

      return (
        <Badge
          key={index}
          className={`${
            isMatched
              ? "bg-yellow-100 border-yellow-300 text-yellow-800 ring-2 ring-yellow-200"
              : "bg-gray-100 text-gray-700"
          } transition-all duration-200`}
        >
          {skill}
        </Badge>
      )
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white shadow-sm animate-pulse">
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

  if (results.length === 0) {
    return (
      <Card className="bg-white shadow-sm">
        <CardContent className="p-12 text-center">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Results Found</h3>
          <p className="text-gray-500 mb-4">
            {query ? (
              <>
                No users found with skills matching "<strong>{query}</strong>".
                <br />
                Try searching for different skills or check your spelling.
              </>
            ) : (
              "Enter a skill in the search box to find users who can help you learn or teach."
            )}
          </p>
          {searchedSkills.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Searched for:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {searchedSkills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-gray-600">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Summary */}
      <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-[#17a2b8]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[#1c1d1f]">
              Found {results.length} user{results.length !== 1 ? "s" : ""} matching your search
            </h3>
            <p className="text-sm text-gray-600">Showing results for: {searchedSkills.join(", ")}</p>
          </div>
          <Filter className="h-5 w-5 text-[#17a2b8]" />
        </div>
      </div>

      {/* Search Results */}
      <div className="space-y-4">
        {results.map((user) => (
          <Card
            key={user.id}
            className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-transparent hover:border-[#17a2b8]"
          >
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                {/* Profile Photo and Basic Info */}
                <div className="flex items-start gap-4 flex-shrink-0">
                  <Avatar className="h-16 w-16 border-2 border-gray-200">
                    <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className="bg-gray-100 text-gray-600 text-lg">
                      {user.name?.charAt(0) || <User className="h-6 w-6" />}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold text-[#1c1d1f] mb-1">{user.name}</h3>

                    {user.location && (
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="text-sm truncate">{user.location}</span>
                      </div>
                    )}

                    <div className="flex items-center text-gray-600 mb-2">
                      <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="text-sm capitalize">{user.availability}</span>
                    </div>

                    {/* Match Type Indicator */}
                    <div className="flex items-center gap-2 mb-3">
                      {getMatchTypeIcon(user.matchType)}
                      <span className="text-sm font-medium text-gray-700">{getMatchTypeLabel(user.matchType)}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-500">{user.relevanceScore}% match</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills Information */}
                <div className="flex-grow space-y-4 min-w-0">
                  {/* Matched Skills Highlight */}
                  {user.matchedSkills.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Target className="h-4 w-4 mr-1 text-[#17a2b8]" />
                        Matching Skills:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {user.matchedSkills.map((skill, index) => (
                          <Badge
                            key={index}
                            className="bg-[#17a2b8] text-white font-medium ring-2 ring-[#17a2b8] ring-opacity-20"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills Offered */}
                  {user.skills_offered && user.skills_offered.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Skills Offered:</p>
                      <div className="flex flex-wrap gap-2">
                        {highlightMatchedSkills(user.skills_offered, user.matchedSkills).map((badge, index) => (
                          <span key={index} className="inline-block">
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills Wanted */}
                  {user.skills_wanted && user.skills_wanted.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Skills Wanted:</p>
                      <div className="flex flex-wrap gap-2">
                        {highlightMatchedSkills(user.skills_wanted, user.matchedSkills).map((badge, index) => (
                          <span key={index} className="inline-block">
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="flex-shrink-0 w-full lg:w-auto">
                  <Button
                    onClick={() => onRequestSkill?.(user.id, user.name)}
                    className="w-full lg:w-auto bg-[#17a2b8] hover:bg-[#138496] text-white px-6 py-2 font-medium transition-colors duration-200"
                  >
                    Connect
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
