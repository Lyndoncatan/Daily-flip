"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit, UserPlus, UserCheck } from "lucide-react"

interface ProfileHeaderProps {
  profile: any
  isCurrentUser: boolean
}

export function ProfileHeader({ profile, isCurrentUser }: ProfileHeaderProps) {
  const router = useRouter()
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [name, setName] = useState(profile.name || "")
  const [bio, setBio] = useState(profile.profile?.bio || "")
  const [profileImage, setProfileImage] = useState(profile.image || "")
  const [backgroundImage, setBackgroundImage] = useState(profile.profile?.backgroundImage || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFriend, setIsFriend] = useState(false)
  const [isSendingRequest, setIsSendingRequest] = useState(false)

  const handleEditSubmit = async () => {
    if (!name.trim()) return

    setIsSubmitting(true)
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

      setShowEditDialog(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddFriend = async () => {
    if (isFriend) return

    setIsSendingRequest(true)
    try {
      const response = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          friendId: profile.id,
        }),
      })

      if (!response.ok) throw new Error("Failed to send friend request")

      setIsFriend(true)
    } catch (error) {
      console.error("Error sending friend request:", error)
    } finally {
      setIsSendingRequest(false)
    }
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div
          className="h-48 bg-gradient-to-r from-purple-400 to-purple-600 relative"
          style={
            backgroundImage
              ? {
                  backgroundImage: `url(${backgroundImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {}
          }
        >
          {isCurrentUser && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-4 right-4 h-8 w-8 rounded-full"
              onClick={() => setShowEditDialog(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>

        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row gap-4 -mt-12 sm:-mt-16">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background">
              <AvatarImage src={profile.image || ""} alt={profile.name} />
              <AvatarFallback className="text-4xl">{profile.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>

            <div className="flex-1 pt-12 sm:pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">{profile.name}</h1>
                  <p className="text-muted-foreground">{profile.email}</p>
                </div>

                {!isCurrentUser && (
                  <Button
                    onClick={handleAddFriend}
                    disabled={isFriend || isSendingRequest}
                    className="w-full sm:w-auto"
                  >
                    {isFriend ? (
                      <>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Friends
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        {isSendingRequest ? "Sending Request..." : "Add Friend"}
                      </>
                    )}
                  </Button>
                )}
              </div>

              {profile.profile?.bio && (
                <div className="mt-4">
                  <h2 className="text-sm font-semibold text-muted-foreground mb-1">Bio</h2>
                  <p className="text-sm whitespace-pre-line">{profile.profile.bio}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-[100px]" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profileImage">Profile Image URL</Label>
              <Input
                id="profileImage"
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="backgroundImage">Background Image URL</Label>
              <Input
                id="backgroundImage"
                value={backgroundImage}
                onChange={(e) => setBackgroundImage(e.target.value)}
                placeholder="https://example.com/background.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

