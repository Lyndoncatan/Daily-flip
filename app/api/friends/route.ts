import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const friends = await db.friendship.findMany({
      where: {
        OR: [
          { userId: session.user.id, status: "ACCEPTED" },
          { friendId: session.user.id, status: "ACCEPTED" },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        friend: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    // Format the response to get a clean list of friends
    const formattedFriends = friends.map((friendship) => {
      return friendship.userId === session.user.id ? friendship.friend : friendship.user
    })

    return NextResponse.json(formattedFriends)
  } catch (error) {
    console.error("Error fetching friends:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { friendId } = await req.json()

    // Check if friendship already exists
    const existingFriendship = await db.friendship.findFirst({
      where: {
        OR: [
          { userId: session.user.id, friendId },
          { userId: friendId, friendId: session.user.id },
        ],
      },
    })

    if (existingFriendship) {
      return NextResponse.json({ message: "Friendship request already exists" }, { status: 409 })
    }

    // Create friendship request
    const friendship = await db.friendship.create({
      data: {
        userId: session.user.id,
        friendId,
        status: "PENDING",
      },
    })

    return NextResponse.json(friendship, { status: 201 })
  } catch (error) {
    console.error("Error creating friendship:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

