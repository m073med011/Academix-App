"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { organizationService, type Level } from "../../../_services/organization.service"
import type { User } from "@/types/api"

interface AddMemberModalProps {
  organizationId: string
  roles: { _id?: string; id?: string; name: string }[]
  levels: Level[]
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

function unwrap<T>(res: any): T[] {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  return []
}

export function AddMemberModal({
  organizationId,
  roles,
  levels,
  isOpen,
  onClose,
  onSuccess,
}: AddMemberModalProps) {
  const [email, setEmail] = useState("")
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [roleId, setRoleId] = useState("")
  const [levelId, setLevelId] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setEmail("")
      setResults([])
      setSelectedUser(null)
      setRoleId("")
      setLevelId("")
    }
  }, [isOpen])

  const handleSearch = async () => {
    if (!email.trim()) {
      toast.error("Enter an email to search.")
      return
    }
    setSearching(true)
    try {
      const res = await organizationService.searchUsers(email.trim())
      const found = unwrap<User>(res)
      setResults(found)
      if (found.length === 0) toast.info("No users found for that email.")
    } catch (error) {
      console.error(error)
      toast.error("Failed to search users.")
    } finally {
      setSearching(false)
    }
  }

  const handleAdd = async () => {
    if (!selectedUser) {
      toast.error("Select a user to add.")
      return
    }
    if (!roleId) {
      toast.error("Select a role.")
      return
    }
    setSubmitting(true)
    try {
      await organizationService.addMember(organizationId, {
        userId: selectedUser._id,
        email: selectedUser.email,
        roleId,
        levelId: levelId || undefined,
      })
      toast.success("Member added successfully.")
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message || "Failed to add member.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
          <DialogDescription>
            Search for a user by email, then assign a role.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="member-email">User Email</Label>
            <div className="flex gap-2">
              <Input
                id="member-email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                disabled={searching || submitting}
              />
              <Button variant="outline" onClick={handleSearch} disabled={searching || submitting}>
                <Search className="h-4 w-4" />
                {searching ? "..." : "Search"}
              </Button>
            </div>
          </div>

          {results.length > 0 && (
            <div className="space-y-2">
              <Label>Select User</Label>
              <div className="max-h-44 overflow-y-auto border rounded-md divide-y">
                {results.map((user) => (
                  <button
                    type="button"
                    key={user._id}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full flex items-center gap-3 p-2 text-left text-sm hover:bg-muted/50 ${
                      selectedUser?._id === user._id ? "bg-primary/10" : ""
                    }`}
                  >
                    {user.imageProfileUrl ? (
                      <img src={user.imageProfileUrl} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {user.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium truncate">{user.name}</p>
                      <p className="text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="member-role">Role</Label>
            <Select value={roleId} onValueChange={setRoleId} disabled={submitting}>
              <SelectTrigger id="member-role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role._id || role.id} value={(role._id || role.id) as string}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {levels.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="member-level">Level (optional)</Label>
              <Select value={levelId} onValueChange={setLevelId} disabled={submitting}>
                <SelectTrigger id="member-level">
                  <SelectValue placeholder="No level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level._id} value={level._id}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={submitting || !selectedUser}>
            {submitting ? "Adding..." : "Add Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
