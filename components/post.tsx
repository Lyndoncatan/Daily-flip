"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Heart, MessageCircle, MoreHorizontal, Send, Trash, Edit, Lock, Globe } from "lucide-react"

interface PostProps {
  post: any
  currentUser: any
  onDelete: (postId: string) => void
  onUpdate: (post: any) => void
  onCommentAdd: (postId: string, comment: any) => void
}

export function Post({ post, currentUser, onDelete, onUpdate, onCommentAdd }: PostProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editContent, setEditContent] = useState(post.content)
  const [editIsPrivate, setEditIsPrivate] = useState(post.isPrivate)
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false)

  const isOwner = currentUser?.id === post.user.id
  const formattedDate = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    setIsSubmittingComment(true)
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post.id,
          content: commentText,
        }),
      })

      if (!response.ok) throw new Error("Failed to add comment")

      const newComment = await response.json()
      onCommentAdd(post.id, newComment)
      setCommentText("")
      setShowCommentForm(false)
    } catch (error) {
      console.error("Error adding comment:", error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleEditSubmit = async () => {
    if (!editContent.trim()) return

    setIsSubmittingEdit(true)
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: editContent,
          isPrivate: editIsPrivate,
        }),
      })

      if (!response.ok) throw new Error("Failed to update post")

      const updatedPost = await response.json()
      onUpdate({
        ...post,
        content: updatedPost.content,
        isPrivate: updatedPost.isPrivate,
      })
      setShowEditDialog(false)
    } catch (error) {
      console.error("Error updating post:", error)
    } finally {
      setIsSubmittingEdit(false)
    }
  }

  const handleDeleteSubmit = async () => {
    setIsSubmittingDelete(true)
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete post")

      onDelete(post.id)
      setShowDeleteDialog(false)
    } catch (error) {
      console.error("Error deleting post:", error)
    } finally {
      setIsSubmittingDelete(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="p-4 pb-0">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">
              <Link href={`/profile/${post.user.id}`}>
                <Avatar>
                  <AvatarImage src={post.user.image || ""} alt={post.user.name} />
                  <AvatarFallback>{post.user.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <Link href={`/profile/${post.user.id}`} className="font-semibold hover:underline">
                  {post.user.name}
                </Link>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>{formattedDate}</span>
                  {post.isPrivate && (
                    <span className="flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      <span>Private</span>
                    </span>
                  )}
                  {!post.isPrivate && (
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <span>Public</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit post
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <p className="whitespace-pre-line">{post.content}</p>

          {post.mediaUrl && (
            <div className="mt-3 rounded-md overflow-hidden">
              {post.mediaType === "image" ? (
                <Image
                  src={post.mediaUrl || "/placeholder.svg"}
                  alt="Post image"
                  width={600}
                  height={400}
                  className="w-full object-cover max-h-[500px]"
                />
              ) : post.mediaType === "video" ? (
                <video src={post.mediaUrl} controls className="w-full max-h-[500px]" />
              ) : null}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 flex flex-col">
          <div className="flex items-center gap-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-1 ${isLiked ? "text-purple-600" : ""}`}
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              <span>Like</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setShowCommentForm(!showCommentForm)}
            >
              <MessageCircle className="h-4 w-4" />
              <span>Comment</span>
            </Button>
          </div>

          {showCommentForm && (
            <form onSubmit={handleCommentSubmit} className="w-full mt-2">
              <div className="flex gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser?.image || ""} alt={currentUser?.name} />
                  <AvatarFallback>{currentUser?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={!commentText.trim() || isSubmittingComment}>
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </div>
              </div>
            </form>
          )}

          {post.comments && post.comments.length > 0 && (
            <div className="mt-4 space-y-3">
              {post.comments.map((comment: any) => (
                <div key={comment.id} className="flex gap-2">
                  <Link href={`/profile/${comment.user.id}`}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user.image || ""} alt={comment.user.name} />
                      <AvatarFallback>{comment.user.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 bg-muted p-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Link href={`/profile/${comment.user.id}`} className="font-semibold text-sm hover:underline">
                        {comment.user.name}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}

              {post.comments.length > 3 && (
                <Button variant="link" size="sm" className="text-muted-foreground">
                  View all comments
                </Button>
              )}
            </div>
          )}
        </CardFooter>
      </Card>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit post</DialogTitle>
            <DialogDescription>Make changes to your post. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="What's on your mind?"
              className="min-h-[100px]"
            />
            <div className="flex items-center space-x-2">
              <Switch id="post-privacy" checked={editIsPrivate} onCheckedChange={setEditIsPrivate} />
              <Label htmlFor="post-privacy" className="flex items-center gap-1">
                {editIsPrivate ? (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Private post</span>
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4" />
                    <span>Public post</span>
                  </>
                )}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={isSubmittingEdit}>
              {isSubmittingEdit ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSubmit} disabled={isSubmittingDelete}>
              {isSubmittingDelete ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

