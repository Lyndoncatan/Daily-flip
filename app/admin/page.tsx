import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { AdminDashboard } from "@/components/admin-dashboard"
import { isAdmin } from "@/lib/users"

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const admin = await isAdmin(session.user.id)

  if (!admin) {
    redirect("/feed")
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto w-full px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <AdminDashboard />
      </div>
    </MainLayout>
  )
}

