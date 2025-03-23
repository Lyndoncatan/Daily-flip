import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { action } = await req.json()

    // Find the friendship request
    const friendship = await db.friendship.findFirst({
      where: {
        id: params.id,
        friendId: session.user.id,
        status: "PENDING",
      },
    })

    if (!friendship) {
      return NextResponse.json({ message: "Friendship request not found" }, { status: 404 })
    }

    if (action === "accept") {
      const updatedFriendship = await db.friendship.update({
        where: { id: params.id },
        data: { status: "ACCEPTED" },
      })

      return NextResponse.json(updatedFriendship)
    } else if (action === "reject") {
      await db.friendship.delete({
        where: { id: params.id },
      })

      return NextResponse.json({ message: "Friendship request rejected" })
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error updating friendship:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Find the friendship
    const friendship = await db.friendship.findFirst({
      where: {
        id: params.id,
        OR: [{ userId: session.user.id }, { friendId: session.user.id }],
      },
    })

    if (!friendship) {
      return NextResponse.json({ message: "Friendship not found" }, { status: 404 })
    }

    await db.friendship.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Friendship removed" })
  } catch (error) {
    console.error("Error deleting friendship:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

