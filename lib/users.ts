import { db } from "@/lib/db"

export async function getUserProfile(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    })

    if (!user) return null

    // Don't send password
    const { password, ...userWithoutPassword } = user

    return userWithoutPassword
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return null
  }
}

export async function getUserPosts(userId: string) {
  try {
    const posts = await db.post.findMany({
      where: {
        userId,
        isPrivate: false,
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
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 3,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return posts
  } catch (error) {
    console.error("Error fetching user posts:", error)
    return []
  }
}

export async function isAdmin(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    return user?.role === "ADMIN"
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

