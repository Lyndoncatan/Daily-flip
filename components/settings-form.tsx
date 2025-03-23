"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SettingsFormProps {
  profile: any
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [name, setName] = useState(profile.name || "")
  const [bio, setBio] = useState(profile.profile?.bio || "")
  const [profileImage, setProfileImage] = useState(profile.image || "")
  const [backgroundImage, setBackgroundImage] = useState(profile.profile?.backgroundImage || "")
  const [isDarkMode, setIsDarkMode] = useState(theme === "dark")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const handleThemeChange = (checked: boolean) => {
    setIsDarkMode(checked)
    setTheme(checked ? "dark" : "light")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    setSuccessMessage("")
    setErrorMessage("")

    try {
      const response = await fetch(`/api/users/${profile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bio,
          image: profileImage,
          backgroundImage,
        }),
      })

      if (!response.ok) throw new Error("Failed to update profile")

      setSuccessMessage("Profile updated successfully")
      router.refresh()
    } catch (error) {
      console.error("Error updating profile:", error)
      setErrorMessage("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how DailyFlip looks on your device.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Switch between light and dark mode.</p>
              </div>
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4" />
                <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={handleThemeChange} />
                <Moon className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backgroundImage">Custom Background Image</Label>
              <p className="text-sm text-muted-foreground">Add a custom background image to your DailyFlip app.</p>
              <Input
                id="backgroundImage"
                value={backgroundImage}
                onChange={(e) => setBackgroundImage(e.target.value)}
                placeholder="https://example.com/background.jpg"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your profile information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profileImage">Profile Image URL</Label>
              <Input
                id="profileImage"
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </CardContent>
          <CardFooter>
            {successMessage && (
              <Alert className="mb-4 w-full">
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            {errorMessage && (
              <Alert variant="destructive" className="mb-4 w-full">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="ml-auto" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  )
}

