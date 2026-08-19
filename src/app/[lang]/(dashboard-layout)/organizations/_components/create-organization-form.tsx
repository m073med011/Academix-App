"use client"

import { useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { Plus } from "lucide-react"

import type { CloudinaryUploadResult } from "@/app/[lang]/(dashboard-layout)/account/courses/_services/cloudinary-service"
import type { CloudinaryUploaderRef } from "@/components/ui/cloudinary-uploader"

import { Button, ButtonLoading } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"
import { organizationService } from "../_services/organization.service"

const createOrganizationSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  orgcover: z.string().optional(),
})

type CreateOrganizationFormData = z.infer<typeof createOrganizationSchema>

interface CreateOrganizationFormProps {
  onSuccess: () => void
  onCancel: () => void
  fullDictionary: any // Full dictionary for CloudinaryUploader
  createModal: {
    title: string
    description: string
    name: string
    namePlaceholder: string
    descriptionPlaceholder: string
    orgCover: string
    noImageChosen: string
    chooseImage: string
    cancel: string
    create: string
    creating: string
    success: string
    successDescription: string
    error: string
    errorDescription: string
  }
}

export function CreateOrganizationForm({
  onSuccess,
  onCancel,
  fullDictionary,
  createModal,
}: CreateOrganizationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isImageProcessing, setIsImageProcessing] = useState(false)
  const uploaderRef = useRef<CloudinaryUploaderRef>(null)

  const form = useForm<CreateOrganizationFormData>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
      description: "",
      orgcover: "",
    },
  })

  const handleUploadComplete = (result: CloudinaryUploadResult) => {
    form.setValue("orgcover", result.secureUrl)
  }

  const onSubmit = async (data: CreateOrganizationFormData) => {
    try {
      setIsSubmitting(true)

      // Auto-upload image if selected but not uploaded
      let uploadedUrl = data.orgcover
      if (uploaderRef.current) {
        try {
          const uploadResult = await uploaderRef.current.upload()
          if (uploadResult?.secureUrl) {
            uploadedUrl = uploadResult.secureUrl
          }
        } catch (uploadError: any) {
          // Ignore "No file selected" error, but rethrow real errors
          if (uploadError.message !== "No file selected") {
            throw uploadError
          }
        }
      }

      const submissionData = { ...data, orgcover: uploadedUrl }
      const response = await organizationService.createOrganization(submissionData)

      if (response.success) {
        toast.success(createModal.successDescription)
        form.reset()
        onSuccess()
      }
    } catch (error: any) {
      toast.error(error.message || createModal.errorDescription)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    const currentOrgCover = form.getValues("orgcover")
    // If there's an uploaded image but user is cancelling, delete it
    if (currentOrgCover) {
      uploaderRef.current
        ?.deleteFile()
        .then(() => {
          form.setValue("orgcover", "")
          onCancel()
        })
        .catch((err) => {
          console.error("Failed to cleanup image on cancel:", err)
          onCancel()
        })
      return
    }
    onCancel()
  }

  const isBusy = isSubmitting || isImageProcessing

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-6">
          {/* Organization Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{createModal.name}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={createModal.namePlaceholder}
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Organization Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{createModal.description}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={createModal.descriptionPlaceholder}
                    className="resize-none"
                    rows={4}
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Organization Cover Image */}
          <FormItem>
            <FormLabel>{createModal.orgCover}</FormLabel>
            <CloudinaryUploader
              onUploadComplete={handleUploadComplete}
              accept="image/*"
              showTypeSelector={false}
              defaultResourceType="image"
              showUploadedUrl={false}
              dictionary={fullDictionary}
              placeholder={createModal.noImageChosen}
              buttonLabel={createModal.chooseImage}
              onProcessChange={setIsImageProcessing}
              ref={uploaderRef}
            />
          </FormItem>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-x-2 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isBusy}
          >
            {createModal.cancel}
          </Button>
          <ButtonLoading
            type="submit"
            isLoading={isSubmitting}
            disabled={isBusy}
            icon={Plus}
          >
            {isSubmitting ? createModal.creating : createModal.create}
          </ButtonLoading>
        </div>
      </form>
    </Form>
  )
}
