import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { ProfileHeader } from "@/components/profile-header"
import { PostFeed } from "@/components/post-feed"
import { getUserProfile, getUserPosts } from "@/lib/users"

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const profile = await getUserProfile(params.id)

  if (!profile) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto w-full px-4 py-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold">User not found</h1>
            <p className="text-muted-foreground mt-2">This user doesn't exist or has been removed.</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  const posts = await getUserPosts(params.id)
  const isCurrentUser = session.user.id === params.id

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto w-full px-4 py-6 space-y-6">
        <ProfileHeader profile={profile} isCurrentUser={isCurrentUser} />
        <PostFeed initialPosts={posts} />
      </div>
    </MainLayout>
  )
}

