"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { UserPlus, Search, UserCheck, UserX } from "lucide-react"

interface FriendsListProps {
  userId: string
}

export function FriendsList({ userId }: FriendsListProps) {
  const [friends, setFriends] = useState<any[]>([])
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFriends()
    fetchPendingRequests()
  }, [])

  const fetchFriends = async () => {
    try {
      const response = await fetch("/api/friends")
      if (!response.ok) throw new Error("Failed to fetch friends")

      const data = await response.json()
      setFriends(data)
    } catch (error) {
      console.error("Error fetching friends:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch("/api/friends/pending")
      if (!response.ok) throw new Error("Failed to fetch pending requests")

      const data = await response.json()
      setPendingRequests(data)
    } catch (error) {
      console.error("Error fetching pending requests:", error)
    }
  }

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/friends/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" }),
      })

      if (!response.ok) throw new Error("Failed to accept request")

      // Refresh lists
      fetchFriends()
      fetchPendingRequests()
    } catch (error) {
      console.error("Error accepting friend request:", error)
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/friends/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" }),
      })

      if (!response.ok) throw new Error("Failed to reject request")

      // Refresh pending requests
      fetchPendingRequests()
    } catch (error) {
      console.error("Error rejecting friend request:", error)
    }
  }

  const handleRemoveFriend = async (friendshipId: string) => {
    if (!confirm("Are you sure you want to remove this friend?")) return

    try {
      const response = await fetch(`/api/friends/${friendshipId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to remove friend")

      // Refresh friends list
      fetchFriends()
    } catch (error) {
      console.error("Error removing friend:", error)
    }
  }

  const filteredFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="text-center py-12">
        <p>Loading friends...</p>
      </div>
    )
  }

  return (
    <Tabs defaultValue="friends">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="friends">Friends</TabsTrigger>
        <TabsTrigger value="requests">
          Requests
          {pendingRequests.length > 0 && (
            <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
              {pendingRequests.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="friends">
        <Card>
          <CardHeader>
            <CardTitle>Your Friends</CardTitle>
            <CardDescription>Manage your connections on DailyFlip.</CardDescription>
            <div className="flex items-center gap-2 mt-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredFriends.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No friends yet</h3>
                <p className="text-muted-foreground mb-4">Start connecting with other users on DailyFlip.</p>
                <Button asChild>
                  <Link href="/explore">Find Friends</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredFriends.map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={friend.image || ""} alt={friend.name} />
                        <AvatarFallback>{friend.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <Link href={`/profile/${friend.id}`} className="font-medium hover:underline">
                          {friend.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">{friend.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/profile/${friend.id}`}>View Profile</Link>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveFriend(friend.friendshipId)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="requests">
        <Card>
          <CardHeader>
            <CardTitle>Friend Requests</CardTitle>
            <CardDescription>Manage incoming friend requests.</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8">
                <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No pending requests</h3>
                <p className="text-muted-foreground">You don't have any pending friend requests.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={request.user.image || ""} alt={request.user.name} />
                        <AvatarFallback>{request.user.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <Link href={`/profile/${request.user.id}`} className="font-medium hover:underline">
                          {request.user.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">{request.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => handleAcceptRequest(request.id)}>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleRejectRequest(request.id)}>
                        <UserX className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

