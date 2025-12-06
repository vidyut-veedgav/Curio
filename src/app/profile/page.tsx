"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Header } from "@/components/Header"
import { User, Pencil, LogOut, Camera } from "lucide-react"
import { useGetUser } from "@/hooks/useGetUser"
import { useUpdateUser } from "./hooks"

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
  const { data: session, status } = useSession()
  const userId = session?.user?.id || ""

  const getUserQuery = useGetUser(userId)
  const updateUserMutation = useUpdateUser(userId)

  const [isEditing, setIsEditing] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [bio, setBio] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (getUserQuery.data) {
      const [fName, lName] = splitFullName(getUserQuery.data.name)
      setFirstName(fName)
      setLastName(lName)
      setBio(getUserQuery.data.bio ?? "")
      setAvatarUrl(getUserQuery.data.image)
    }
  }, [getUserQuery.data])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return
    }

    setIsUploadingAvatar(true)

    try {
      // For now, just create a local preview URL
      // In production, you'd upload to a service like Cloudinary or S3
      const previewUrl = URL.createObjectURL(file)
      setAvatarUrl(previewUrl)
      setSuccessMessage("Avatar updated (preview only)")
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage(null)

    const name = combineName(firstName, lastName) || undefined

    updateUserMutation.mutate(
      { name, bio },
      {
        onSuccess: () => {
          setSuccessMessage("Profile updated successfully")
          setIsEditing(false)
        },
      }
    )
  }

  const handleCancel = () => {
    if (getUserQuery.data) {
      const [fName, lName] = splitFullName(getUserQuery.data.name)
      setFirstName(fName)
      setLastName(lName)
      setBio(getUserQuery.data.bio ?? "")
      setAvatarUrl(getUserQuery.data.image)
    }
    setIsEditing(false)
    setSuccessMessage(null)
    updateUserMutation.reset()
  }

  const isLoading = status === "loading" || getUserQuery.isLoading

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading your profile…</p>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  const errorMessage = getUserQuery.error?.message || updateUserMutation.error?.message

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Edit Button - Outside Card */}
        <div className="mb-4 flex items-center justify-end">
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm font-medium text-destructive">{errorMessage}</p>
          </div>
        )}

        {!errorMessage && successMessage && (
          <div className="mb-6 rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-4">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{successMessage}</p>
          </div>
        )}

        {/* Profile Card */}
        <div className="rounded-xl border bg-card shadow-sm">
          <form onSubmit={handleSave}>
            <div className="px-6 py-8">
              <div className="flex items-start gap-8">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <Avatar className="h-16 w-16 border-2 border-border">
                    <AvatarImage src={avatarUrl || "/placeholder-user.jpg"} alt="Profile" />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <label
                      htmlFor="avatar-upload"
                      className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <Camera className="h-4 w-4" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        disabled={isUploadingAvatar}
                        className="sr-only"
                      />
                    </label>
                  )}
                </div>

                {/* Form Fields */}
                <div className="flex-1 space-y-6">
                  {/* Name Fields */}
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium">
                        First name
                      </Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={!isEditing}
                        className={!isEditing ? "border-muted bg-muted/50" : ""}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium">
                        Last name
                      </Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={!isEditing}
                        className={!isEditing ? "border-muted bg-muted/50" : ""}
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={getUserQuery.data?.email || ""}
                      disabled
                      className="border-muted bg-muted/50"
                    />
                    <p className="text-xs text-muted-foreground">Email address cannot be changed</p>
                  </div>

                  {/* Bio Field */}
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sm font-medium">
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      disabled={!isEditing}
                      className={`min-h-[120px] resize-none ${!isEditing ? "border-muted bg-muted/50" : ""}`}
                      placeholder="Tell us a bit about yourself..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Brief description for your profile. Max 500 characters.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-3 border-t bg-muted/50 px-6 py-4">
                <Button type="submit" disabled={updateUserMutation.isPending} className="flex-1 sm:flex-initial">
                  {updateUserMutation.isPending ? "Saving..." : "Save changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateUserMutation.isPending}
                  className="flex-1 sm:flex-initial"
                >
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </div>

        {/* Sign Out Button */}
        <div className="mt-6">
          <Button
            variant="outline"
            onClick={() => signOut({ callbackUrl: "/", redirect: true })}
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  )
}
