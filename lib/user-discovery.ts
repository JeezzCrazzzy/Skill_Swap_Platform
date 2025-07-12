import { supabase } from "@/lib/supabase"
import type { Profile } from "@/lib/supabase"

export interface DiscoverableProfile extends Profile {
  profile_completion?: number
}

export interface DiscoveryFilters {
  availability?: string
  location?: string
  skills?: string[]
  minRating?: number
  maxDistance?: number
  sortBy?: "newest" | "oldest" | "most_active" | "best_match"
}

// Get all discoverable profiles with enhanced information
export async function getDiscoverableProfiles(
  currentUserId?: string,
  filters: DiscoveryFilters = {},
  limit = 20,
  offset = 0,
): Promise<{ profiles: DiscoverableProfile[]; total: number; error?: string }> {
  try {
    let query = supabase.from("profiles").select("*", { count: "exact" }).neq("profile_visibility", "private")

    // Exclude current user
    if (currentUserId) {
      query = query.neq("id", currentUserId)
    }

    // Apply filters
    if (filters.availability) {
      query = query.eq("availability", filters.availability)
    }

    if (filters.location) {
      query = query.ilike("location", `%${filters.location}%`)
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "newest":
        query = query.order("created_at", { ascending: false })
        break
      case "oldest":
        query = query.order("created_at", { ascending: true })
        break
      case "most_active":
        query = query.order("updated_at", { ascending: false })
        break
      default:
        query = query.order("created_at", { ascending: false })
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      return { profiles: [], total: 0, error: error.message }
    }

    if (!data) {
      return { profiles: [], total: 0 }
    }

    // Enhance profiles with additional information
    const enhancedProfiles: DiscoverableProfile[] = data.map((profile: Profile) => {
      const profileCompletion = calculateProfileCompletion(profile)

      return {
        ...profile,
        profile_completion: profileCompletion,
      }
    })

    return {
      profiles: enhancedProfiles,
      total: count || 0,
    }
  } catch (err) {
    return {
      profiles: [],
      total: 0,
      error: "Failed to fetch discoverable profiles",
    }
  }
}

// Calculate profile completion percentage
function calculateProfileCompletion(profile: Profile): number {
  let completionScore = 0
  const maxScore = 7

  if (profile.name) completionScore += 1
  if (profile.location) completionScore += 1
  if (profile.skills_offered && profile.skills_offered.length > 0) completionScore += 2
  if (profile.skills_wanted && profile.skills_wanted.length > 0) completionScore += 2
  if (profile.avatar_url) completionScore += 1

  return Math.round((completionScore / maxScore) * 100)
}

// Get profile by ID for detailed view
export async function getProfileById(
  profileId: string,
  currentUserId?: string,
): Promise<{ profile: DiscoverableProfile | null; error?: string }> {
  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", profileId).single()

    if (error) {
      return { profile: null, error: error.message }
    }

    if (!data) {
      return { profile: null, error: "Profile not found" }
    }

    // Check if profile is private and user is not the owner
    if (data.profile_visibility === "private" && currentUserId !== profileId) {
      return { profile: null, error: "This profile is private" }
    }

    const profileCompletion = calculateProfileCompletion(data)

    const enhancedProfile: DiscoverableProfile = {
      ...data,
      profile_completion: profileCompletion,
    }

    return { profile: enhancedProfile }
  } catch (err) {
    return {
      profile: null,
      error: "Failed to fetch profile",
    }
  }
}

// Get recently active users
export async function getRecentlyActiveUsers(
  currentUserId?: string,
  limit = 10,
): Promise<{ profiles: DiscoverableProfile[]; error?: string }> {
  try {
    let query = supabase
      .from("profiles")
      .select("*")
      .neq("profile_visibility", "private")
      .order("updated_at", { ascending: false })
      .limit(limit)

    if (currentUserId) {
      query = query.neq("id", currentUserId)
    }

    const { data, error } = await query

    if (error) {
      return { profiles: [], error: error.message }
    }

    if (!data) {
      return { profiles: [] }
    }

    const enhancedProfiles: DiscoverableProfile[] = data.map((profile: Profile) => {
      const profileCompletion = calculateProfileCompletion(profile)

      return {
        ...profile,
        profile_completion: profileCompletion,
      }
    })

    return { profiles: enhancedProfiles }
  } catch (err) {
    return {
      profiles: [],
      error: "Failed to fetch recently active users",
    }
  }
}

// Get users with similar skills
export async function getSimilarUsers(
  userSkills: string[],
  currentUserId?: string,
  limit = 5,
): Promise<{ profiles: DiscoverableProfile[]; error?: string }> {
  try {
    if (!userSkills || userSkills.length === 0) {
      return { profiles: [] }
    }

    let query = supabase
      .from("profiles")
      .select("*")
      .neq("profile_visibility", "private")
      .limit(limit * 2) // Get more to filter and sort

    if (currentUserId) {
      query = query.neq("id", currentUserId)
    }

    const { data, error } = await query

    if (error) {
      return { profiles: [], error: error.message }
    }

    if (!data) {
      return { profiles: [] }
    }

    // Filter and score profiles based on skill similarity
    const scoredProfiles = data
      .map((profile: Profile) => {
        const profileCompletion = calculateProfileCompletion(profile)

        let similarityScore = 0
        const allProfileSkills = [...(profile.skills_offered || []), ...(profile.skills_wanted || [])]

        userSkills.forEach((userSkill) => {
          allProfileSkills.forEach((profileSkill) => {
            if (userSkill.toLowerCase() === profileSkill.toLowerCase()) {
              similarityScore += 10
            } else if (
              userSkill.toLowerCase().includes(profileSkill.toLowerCase()) ||
              profileSkill.toLowerCase().includes(userSkill.toLowerCase())
            ) {
              similarityScore += 5
            }
          })
        })

        return {
          ...profile,
          profile_completion: profileCompletion,
          similarity_score: similarityScore,
        }
      })
      .filter((profile) => profile.similarity_score > 0)
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, limit)

    return { profiles: scoredProfiles }
  } catch (err) {
    return {
      profiles: [],
      error: "Failed to fetch similar users",
    }
  }
}

// Get user statistics for the platform
export async function getPlatformStats(): Promise<{
  totalUsers: number
  activeUsers: number
  totalSkills: number
  error?: string
}> {
  try {
    // Get total users
    const { count: totalUsers, error: totalError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .neq("profile_visibility", "private")

    if (totalError) {
      return { totalUsers: 0, activeUsers: 0, totalSkills: 0, error: totalError.message }
    }

    // Get recently active users (updated in last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: activeUsers, error: activeError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .neq("profile_visibility", "private")
      .gte("updated_at", thirtyDaysAgo.toISOString())

    if (activeError) {
      return { totalUsers: totalUsers || 0, activeUsers: 0, totalSkills: 0, error: activeError.message }
    }

    // Get all skills to count unique ones
    const { data: skillsData, error: skillsError } = await supabase
      .from("profiles")
      .select("skills_offered, skills_wanted")
      .neq("profile_visibility", "private")

    let totalSkills = 0
    if (!skillsError && skillsData) {
      const allSkills = new Set<string>()
      skillsData.forEach((profile) => {
        ;[...(profile.skills_offered || []), ...(profile.skills_wanted || [])].forEach((skill) => {
          allSkills.add(skill.toLowerCase())
        })
      })
      totalSkills = allSkills.size
    }

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalSkills,
    }
  } catch (err) {
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalSkills: 0,
      error: "Failed to fetch platform statistics",
    }
  }
}
