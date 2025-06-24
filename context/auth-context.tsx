"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { calculateZodiac, calculateHoroscope } from "@/lib/utils"

type User = {
  id: string
  email: string
  username: string
  name?: string
  birthday?: string
  horoscope?: string
  zodiac?: string
  height?: number
  weight?: number
  interests?: string[]
  gender?: string
  images?: string[]
  about?: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  apiError: boolean
  login: (username: string, email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (profileData: Partial<User>) => Promise<void>
  getProfile: () => Promise<User | null>
  createProfile: (profileData: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock data for when the API is down
const createMockUser = (username: string, email: string): User => ({
  id: "mock-id",
  email: email || "user@example.com",
  username: username || "user",
  name: "Mock User",
  birthday: "2000-01-01",
  horoscope: "Capricorn",
  zodiac: "Capricorn",
  height: 175,
  weight: 70,
  interests: ["Reading", "Sports", "Music"],
  gender: "male",
  about: "This is a mock profile since the API is currently unavailable.",
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    const username = localStorage.getItem("username")
    const email = localStorage.getItem("email")

    if (token) {
      // Try to get the profile, but don't throw if it fails
      getProfile()
        .then((userData) => {
          if (userData) {
            setUser(userData)
          } else if (username && email) {
            // If profile fetch fails but we have username and email, create a mock user
            setUser(createMockUser(username, email))
            setApiError(true)
          }
        })
        .catch((error) => {
          console.error("Error loading profile on initial load:", error)
          // If we have username and email, create a mock user
          if (username && email) {
            setUser(createMockUser(username, email))
            setApiError(true)
          }
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (username: string, email: string, password: string) => {
    try {
      setIsLoading(true)
      setApiError(false)

      // Store username and email for fallback
      localStorage.setItem("username", username)
      localStorage.setItem("email", email)

      try {
        const response = await fetch("https://techtest.youapp.ai/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, email, password }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || "Login failed")
        }

        const data = await response.json()
        console.log("Login successful, token:", data.access_token)
        localStorage.setItem("token", data.access_token)

        // Try to get the profile
        const userData = await getProfile()

        if (userData) {
          // If profile exists, redirect to profile page
          router.push("/profile")
        } else {
          // If profile doesn't exist, redirect to create profile
          router.push("/create-profile")
        }
      } catch (error) {
        console.error("API error during login:", error)
        setApiError(true)

        // Create a mock token
        localStorage.setItem("token", "mock-token")
        // Create a mock user
        const mockUser = createMockUser(username, email)
        setUser(mockUser)
        router.push("/profile")
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, username: string, password: string) => {
    try {
      setIsLoading(true)
      setApiError(false)

      // Store username and email for fallback
      localStorage.setItem("username", username)
      localStorage.setItem("email", email)

      try {
        const response = await fetch("https://techtest.youapp.ai/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, username, password }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || "Registration failed")
        }

        const data = await response.json()
        console.log("Registration successful, token:", data.access_token)
        localStorage.setItem("token", data.access_token)

        // After registration, redirect to login page
        router.push("/login")
      } catch (error) {
        console.error("API error during registration:", error)
        setApiError(true)

        // Create a mock token
        localStorage.setItem("token", "mock-token")
        // Create a mock user
        const mockUser = createMockUser(username, email)
        setUser(mockUser)
        router.push("/profile")
      }
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("username")
    localStorage.removeItem("email")
    setUser(null)
    setApiError(false)
    router.push("/login")
  }

  const getProfile = async (): Promise<User | null> => {
    try {
      setIsLoading(true)

      const token = localStorage.getItem("token")
      const username = localStorage.getItem("username")
      const email = localStorage.getItem("email")

      if (!token) {
        router.push("/login")
        return null
      }

      console.log("Fetching profile with token:", token)

      try {
        const response = await fetch("https://techtest.youapp.ai/api/profile", {
          headers: {
            "x-access-token": token,
          },
        })

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token")
            router.push("/login")
            return null
          }
          throw new Error("Failed to fetch profile")
        }

        const data = await response.json()
        console.log("Profile data:", data)
        setUser(data.data)
        setApiError(false)
        return data.data
      } catch (error) {
        console.error("API error during getProfile:", error)
        setApiError(true)

        // If we have username and email, create a mock user
        if (username && email) {
          const mockUser = createMockUser(username, email)
          setUser(mockUser)
          return mockUser
        }

        return null
      }
    } catch (error) {
      console.error("Get profile error:", error)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const createProfile = async (profileData: Partial<User>) => {
    try {
      setIsLoading(true)

      const token = localStorage.getItem("token")
      const username = localStorage.getItem("username")
      const email = localStorage.getItem("email")

      if (!token) {
        router.push("/login")
        return
      }

      // Calculate zodiac and horoscope
      const zodiac = profileData.birthday ? calculateZodiac(profileData.birthday) : ""
      const horoscope = profileData.birthday ? calculateHoroscope(profileData.birthday) : ""

      console.log("Creating profile with token:", token)
      console.log(
        "Profile data:",
        JSON.stringify({
          name: profileData.name,
          birthday: profileData.birthday,
          height: profileData.height,
          weight: profileData.weight,
          interests: profileData.interests || [],
        }),
      )

      let apiSuccess = false

      try {
        const response = await fetch("https://techtest.youapp.ai/api/createProfile", {
          method: "POST",
          headers: {
            "x-access-token": token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: profileData.name,
            birthday: profileData.birthday,
            height: profileData.height,
            weight: profileData.weight,
            interests: profileData.interests || [],
          }),
        })

        const responseText = await response.text()
        console.log("Create profile response:", responseText)

        if (!response.ok) {
          throw new Error(`Failed to create profile: ${responseText}`)
        }

        apiSuccess = true
      } catch (error) {
        console.error("API error during createProfile:", error)
        setApiError(true)
      }

      // Create a user object from the profile data
      const newUser: User = {
        id: apiSuccess ? "api-id" : "temp-id",
        email: email || "",
        username: username || "",
        name: profileData.name,
        birthday: profileData.birthday,
        zodiac,
        horoscope,
        height: profileData.height,
        weight: profileData.weight,
        interests: profileData.interests || [],
      }

      // Set the user with the data we have
      setUser(newUser)

      // If API was successful, try to get the full profile
      if (apiSuccess) {
        try {
          // Add a small delay to allow the server to process the profile creation
          await new Promise((resolve) => setTimeout(resolve, 500))
          await getProfile()
        } catch (error) {
          console.error("Warning: Could not fetch profile after creation, using partial data:", error)
        }
      }

      // Redirect to profile page
      router.push("/profile")
    } catch (error) {
      console.error("Create profile error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      setIsLoading(true)

      const token = localStorage.getItem("token")

      if (!token) {
        router.push("/login")
        return
      }

      // Calculate zodiac and horoscope if birthday is provided
      const zodiac = profileData.birthday ? calculateZodiac(profileData.birthday) : undefined
      const horoscope = profileData.birthday ? calculateHoroscope(profileData.birthday) : undefined

      // Add zodiac and horoscope to the profile data
      const updatedProfileData = {
        ...profileData,
        zodiac,
        horoscope,
      }

      console.log("Updating profile with token:", token)
      console.log(
        "Profile data:",
        JSON.stringify({
          name: updatedProfileData.name,
          birthday: updatedProfileData.birthday,
          height: updatedProfileData.height,
          weight: updatedProfileData.weight,
          interests: updatedProfileData.interests || [],
          gender: updatedProfileData.gender,
          about: updatedProfileData.about,
        }),
      )

      let apiSuccess = false

      try {
        const response = await fetch("https://techtest.youapp.ai/api/profile", {
          method: "PUT",
          headers: {
            "x-access-token": token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: updatedProfileData.name,
            birthday: updatedProfileData.birthday,
            height: updatedProfileData.height,
            weight: updatedProfileData.weight,
            interests: updatedProfileData.interests || [],
            gender: updatedProfileData.gender,
            about: updatedProfileData.about,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Failed to update profile: ${errorText}`)
        }

        apiSuccess = true
      } catch (error) {
        console.error("API error during updateProfile:", error)
        setApiError(true)
      }

      // Update the user with the data we have
      if (user) {
        setUser({
          ...user,
          ...updatedProfileData,
        })
      }

      // If API was successful, try to get the full profile
      if (apiSuccess) {
        try {
          await getProfile()
        } catch (error) {
          console.error("Warning: Could not fetch profile after update, using partial data:", error)
        }
      }
    } catch (error) {
      console.error("Update profile error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    isLoading,
    apiError,
    login,
    register,
    logout,
    updateProfile,
    getProfile,
    createProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

