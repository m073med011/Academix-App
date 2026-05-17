"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { ensureLocalizedPathname } from "@/lib/i18n"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { userService } from "../../../_services/user-service"

export function DangerZone() {
  const [isDisabling, setIsDisabling] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const params = useParams()
  const locale = (params?.lang as string) || "en"

  const handleDisableAccount = async () => {
    try {
      setIsDisabling(true)
      await userService.disableAccount()
      toast.success("Account disabled successfully")
      await signOut({ callbackUrl: ensureLocalizedPathname("/auth", locale) })
    } catch (error) {
      toast.error("Failed to disable account")
    } finally {
      setIsDisabling(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true)
      await userService.deleteAccount()
      toast.success("Account deleted permanently")
      await signOut({ callbackUrl: ensureLocalizedPathname("/auth", locale) })
    } catch (error) {
      toast.error("Failed to delete account")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          Irreversible and destructive actions for your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Disable Account */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg">
          <div className="space-y-1">
            <h4 className="font-medium font-heading">Disable Account</h4>
            <p className="text-sm text-muted-foreground">
              Temporarily disable your account. You can reactivate it anytime by
              logging in with your credentials.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={isDisabling || isDeleting}>
                {isDisabling && <Loader2 className="me-2 size-4 animate-spin" />}
                Disable Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will log you out immediately and disable your account.
                  Your public profile will be hidden until you reactivate it by
                  logging back in.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDisableAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Confirm Disable
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Delete Account */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-destructive/20 rounded-lg bg-destructive/5">
          <div className="space-y-1">
            <h4 className="font-medium font-heading text-destructive dark:text-red-400">
              Delete Account
            </h4>
            <p className="text-sm text-muted-foreground">
              Permanently remove your account and all of your data. This action
              cannot be undone.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDisabling || isDeleting}>
                {isDeleting && <Loader2 className="me-2 size-4 animate-spin" />}
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Permanently
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
