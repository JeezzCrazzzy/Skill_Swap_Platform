"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  User,
  Search,
  Check,
  X,
  Star,
  Clock,
  MessageCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { getSkillExchangeRequests, updateRequestStatus } from "@/lib/skill-exchange-utils"
import type { SkillExchangeRequest, RequestFilters } from "@/lib/skill-exchange-types"
import Link from "next/link"

export default function SwapRequestsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [requests, setRequests] = useState<SkillExchangeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 5

  // Filter state
  const [filters, setFilters] = useState<RequestFilters>({
    status: "all",
    search: "",
    type: "all",
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  // Load requests when filters or page changes
  useEffect(() => {
    if (user) {
      loadRequests()
    }
  }, [user, filters, currentPage])

  const loadRequests = async () => {
    if (!user) return

    setLoading(true)
    setError("")

    const {
      requests: fetchedRequests,
      total: totalCount,
      totalPages: pages,
      error: fetchError,
    } = await getSkillExchangeRequests(user.id, filters, currentPage, limit)

    if (fetchError) {
      setError(fetchError)
    } else {
      setRequests(fetchedRequests)
      setTotal(totalCount)
      setTotalPages(pages)
    }

    setLoading(false)
  }

  const handleStatusUpdate = async (requestId: string, status: "accepted" | "rejected") => {
    setActionLoading(requestId)

    const { success, error } = await updateRequestStatus(requestId, status)

    if (success) {
      // Reload requests to reflect the change
      await loadRequests()
    } else {
      setError(error || "Failed to update request")
    }

    setActionLoading(null)
  }

  const handleFilterChange = (key: keyof RequestFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleSearch = (searchValue: string) => {
    setFilters((prev) => ({ ...prev, search: searchValue }))
    setCurrentPage(1)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      accepted: { label: "Accepted", className: "bg-green-100 text-green-800 border-green-200" },
      rejected: { label: "Rejected", className: "bg-red-100 text-red-800 border-red-200" },
      completed: { label: "Completed", className: "bg-blue-100 text-blue-800 border-blue-200" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

    return <Badge className={`${config.className} font-medium`}>{config.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isReceivedRequest = (request: SkillExchangeRequest) => {
    return request.recipient_id === user?.id
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#17a2b8] mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

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
              <Link href="/">
                <Button variant="ghost" className="text-white hover:text-gray-200 hover:bg-gray-700">
                  Home
                </Button>
              </Link>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1c1d1f] mb-2">Skill Exchange Requests</h1>
          <p className="text-gray-600">Manage your incoming and outgoing skill exchange requests</p>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#17a2b8]" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <Select value={filters.status || "all"} onValueChange={(value) => handleFilterChange("status", value)}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.type || "all"} onValueChange={(value) => handleFilterChange("type", value)}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Requests</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                  </SelectContent>
                </Select>

                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search requests..."
                    value={filters.search || ""}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 bg-white"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}

        {/* Request Cards */}
        {loading ? (
          <div className="space-y-4">
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
        ) : requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => {
              const isReceived = isReceivedRequest(request)
              const otherUser = isReceived
                ? {
                    name: request.requester_name,
                    avatar: request.requester_avatar,
                    rating: request.requester_rating,
                  }
                : {
                    name: request.recipient_name,
                    avatar: request.recipient_avatar,
                    rating: request.recipient_rating,
                  }

              return (
                <Card key={request.id} className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                      {/* User Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="h-16 w-16 border-2 border-gray-200">
                          <AvatarImage src={otherUser.avatar || "/placeholder.svg"} alt={otherUser.name} />
                          <AvatarFallback className="bg-gray-100 text-gray-600 text-lg">
                            {otherUser.name?.charAt(0) || <User className="h-6 w-6" />}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-xl font-semibold text-[#1c1d1f] truncate">{otherUser.name}</h3>
                            <div className="flex items-center gap-1 ml-4">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium text-gray-700">{otherUser.rating.toFixed(1)}/5</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <Clock className="h-4 w-4" />
                            <span>{formatDate(request.created_at)}</span>
                            <span className="text-gray-400">•</span>
                            <span className="capitalize">{isReceived ? "Received request" : "Sent request"}</span>
                          </div>

                          {/* Skills */}
                          <div className="space-y-2 mb-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">Skills Offered:</span>
                              <Badge className="bg-[#28a745] text-white">{request.offered_skill}</Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">Skills Wanted:</span>
                              <Badge className="bg-[#007bff] text-white">{request.wanted_skill}</Badge>
                            </div>
                          </div>

                          {/* Message Preview */}
                          <div className="bg-gray-50 p-3 rounded-lg mb-3">
                            <div className="flex items-start gap-2">
                              <MessageCircle className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-gray-700 line-clamp-2">{request.message}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status and Actions */}
                      <div className="flex flex-col items-center gap-4 w-full lg:w-auto">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-700 mb-2">Status</p>
                          {getStatusBadge(request.status)}
                        </div>

                        {/* Action Buttons for Pending Received Requests */}
                        {isReceived && request.status === "pending" && (
                          <div className="flex gap-2 w-full lg:w-auto">
                            <Button
                              onClick={() => handleStatusUpdate(request.id, "accepted")}
                              disabled={actionLoading === request.id}
                              className="flex-1 lg:flex-none bg-[#28a745] hover:bg-[#218838] text-white"
                            >
                              {actionLoading === request.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  Accept
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => handleStatusUpdate(request.id, "rejected")}
                              disabled={actionLoading === request.id}
                              className="flex-1 lg:flex-none bg-[#dc3545] hover:bg-[#c82333] text-white"
                            >
                              {actionLoading === request.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <X className="h-4 w-4 mr-2" />
                                  Reject
                                </>
                              )}
                            </Button>
                          </div>
                        )}

                        {/* Status Icons for Non-Pending Requests */}
                        {request.status !== "pending" && (
                          <div className="flex items-center gap-2">
                            {request.status === "accepted" && <CheckCircle className="h-5 w-5 text-[#28a745]" />}
                            {request.status === "rejected" && <XCircle className="h-5 w-5 text-[#dc3545]" />}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="bg-white shadow-sm">
            <CardContent className="p-12 text-center">
              <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Requests Found</h3>
              <p className="text-gray-500 mb-4">
                {filters.search || filters.status !== "all" || filters.type !== "all"
                  ? "Try adjusting your filters to see more requests."
                  : "You haven't sent or received any skill exchange requests yet."}
              </p>
              <Link href="/">
                <Button className="bg-[#17a2b8] hover:bg-[#138496] text-white">Browse Skills</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
              className="bg-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => setCurrentPage(page)}
                disabled={loading}
                className={currentPage === page ? "bg-[#17a2b8] text-white" : "bg-white"}
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || loading}
              className="bg-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Summary Stats */}
        {total > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Showing {requests.length} of {total} request{total !== 1 ? "s" : ""}
            {filters.status !== "all" && ` with status "${filters.status}"`}
            {filters.type !== "all" && ` (${filters.type})`}
          </div>
        )}
      </main>
    </div>
  )
}
