"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { userService } from "@/app/[lang]/(dashboard-layout)/pages/account/_services/user-service"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2 } from "lucide-react"

import type { DictionaryType } from "@/lib/get-dictionary"

import { toast } from "@/components/ui/sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CloudinaryUploader } from "@/components/ui/cloudinary-uploader"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  imageProfileUrl: z.string().optional(),
})

interface EditProfileFormProps {
  user: {
    name: string
    imageProfileUrl?: string
  }
  onSuccess?: () => void
  dictionary: DictionaryType
}

export function EditProfileForm({
  user,
  onSuccess,
  dictionary,
}: EditProfileFormProps) {
  const { update } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isImageUploading, setIsImageUploading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      imageProfileUrl: user.imageProfileUrl || "",
    },
  })

  const imageProfileUrl = form.watch("imageProfileUrl")

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      const updatedUser = await userService.updateProfile(values)

      await update({
        ...updatedUser,
      })

      toast.success("Profile updated", {
        description: "Your profile has been updated successfully.",
      })

      router.refresh()
      onSuccess?.()
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update profile. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-full max-w-xs">
            <CloudinaryUploader
              dictionary={dictionary}
              showTypeSelector={false}
              defaultResourceType="image"
              onUploadStart={() => setIsImageUploading(true)}
              onUploadComplete={(result) => {
                form.setValue("imageProfileUrl", result.secureUrl)
                setIsImageUploading(false)
              }}
              onError={(error) => {
                toast.error("Upload failed", {
                  description: error,
                })
                setIsImageUploading(false)
              }}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading || isImageUploading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  )
}
