"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, X } from "lucide-react"
import { calculateZodiac, calculateHoroscope } from "@/lib/utils"
import Link from "next/link"

export default function EditProfilePage() {
  const { user, isLoading, updateProfile } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    birthday: "",
    horoscope: "",
    zodiac: "",
    height: "",
    weight: "",
    interests: [] as string[],
    about: "",
  })
  const [newInterest, setNewInterest] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }

    if (user) {
      setFormData({
        name: user.name || "",
        gender: user.gender || "",
        birthday: user.birthday ? new Date(user.birthday).toISOString().split("T")[0] : "",
        horoscope: user.horoscope || "",
        zodiac: user.zodiac || "",
        height: user.height ? user.height.toString() : "",
        weight: user.weight ? user.weight.toString() : "",
        interests: user.interests || [],
        about: user.about || "",
      })
    }
  }, [user, isLoading, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === "birthday") {
      const zodiac = calculateZodiac(value)
      const horoscope = calculateHoroscope(value)
      setFormData({
        ...formData,
        [name]: value,
        zodiac,
        horoscope,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData({
        ...formData,
        interests: [...formData.interests, newInterest.trim()],
      })
      setNewInterest("")
    }
  }

  const removeInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter((i) => i !== interest),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSaving(true)

    try {
      const profileData = {
        name: formData.name,
        gender: formData.gender,
        birthday: formData.birthday,
        height: formData.height ? Number.parseInt(formData.height) : undefined,
        weight: formData.weight ? Number.parseInt(formData.weight) : undefined,
        interests: formData.interests,
        about: formData.about,
      }

      await updateProfile(profileData)
      router.push("/profile")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="flex items-center mb-6">
        <Link href="/profile">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Edit Profile</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-500/20 border border-red-500 text-white p-3 rounded-lg text-sm">{error}</div>}

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">About</h2>

          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">
              Display Name
            </label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Add your name" />
          </div>

          <div className="space-y-2">
            <label htmlFor="gender" className="block text-sm font-medium text-gray-300">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="flex h-12 w-full rounded-xl border border-[#2A3C44] bg-[#162329] px-4 py-2 text-sm text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-[#8BD9BC] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
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
              placeholder="Add your birthday"
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
              placeholder="Add your height"
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
              placeholder="Add your weight"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Interests</h2>

          <div className="flex flex-wrap gap-2 mb-4">
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

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">About Me</h2>

          <Textarea
            name="about"
            value={formData.about}
            onChange={handleChange}
            placeholder="Write something about yourself"
            className="min-h-[100px] bg-[#162329] border border-[#2A3C44] rounded-xl p-4 text-white w-full focus:outline-none focus:border-[#8BD9BC]"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </form>
    </div>
  )
}

