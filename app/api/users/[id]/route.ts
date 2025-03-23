import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { isAdmin } from "@/lib/users"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: params.id },
      include: {
        profile: true,
      },
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Don't send password
    const { password, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Only allow users to update their own profile or admins
    const admin = await isAdmin(session.user.id)

    if (params.id !== session.user.id && !admin) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { name, bio, image, backgroundImage } = await req.json()

    const updatedUser = await db.user.update({
      where: { id: params.id },
      data: {
        name,
        image,
        profile: {
          update: {
            bio,
            backgroundImage,
          },
        },
      },
      include: {
        profile: true,
      },
    })

    // Don't send password
    const { password, ...userWithoutPassword } = updatedUser

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

