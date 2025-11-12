import { NextRequest, NextResponse } from "next/server"
import type { User } from "@prisma/client"

import { auth } from "@/lib/auth"
import { getUserData, setUserData } from "@/lib/services/userService"

function formatUserResponse(user: Pick<User, "id" | "name" | "email" | "bio" | "image">) {
  const { id, name, email, bio, image } = user

  return {
    id,
    name,
    email,
    bio,
    image,
  }
}

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const user = await getUserData(session.user.id)

    return NextResponse.json(
      {
        success: true,
        data: formatUserResponse(user),
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error fetching profile", error)

    const message = error instanceof Error ? error.message : "Failed to fetch profile"

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()

    const updates: { name?: string; bio?: string } = {}

    if ("name" in body) {
      if (body.name !== null && typeof body.name !== "string") {
        return NextResponse.json({ error: "Invalid name" }, { status: 400 })
      }

      const trimmedName = typeof body.name === "string" ? body.name.trim() : ""
      if (trimmedName) {
        updates.name = trimmedName
      }
    }

    if ("bio" in body) {
      if (body.bio !== null && typeof body.bio !== "string") {
        return NextResponse.json({ error: "Invalid bio" }, { status: 400 })
      }

      updates.bio = typeof body.bio === "string" ? body.bio : ""
    }

    if (!Object.keys(updates).length) {
      return NextResponse.json({ error: "No valid fields provided" }, { status: 400 })
    }

    const user = await setUserData(session.user.id, updates)

    return NextResponse.json(
      {
        success: true,
        data: formatUserResponse(user),
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error updating profile", error)

    const message = error instanceof Error ? error.message : "Failed to update profile"

    return NextResponse.json({ error: message }, { status: 500 })
  }
}