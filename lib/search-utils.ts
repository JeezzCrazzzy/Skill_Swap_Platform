import { supabase } from "@/lib/supabase"
import type { Profile } from "@/lib/supabase"

export interface SearchResult extends Profile {
  matchType: "offered" | "wanted" | "both"
  matchedSkills: string[]
  relevanceScore: number
}

export interface SearchFilters {
  availability?: string
  location?: string
  profileVisibility?: string
}

// Extract skills from search query
export function extractSkillsFromQuery(query: string): string[] {
  // Remove common words and split by spaces, commas, and other delimiters
  const commonWords = ["and", "or", "the", "a", "an", "in", "on", "at", "to", "for", "of", "with", "by"]
  const skills = query
    .toLowerCase()
    .split(/[,\s]+/)
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 1 && !commonWords.includes(skill))
    .map((skill) => skill.charAt(0).toUpperCase() + skill.slice(1)) // Capitalize first letter

  return [...new Set(skills)] // Remove duplicates
}

// Calculate relevance score based on skill matches
function calculateRelevanceScore(profile: Profile, searchedSkills: string[]): number {
  let score = 0
  const offeredSkills = profile.skills_offered || []
  const wantedSkills = profile.skills_wanted || []

  searchedSkills.forEach((skill) => {
    // Exact matches get higher score
    if (offeredSkills.some((offered) => offered.toLowerCase() === skill.toLowerCase())) {
      score += 10
    }
    if (wantedSkills.some((wanted) => wanted.toLowerCase() === skill.toLowerCase())) {
      score += 8
    }

    // Partial matches get lower score
    if (offeredSkills.some((offered) => offered.toLowerCase().includes(skill.toLowerCase()))) {
      score += 5
    }
    if (wantedSkills.some((wanted) => wanted.toLowerCase().includes(skill.toLowerCase()))) {
      score += 3
    }
  })

  return score
}

// Determine match type and matched skills
function getMatchInfo(
  profile: Profile,
  searchedSkills: string[],
): { matchType: "offered" | "wanted" | "both"; matchedSkills: string[] } {
  const offeredSkills = profile.skills_offered || []
  const wantedSkills = profile.skills_wanted || []
  const matchedSkills: string[] = []

  let hasOfferedMatch = false
  let hasWantedMatch = false

  searchedSkills.forEach((skill) => {
    // Check for exact and partial matches in offered skills
    const offeredMatch = offeredSkills.find(
      (offered) =>
        offered.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(offered.toLowerCase()),
    )
    if (offeredMatch) {
      hasOfferedMatch = true
      if (!matchedSkills.includes(offeredMatch)) {
        matchedSkills.push(offeredMatch)
      }
    }

    // Check for exact and partial matches in wanted skills
    const wantedMatch = wantedSkills.find(
      (wanted) =>
        wanted.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(wanted.toLowerCase()),
    )
    if (wantedMatch) {
      hasWantedMatch = true
      if (!matchedSkills.includes(wantedMatch)) {
        matchedSkills.push(wantedMatch)
      }
    }
  })

  let matchType: "offered" | "wanted" | "both"
  if (hasOfferedMatch && hasWantedMatch) {
    matchType = "both"
  } else if (hasOfferedMatch) {
    matchType = "offered"
  } else {
    matchType = "wanted"
  }

  return { matchType, matchedSkills }
}

// Search users by skills
export async function searchUsersBySkills(
  query: string,
  filters: SearchFilters = {},
  currentUserId?: string,
): Promise<{ results: SearchResult[]; searchedSkills: string[]; error?: string }> {
  try {
    if (!query.trim()) {
      return { results: [], searchedSkills: [] }
    }

    const searchedSkills = extractSkillsFromQuery(query)

    if (searchedSkills.length === 0) {
      return { results: [], searchedSkills: [] }
    }

    // Build the query - simplified to avoid auth.users join issues
    let dbQuery = supabase.from("profiles").select("*").neq("profile_visibility", "private")

    // Exclude current user from results
    if (currentUserId) {
      dbQuery = dbQuery.neq("id", currentUserId)
    }

    // Apply filters
    if (filters.availability) {
      dbQuery = dbQuery.eq("availability", filters.availability)
    }

    if (filters.location) {
      dbQuery = dbQuery.ilike("location", `%${filters.location}%`)
    }

    const { data: profiles, error } = await dbQuery

    if (error) {
      return { results: [], searchedSkills, error: error.message }
    }

    if (!profiles) {
      return { results: [], searchedSkills }
    }

    // Filter and score results
    const searchResults: SearchResult[] = profiles
      .map((profile) => {
        const relevanceScore = calculateRelevanceScore(profile, searchedSkills)
        const { matchType, matchedSkills } = getMatchInfo(profile, searchedSkills)

        return {
          ...profile,
          matchType,
          matchedSkills,
          relevanceScore,
        }
      })
      .filter((result) => result.relevanceScore > 0) // Only include profiles with matches
      .sort((a, b) => b.relevanceScore - a.relevanceScore) // Sort by relevance

    return { results: searchResults, searchedSkills }
  } catch (err) {
    return {
      results: [],
      searchedSkills: [],
      error: "An unexpected error occurred while searching",
    }
  }
}

// Get popular skills for suggestions
export async function getPopularSkills(): Promise<string[]> {
  try {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("skills_offered, skills_wanted")
      .neq("profile_visibility", "private")

    if (error || !profiles) {
      return []
    }

    const skillCounts: { [skill: string]: number } = {}

    profiles.forEach((profile) => {
      const allSkills = [...(profile.skills_offered || []), ...(profile.skills_wanted || [])]
      allSkills.forEach((skill) => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1
      })
    })

    return Object.entries(skillCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([skill]) => skill)
  } catch {
    return []
  }
}
