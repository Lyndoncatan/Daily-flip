"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Image, Film, Lock, Globe, X } from "lucide-react"

interface CreatePostCardProps {
  user: any
  onPostCreated?: (post: any) => void
}

export function CreatePostCard({ user, onPostCreated }: CreatePostCardProps) {
  const [content, setContent] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleMediaSelect = (type: "image" | "video") => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === "image" ? "image/jpeg, image/png, image/gif" : "video/mp4, video/webm"
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileType = file.type.startsWith("image/") ? "image" : "video"
    setMediaType(fileType)
    setMediaFile(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setMediaPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeMedia = () => {
    setMediaFile(null)
    setMediaPreview(null)
    setMediaType(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && !mediaFile) return

    setIsSubmitting(true)
    try {
      // In a real app, you would upload the media file to a storage service
      // and get a URL back. For this example, we'll simulate that.
      let mediaUrl = null
      if (mediaFile) {
        // Simulate media upload and getting a URL
        mediaUrl = mediaPreview
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          mediaUrl,
          mediaType,
          isPrivate,
        }),
      })

      if (!response.ok) throw new Error("Failed to create post")

      const newPost = await response.json()

      // Reset form
      setContent("")
      setMediaFile(null)
      setMediaPreview(null)
      setMediaType(null)
      setIsPrivate(false)

      if (onPostCreated) {
        onPostCreated(newPost)
      }

      // Refresh the page to show the new post
      window.location.reload()
    } catch (error) {
      console.error("Error creating post:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <div className="flex items-start gap-3">
          <Avatar>
            <AvatarImage src={user?.image || ""} alt={user?.name} />
            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold">{user?.name}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {isPrivate ? (
                <span className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  <span>Private</span>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  <span>Public</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="p-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="min-h-[100px] resize-none border-0 focus-visible:ring-0 p-0"
          />

          {mediaPreview && (
            <div className="mt-3 relative rounded-md overflow-hidden">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                onClick={removeMedia}
              >
                <X className="h-4 w-4" />
              </Button>

              {mediaType === "image" ? (
                <img
                  src={mediaPreview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full max-h-[300px] object-contain"
                />
              ) : (
                <video src={mediaPreview} controls className="w-full max-h-[300px]" />
              )}
            </div>
          )}

          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        </CardContent>

        <CardFooter className="p-4 pt-0 flex flex-wrap gap-2 justify-between">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => handleMediaSelect("image")}
            >
              <Image className="h-4 w-4" />
              <span>Photo</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => handleMediaSelect("video")}
            >
              <Film className="h-4 w-4" />
              <span>Video</span>
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch id="create-post-privacy" checked={isPrivate} onCheckedChange={setIsPrivate} />
              <Label htmlFor="create-post-privacy" className="text-sm">
                {isPrivate ? "Private" : "Public"}
              </Label>
            </div>

            <Button type="submit" disabled={(!content.trim() && !mediaFile) || isSubmitting}>
              {isSubmitting ? "Posting..." : "Post"}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}

