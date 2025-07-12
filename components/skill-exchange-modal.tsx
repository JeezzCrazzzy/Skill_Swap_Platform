"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { authUtils } from "@/lib/auth-utils"
import type { Profile } from "@/lib/supabase"

interface SkillExchangeModalProps {
  isOpen: boolean
  onClose: () => void
  targetUser: {
    id: string
    name: string
    skills_wanted: string[]
  }
  onSuccess?: () => void
}

export function SkillExchangeModal({ isOpen, onClose, targetUser, onSuccess }: SkillExchangeModalProps) {
  const { user } = useAuth()
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    offeredSkill: "",
    wantedSkill: "",
    message: "",
  })

  // Load current user's profile to get their offered skills
  useEffect(() => {
    const loadCurrentUserProfile = async () => {
      if (!user) return

      const { profile } = await authUtils.getUserProfile(user.id)
      if (profile) {
        setCurrentUserProfile(profile)
      }
    }

    if (isOpen && user) {
      loadCurrentUserProfile()
    }
  }, [isOpen, user])

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ offeredSkill: "", wantedSkill: "", message: "" })
      setError("")
      setSuccess(false)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Check if user has skills to offer
    const hasOfferedSkills = currentUserProfile?.skills_offered && currentUserProfile.skills_offered.length > 0
    const hasWantedSkills = targetUser.skills_wanted && targetUser.skills_wanted.length > 0

    if (!hasOfferedSkills) {
      setError("You need to add skills to your profile before making a request")
      return
    }

    if (!hasWantedSkills) {
      setError("This user hasn't specified any skills they want to learn")
      return
    }

    // Validation
    if (!formData.offeredSkill) {
      setError("Please select one of your skills to offer")
      return
    }
    if (!formData.wantedSkill) {
      setError("Please select one of their wanted skills")
      return
    }
    if (!formData.message.trim()) {
      setError("Please write a message to introduce yourself")
      return
    }

    setLoading(true)

    try {
      // TODO: Implement actual skill exchange request submission
      // For now, we'll simulate the request
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setSuccess(true)

      // Close modal and redirect to request management page
      setTimeout(() => {
        onClose()
        // Navigate to request management page instead of calling onSuccess
        window.location.href = "/swap-requests"
      }, 2000)
    } catch (err) {
      setError("Failed to send skill exchange request. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md bg-white">
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#1c1d1f] mb-2">Request Sent Successfully!</h3>
            <p className="text-gray-600 mb-4">
              Your skill exchange request has been sent to {targetUser.name}. They'll be notified and can respond to
              your request.
            </p>
            <div className="flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-gray-500">Redirecting...</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Check if skills are available
  const userOfferedSkills = currentUserProfile?.skills_offered || []
  const targetWantedSkills = targetUser.skills_wanted || []
  const hasUserSkills = userOfferedSkills.length > 0
  const hasTargetSkills = targetWantedSkills.length > 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white border-0 shadow-2xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold text-[#1c1d1f] text-center">
            Send Skill Exchange Request
          </DialogTitle>
          <p className="text-gray-600 text-center mt-2">
            Request a skill exchange with <strong>{targetUser.name}</strong>
          </p>
        </DialogHeader>

        {error && (
          <Alert className="border-red-200 bg-red-50 mb-4">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}

        {/* Show message if no skills available */}
        {(!hasUserSkills || !hasTargetSkills) && (
          <Alert className="border-yellow-200 bg-yellow-50 mb-4">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700">
              {!hasUserSkills && !hasTargetSkills
                ? "Neither you nor this user have the required skills set up for an exchange."
                : !hasUserSkills
                  ? "You need to add skills to your profile before making a request."
                  : "This user hasn't specified any skills they want to learn."}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Choose Your Offered Skill */}
          <div className="space-y-2">
            <Label htmlFor="offeredSkill" className="text-sm font-medium text-gray-700">
              Choose one of your offered skills
            </Label>
            {hasUserSkills ? (
              <Select
                value={formData.offeredSkill}
                onValueChange={(value) => handleInputChange("offeredSkill", value)}
                disabled={loading}
              >
                <SelectTrigger className="w-full bg-white border-2 border-gray-200 focus:border-[#17a2b8] rounded-lg">
                  <SelectValue placeholder="Select a skill you can teach..." />
                </SelectTrigger>
                <SelectContent>
                  {userOfferedSkills.map((skill, index) => (
                    <SelectItem key={index} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="w-full p-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-500">
                No skills offered yet. Please update your profile first.
              </div>
            )}
          </div>

          {/* Choose Their Wanted Skill */}
          <div className="space-y-2">
            <Label htmlFor="wantedSkill" className="text-sm font-medium text-gray-700">
              Choose one of their wanted skills
            </Label>
            {hasTargetSkills ? (
              <Select
                value={formData.wantedSkill}
                onValueChange={(value) => handleInputChange("wantedSkill", value)}
                disabled={loading}
              >
                <SelectTrigger className="w-full bg-white border-2 border-gray-200 focus:border-[#17a2b8] rounded-lg">
                  <SelectValue placeholder="Select a skill they want to learn..." />
                </SelectTrigger>
                <SelectContent>
                  {targetWantedSkills.map((skill, index) => (
                    <SelectItem key={index} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="w-full p-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-500">
                This user hasn't specified any skills they want to learn.
              </div>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium text-gray-700">
              Message
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              placeholder={`Hi ${targetUser.name}! I'd love to exchange skills with you. I can help you with ${
                formData.wantedSkill || "[selected skill]"
              } and would appreciate learning ${
                formData.offeredSkill || "[your skill]"
              } from you. Let me know if you're interested!`}
              className="w-full min-h-[120px] bg-white border-2 border-gray-200 focus:border-[#17a2b8] rounded-lg resize-none"
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              Introduce yourself and explain why you'd like to exchange skills with {targetUser.name}.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={loading || !hasUserSkills || !hasTargetSkills}
              className="w-full bg-[#007bff] hover:bg-[#0056b3] text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-[#007bff] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Request...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Cancel Button */}
        <div className="pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
