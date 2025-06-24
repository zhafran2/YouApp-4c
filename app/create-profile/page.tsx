"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, X, AlertTriangle } from "lucide-react"

export default function CreateProfilePage() {
  const [formData, setFormData] = useState({
    name: "",
    birthday: "",
    height: "",
    weight: "",
    interests: [] as string[],
  })
  const [newInterest, setNewInterest] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { createProfile, user, apiError } = useAuth()
  const router = useRouter()

  // Check if token exists
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()],
      }))
      setNewInterest("")
    }
  }

  const removeInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Format the date to YYYY-MM-DD
      const formattedDate = formData.birthday ? new Date(formData.birthday).toISOString().split("T")[0] : ""

      const profileData = {
        name: formData.name,
        birthday: formattedDate,
        height: formData.height ? Number.parseInt(formData.height) : 0,
        weight: formData.weight ? Number.parseInt(formData.weight) : 0,
        interests: formData.interests,
      }

      // Log the data being sent
      console.log("Submitting profile data:", profileData)

      await createProfile(profileData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create profile")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push("/login")} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Create Profile</h1>
      </div>

      {apiError && (
        <div className="bg-yellow-500/20 border border-yellow-500 text-white p-3 rounded-lg text-sm mb-4 flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>Using offline mode due to API connectivity issues. Your profile will be saved locally.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
        {error && <div className="bg-red-500/20 border border-red-500 text-white p-3 rounded-lg text-sm">{error}</div>}

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">
              Name
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="birthday" className="block text-sm font-medium text-gray-300">
              Birthday
            </label>
            <Input
              id="birthday"
              name="birthday"
              type="date"
              value={formData.birthday}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="height" className="block text-sm font-medium text-gray-300">
              Height (cm)
            </label>
            <Input
              id="height"
              name="height"
              type="number"
              value={formData.height}
              onChange={handleChange}
              placeholder="Enter your height"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="weight" className="block text-sm font-medium text-gray-300">
              Weight (kg)
            </label>
            <Input
              id="weight"
              name="weight"
              type="number"
              value={formData.weight}
              onChange={handleChange}
              placeholder="Enter your weight"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Interests</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.interests.map((interest, index) => (
                <div
                  key={index}
                  className="bg-[#0E191F] border border-[#2A3C44] rounded-full px-4 py-1 text-sm flex items-center"
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => removeInterest(interest)}
                    className="ml-2 text-gray-400 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Add an interest"
                className="flex-1"
              />
              <Button type="button" onClick={addInterest} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating Profile..." : "Create Profile"}
        </Button>
      </form>
    </div>
  )
}

