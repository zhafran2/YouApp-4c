"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { Edit, LogOut, User, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const { user, isLoading, logout, getProfile, apiError } = useAuth()
  const [profileError, setProfileError] = useState("")
  const [localLoading, setLocalLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    // Try to get the profile when the component mounts
    const fetchProfile = async () => {
      try {
        setLocalLoading(true)
        await getProfile()
        setProfileError("")
      } catch (error) {
        console.error("Error fetching profile:", error)
        setProfileError("Could not load profile. Please try again later.")
      } finally {
        setLocalLoading(false)
      }
    }

    fetchProfile()
  }, [])

  // If user is not logged in and not loading, redirect to login
  useEffect(() => {
    if (!isLoading && !localLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, localLoading, router])

  if (isLoading || localLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (profileError && !user) {
    return (
      <div className="min-h-screen p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Profile</h1>
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        <div className="text-center py-8">
          <div className="bg-red-500/20 border border-red-500 text-white p-4 rounded-lg mb-4">{profileError}</div>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No profile found</p>
          <Link href="/create-profile">
            <Button>Create Profile</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <Button variant="ghost" size="icon" onClick={logout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      {apiError && (
        <div className="bg-yellow-500/20 border border-yellow-500 text-white p-3 rounded-lg text-sm mb-4 flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>Using offline mode due to API connectivity issues. Some features may be limited.</span>
        </div>
      )}

      <div className="space-y-4">
        {!user.name && !user.birthday && !user.height && (
          <div className="text-center py-8">
            <div className="bg-[#162329] rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
              <User className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-gray-400 mb-4">No information yet</p>
            <Link href="/profile/edit">
              <Button>Add Profile Info</Button>
            </Link>
          </div>
        )}

        {(user.name || user.birthday) && (
          <Card className="card-bg p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">About</h2>
              <Link href="/profile/edit">
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {user.name && (
              <div className="flex justify-between items-center py-2 border-b border-[#2A3C44]">
                <span className="text-gray-400">Name</span>
                <span>{user.name}</span>
              </div>
            )}

            {user.birthday && (
              <div className="flex justify-between items-center py-2 border-b border-[#2A3C44]">
                <span className="text-gray-400">Birthday</span>
                <span>{formatDate(user.birthday)}</span>
              </div>
            )}

            {user.horoscope && (
              <div className="flex justify-between items-center py-2 border-b border-[#2A3C44]">
                <span className="text-gray-400">Horoscope</span>
                <span>{user.horoscope}</span>
              </div>
            )}

            {user.zodiac && (
              <div className="flex justify-between items-center py-2 border-b border-[#2A3C44]">
                <span className="text-gray-400">Zodiac</span>
                <span>{user.zodiac}</span>
              </div>
            )}

            {user.height && (
              <div className="flex justify-between items-center py-2 border-b border-[#2A3C44]">
                <span className="text-gray-400">Height</span>
                <span>{user.height} cm</span>
              </div>
            )}

            {user.weight && (
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400">Weight</span>
                <span>{user.weight} kg</span>
              </div>
            )}
          </Card>
        )}

        {user.interests && user.interests.length > 0 && (
          <Card className="card-bg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Interests</h2>
              <Link href="/profile/edit">
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest, index) => (
                <span key={index} className="bg-[#0E191F] border border-[#2A3C44] rounded-full px-4 py-1 text-sm">
                  {interest}
                </span>
              ))}
            </div>
          </Card>
        )}

        {user.about && (
          <Card className="card-bg p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">About Me</h2>
              <Link href="/profile/edit">
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <p className="text-gray-300">{user.about}</p>
          </Card>
        )}
      </div>
    </div>
  )
}

