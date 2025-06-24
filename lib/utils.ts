import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateZodiac(birthday: string): string {
  if (!birthday) return ""

  const date = new Date(birthday)
  const month = date.getMonth() + 1
  const day = date.getDate()

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries"
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus"
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini"
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer"
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo"
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo"
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra"
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio"
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius"
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn"
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius"
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "Pisces"

  return ""
}

export function calculateHoroscope(birthday: string): string {
  // This is a simplified version - in a real app, you'd have more detailed horoscope calculations
  const zodiac = calculateZodiac(birthday)

  const horoscopes: Record<string, string> = {
    Aries: "Passionate, motivated, and confident leader",
    Taurus: "Practical and well-grounded, the steady persistence",
    Gemini: "Expressive and quick-witted, representing two different personalities",
    Cancer: "Tenacious, highly imaginative, loyal, emotional, sympathetic",
    Leo: "Creative and passionate, generous and warm-hearted",
    Virgo: "Analytical, kind, hardworking, and practical",
    Libra: "Cooperative, diplomatic, gracious, fair-minded",
    Scorpio: "Passionate, stubborn, resourceful, brave",
    Sagittarius: "Generous, idealistic, great sense of humor",
    Capricorn: "Responsible, disciplined, self-control, good managers",
    Aquarius: "Progressive, original, independent, humanitarian",
    Pisces: "Compassionate, artistic, intuitive, gentle",
  }

  return horoscopes[zodiac] || ""
}

export function formatDate(dateString: string): string {
  if (!dateString) return ""

  const date = new Date(dateString)
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear()

  return `${day}-${month}-${year}`
}

export function calculateAge(birthday: string): number {
  if (!birthday) return 0

  const birthDate = new Date(birthday)
  const today = new Date()

  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDifference = today.getMonth() - birthDate.getMonth()

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

