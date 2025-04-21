"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authApi } from "@/lib/api-service"
import { useToast } from "@/components/ui/use-toast"

interface User {
  _id: string
  email: string
  username: string
  phone: string
  isVerified: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, username: string, phone: string) => Promise<boolean>
  logout: () => void
  verifyOtp: (otp: string) => Promise<boolean>
  resendOtp: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Check if user is logged in on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)
      fetchUserData(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchUserData = async (currentToken: string) => {
    try {
      setIsLoading(true)
      const userData = await authApi.getMe()
      setUser(userData)
    } catch (error) {
      console.error("Failed to fetch user data:", error)
      localStorage.removeItem("token")
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const data = await authApi.login(email, password)

      if (data.token) {
        localStorage.setItem("token", data.token)
        setToken(data.token)
        await fetchUserData(data.token)

        toast({
          title: "Login successful",
          description: "Welcome back!",
        })

        return true
      }
      return false
    } catch (error: any) {
      console.error("Login error:", error)
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.response?.data?.message || "Invalid credentials",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, username: string, phone: string) => {
    try {
      setIsLoading(true)
      const data = await authApi.register(email, password, username, phone)

      if (data.token) {
        localStorage.setItem("token", data.token)
        setToken(data.token)
        await fetchUserData(data.token)

        toast({
          title: "Registration successful",
          description: "Your account has been created!",
        })

        return true
      }
      return false
    } catch (error: any) {
      console.error("Registration error:", error)
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.response?.data?.message || "Could not create account",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)

    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    })
  }

  const verifyOtp = async (otp: string) => {
    try {
      setIsLoading(true)
      await authApi.verifyOtp(otp)

      // Refresh user data after verification
      if (token) {
        await fetchUserData(token)
      }

      toast({
        title: "Account verified",
        description: "Your account has been verified successfully",
      })

      return true
    } catch (error: any) {
      console.error("OTP verification error:", error)
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: error.response?.data?.message || "Invalid OTP",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const resendOtp = async () => {
    try {
      setIsLoading(true)
      await authApi.resendOtp()

      toast({
        title: "OTP resent",
        description: "A new verification code has been sent",
      })

      return true
    } catch (error: any) {
      console.error("Resend OTP error:", error)
      toast({
        variant: "destructive",
        title: "Failed to resend OTP",
        description: error.response?.data?.message || "Could not send verification code",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        verifyOtp,
        resendOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
