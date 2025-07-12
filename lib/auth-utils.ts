import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

export interface AuthError {
  message: string
  code?: string
}

export interface AuthResponse {
  user?: User | null
  error?: AuthError | null
  needsEmailVerification?: boolean
}

// Enhanced authentication utilities
export const authUtils = {
  // Sign up with enhanced error handling
  async signUp(email: string, password: string, fullName: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        return { error: { message: error.message, code: error.message } }
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        return {
          user: data.user,
          needsEmailVerification: true,
        }
      }

      return { user: data.user }
    } catch (err) {
      return {
        error: {
          message: "An unexpected error occurred during signup",
        },
      }
    }
  },

  // Sign in with enhanced error handling
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Provide user-friendly error messages
        let message = error.message
        if (error.message.includes("Invalid login credentials")) {
          message = "Invalid email or password. Please check your credentials and try again."
        } else if (error.message.includes("Email not confirmed")) {
          message = "Please check your email and click the verification link before signing in."
        }

        return { error: { message, code: error.message } }
      }

      return { user: data.user }
    } catch (err) {
      return {
        error: {
          message: "An unexpected error occurred during sign in",
        },
      }
    }
  },

  // Check if user has completed profile
  async hasCompletedProfile(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.from("profiles").select("id").eq("id", userId).single()

      return !error && !!data
    } catch {
      return false
    }
  },

  // Get user profile
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        return { error: error.message }
      }

      return { profile: data }
    } catch (err) {
      return { error: "Failed to fetch user profile" }
    }
  },

  // Resend email verification
  async resendEmailVerification(email: string): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        return { error: { message: error.message } }
      }

      return {}
    } catch (err) {
      return {
        error: {
          message: "Failed to resend verification email",
        },
      }
    }
  },

  // Sign out
  async signOut(): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        return { error: { message: error.message } }
      }

      return {}
    } catch (err) {
      return {
        error: {
          message: "Failed to sign out",
        },
      }
    }
  },
}
