import type { SkillExchangeRequest, RequestFilters } from "./skill-exchange-types"

// Mock data for demonstration - in a real app, this would come from the database
const mockRequests: SkillExchangeRequest[] = [
  {
    id: "req-1",
    requester_id: "user-1",
    recipient_id: "current-user",
    requester_name: "Marc Demo",
    recipient_name: "Current User",
    requester_avatar: "/placeholder.svg",
    requester_rating: 3.4,
    recipient_rating: 4.2,
    offered_skill: "JavaScript",
    wanted_skill: "React",
    message: "Hi! I'd love to learn React from you and can teach JavaScript in return.",
    status: "pending",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "req-2",
    requester_id: "user-2",
    recipient_id: "current-user",
    requester_name: "Sarah Johnson",
    recipient_name: "Current User",
    requester_avatar: "/placeholder.svg",
    requester_rating: 4.8,
    recipient_rating: 4.2,
    offered_skill: "Python",
    wanted_skill: "Machine Learning",
    message: "I'm experienced in Python and would love to learn ML techniques from you!",
    status: "pending",
    created_at: "2024-01-14T15:45:00Z",
    updated_at: "2024-01-14T15:45:00Z",
  },
  {
    id: "req-3",
    requester_id: "user-3",
    recipient_id: "current-user",
    requester_name: "Alex Chen",
    recipient_name: "Current User",
    requester_avatar: "/placeholder.svg",
    requester_rating: 2.9,
    recipient_rating: 4.2,
    offered_skill: "Design",
    wanted_skill: "Frontend Development",
    message: "I can help with UI/UX design and want to improve my frontend skills.",
    status: "rejected",
    created_at: "2024-01-13T09:20:00Z",
    updated_at: "2024-01-13T11:30:00Z",
  },
  {
    id: "req-4",
    requester_id: "current-user",
    recipient_id: "user-4",
    requester_name: "Current User",
    recipient_name: "Emma Wilson",
    recipient_avatar: "/placeholder.svg",
    requester_rating: 4.2,
    recipient_rating: 4.6,
    offered_skill: "React",
    wanted_skill: "Node.js",
    message: "I'd like to learn backend development with Node.js and can teach React.",
    status: "accepted",
    created_at: "2024-01-12T14:15:00Z",
    updated_at: "2024-01-12T16:20:00Z",
  },
  {
    id: "req-5",
    requester_id: "current-user",
    recipient_id: "user-5",
    requester_name: "Current User",
    recipient_name: "David Kim",
    recipient_avatar: "/placeholder.svg",
    requester_rating: 4.2,
    recipient_rating: 3.7,
    offered_skill: "TypeScript",
    wanted_skill: "DevOps",
    message: "Looking to learn DevOps practices and can share TypeScript knowledge.",
    status: "pending",
    created_at: "2024-01-11T11:00:00Z",
    updated_at: "2024-01-11T11:00:00Z",
  },
]

export async function getSkillExchangeRequests(
  userId: string,
  filters: RequestFilters = {},
  page = 1,
  limit = 10,
): Promise<{
  requests: SkillExchangeRequest[]
  total: number
  totalPages: number
  error?: string
}> {
  try {
    // Filter requests based on criteria
    let filteredRequests = mockRequests

    // Filter by type (sent/received)
    if (filters.type === "sent") {
      filteredRequests = filteredRequests.filter((req) => req.requester_id === userId)
    } else if (filters.type === "received") {
      filteredRequests = filteredRequests.filter((req) => req.recipient_id === userId)
    } else {
      // Show all requests involving the user
      filteredRequests = filteredRequests.filter((req) => req.requester_id === userId || req.recipient_id === userId)
    }

    // Filter by status
    if (filters.status && filters.status !== "all") {
      filteredRequests = filteredRequests.filter((req) => req.status === filters.status)
    }

    // Filter by search query
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filteredRequests = filteredRequests.filter(
        (req) =>
          req.requester_name.toLowerCase().includes(searchLower) ||
          req.recipient_name.toLowerCase().includes(searchLower) ||
          req.offered_skill.toLowerCase().includes(searchLower) ||
          req.wanted_skill.toLowerCase().includes(searchLower) ||
          req.message.toLowerCase().includes(searchLower),
      )
    }

    // Sort by most recent first
    filteredRequests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // Paginate
    const total = filteredRequests.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const paginatedRequests = filteredRequests.slice(startIndex, startIndex + limit)

    return {
      requests: paginatedRequests,
      total,
      totalPages,
    }
  } catch (error) {
    return {
      requests: [],
      total: 0,
      totalPages: 0,
      error: "Failed to fetch skill exchange requests",
    }
  }
}

export async function updateRequestStatus(
  requestId: string,
  status: "accepted" | "rejected",
): Promise<{ success: boolean; error?: string }> {
  try {
    // TODO: Implement actual database update
    // For now, simulate the update
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Update the mock data
    const requestIndex = mockRequests.findIndex((req) => req.id === requestId)
    if (requestIndex !== -1) {
      mockRequests[requestIndex].status = status
      mockRequests[requestIndex].updated_at = new Date().toISOString()
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: "Failed to update request status",
    }
  }
}
