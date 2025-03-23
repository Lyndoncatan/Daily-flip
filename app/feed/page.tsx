import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { PostFeed } from "@/components/post-feed"
import { CreatePostCard } from "@/components/create-post-card"
import { getPosts } from "@/lib/posts"

export default async function FeedPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const posts = await getPosts()

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto w-full px-4 py-6 space-y-6">
        <CreatePostCard user={session.user} />
        <PostFeed initialPosts={posts} />
      </div>
    </MainLayout>
  )
}

