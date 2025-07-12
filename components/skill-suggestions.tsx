"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Lightbulb, TrendingUp } from "lucide-react"
import { getPopularSkills } from "@/lib/search-utils"

interface SkillSuggestionsProps {
  onSkillClick: (skill: string) => void
  className?: string
}

export function SkillSuggestions({ onSkillClick, className = "" }: SkillSuggestionsProps) {
  const [popularSkills, setPopularSkills] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPopularSkills = async () => {
      const skills = await getPopularSkills()
      setPopularSkills(skills)
      setLoading(false)
    }

    loadPopularSkills()
  }, [])

  if (loading) {
    return (
      <div className={`bg-white p-4 rounded-lg shadow-sm ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-[#17a2b8]" />
          <span className="text-sm font-medium text-gray-700">Popular Skills</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
          ))}
        </div>
      </div>
    )
  }

  if (popularSkills.length === 0) {
    return null
  }

  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-4 w-4 text-[#17a2b8]" />
        <span className="text-sm font-medium text-gray-700">Popular Skills</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {popularSkills.slice(0, 10).map((skill, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSkillClick(skill)}
            className="h-auto py-1 px-3 text-xs hover:bg-[#17a2b8] hover:text-white hover:border-[#17a2b8] transition-colors duration-200"
          >
            {skill}
          </Button>
        ))}
      </div>

      {popularSkills.length > 10 && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Lightbulb className="h-3 w-3" />
            Click any skill to search for users
          </p>
        </div>
      )}
    </div>
  )
}
