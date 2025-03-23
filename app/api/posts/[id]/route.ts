import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { isAdmin } from "@/lib/users"

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const post = await db.post.findUnique({
      where: { id: params.id },
    })

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 })
    }

    // Check if user is the post owner or an admin
    const admin = await isAdmin(session.user.id)

    if (post.userId !== session.user.id && !admin) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    await db.comment.deleteMany({
      where: { postId: params.id },
    })

    await db.post.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Post deleted" })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const post = await db.post.findUnique({
      where: { id: params.id },
    })

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 })
    }

    if (post.userId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { content, isPrivate } = await req.json()

    const updatedPost = await db.post.update({
      where: { id: params.id },
      data: {
        content,
        isPrivate,
      },
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error("Error updating post:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

