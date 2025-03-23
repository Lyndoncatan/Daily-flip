import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { SettingsForm } from "@/components/settings-form"
import { getUserProfile } from "@/lib/users"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const profile = await getUserProfile(session.user.id)

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto w-full px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <SettingsForm profile={profile} />
      </div>
    </MainLayout>
  )
}

