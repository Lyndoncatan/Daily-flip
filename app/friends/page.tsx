import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { FriendsList } from "@/components/friends-list"

export default async function FriendsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto w-full px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Friends</h1>
        <FriendsList userId={session.user.id} />
      </div>
    </MainLayout>
  )
}

