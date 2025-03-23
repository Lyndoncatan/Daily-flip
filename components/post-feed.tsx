"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Post } from "@/components/post"
import { Skeleton } from "@/components/ui/skeleton"

interface PostFeedProps {
  initialPosts: any[]
  userId?: string
}

export function PostFeed({ initialPosts, userId }: PostFeedProps) {
  const { data: session } = useSession()
  const [posts, setPosts] = useState(initialPosts || [])
  const [loading, setLoading] = useState(!initialPosts)

  useEffect(() => {
    if (!initialPosts) {
      fetchPosts()
    }
  }, [initialPosts, userId])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const url = userId ? `/api/posts?userId=${userId}` : "/api/posts"

      const response = await fetch(url)
      const data = await response.json()
      setPosts(data)
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePostDelete = (postId: string) => {
    setPosts(posts.filter((post) => post.id !== postId))
  }

  const handlePostUpdate = (updatedPost: any) => {
    setPosts(posts.map((post) => (post.id === updatedPost.id ? updatedPost : post)))
  }

  const handleCommentAdd = (postId: string, comment: any) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [comment, ...post.comments.slice(0, 2)],
          }
        }
        return post
      }),
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-4 flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-64 w-full" />
            <div className="p-4 space-y-4">
              <div className="flex gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">No posts yet</h2>
        <p className="text-muted-foreground">
          {userId ? "This user hasn't posted anything yet." : "Be the first to post something!"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Post
          key={post.id}
          post={post}
          currentUser={session?.user}
          onDelete={handlePostDelete}
          onUpdate={handlePostUpdate}
          onCommentAdd={handleCommentAdd}
        />
      ))}
    </div>
  )
}

