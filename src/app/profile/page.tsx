"use client"

import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Pencil } from "lucide-react"

type ProfilePayload = {
  id: string
  name: string | null
  email: string
  bio: string | null
  image: string | null
}

function splitFullName(name: string | null): [string, string] {
  if (!name) {
    return ["", ""]
  }

  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) {
    return ["", ""]
  }

  const first = parts.shift() ?? ""
  const last = parts.join(" ")

  return [first, last]
}

function combineName(first: string, last: string) {
  return [first, last].map((value) => value.trim()).filter(Boolean).join(" ")
}

export default function ProfilePage() {
  const router = useRouter()
  const { status } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const loadProfile = useCallback(async () => {
    setIsLoadingProfile(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const response = await fetch("/api/profile")
      const payload: { success?: boolean; data?: ProfilePayload; error?: string } = await response.json()

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error || "Unable to load profile")
      }

      const [fName, lName] = splitFullName(payload.data.name)
      setFirstName(fName)
      setLastName(lName)
      setEmail(payload.data.email)
      setBio(payload.data.bio ?? "")
      setAvatarUrl(payload.data.image)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load profile"
      setErrorMessage(message)
    } finally {
      setIsLoadingProfile(false)
    }
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login")
      return
    }

    if (status === "authenticated") {
      loadProfile()
    }
  }, [status, router, loadProfile])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: combineName(firstName, lastName) || undefined,
          bio,
        }),
      })

      const payload: { success?: boolean; data?: ProfilePayload; error?: string } = await response.json()

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error || "Unable to save profile")
      }

      const [updatedFirst, updatedLast] = splitFullName(payload.data.name)
      setFirstName(updatedFirst)
      setLastName(updatedLast)
      setBio(payload.data.bio ?? "")
      setAvatarUrl(payload.data.image)
      setSuccessMessage("Profile updated successfully")
      setIsEditing(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save profile"
      setErrorMessage(message)
    } finally {
      setIsSaving(false)
    }
  }

  if (status === "loading" || isLoadingProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading your profile…</p>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 container mx-auto px-[var(--spacing-md)] py-[var(--spacing-xl)]">
        <div className="max-w-[var(--container-md)] mx-auto space-y-[var(--gap-lg)]">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">My Profile</h1>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>

          {errorMessage && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          {!errorMessage && successMessage && (
            <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-[var(--gap-lg)]">
            {/* Avatar */}
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={avatarUrl || "/placeholder-user.jpg"} alt="Profile" />
                  <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                    <User className="h-16 w-16" />
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--gap-md)]">
              <div className="space-y-[var(--spacing-sm)]">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
              <div className="space-y-[var(--spacing-sm)]">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
            </div>

            <div className="space-y-[var(--spacing-sm)]">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} disabled className="bg-muted" />
            </div>

            <div className="space-y-[var(--spacing-sm)]">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={!isEditing}
                className={`min-h-[120px] resize-none ${!isEditing ? "bg-muted" : ""}`}
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-[var(--gap-sm)]">
                <Button type="submit" className="flex-1" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setIsEditing(false)
                    setSuccessMessage(null)
                    setErrorMessage(null)
                    loadProfile()
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  )
}
