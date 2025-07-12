export interface SkillExchangeRequest {
  id: string
  requester_id: string
  recipient_id: string
  requester_name: string
  recipient_name: string
  requester_avatar?: string
  recipient_avatar?: string
  requester_rating: number
  recipient_rating: number
  offered_skill: string
  wanted_skill: string
  message: string
  status: "pending" | "accepted" | "rejected" | "completed"
  created_at: string
  updated_at: string
}

export interface RequestFilters {
  status?: "all" | "pending" | "accepted" | "rejected" | "completed"
  search?: string
  type?: "all" | "sent" | "received"
}
