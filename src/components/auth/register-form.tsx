"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { ImageIcon, Lock, Mail, User, UserCog } from "lucide-react"
import { useForm } from "react-hook-form"

import type { CloudinaryUploadResult } from "@/app/[lang]/(dashboard-layout)/pages/account/courses/_services/cloudinary-service"
import type { DictionaryType } from "@/lib/get-dictionary"
import type { LocaleType, RegisterFormType } from "@/types"
import type { RegisterResponse } from "@/types/api"

import { RegisterSchema } from "@/schemas/register-schema"

import { ApiClientError, apiClient } from "@/lib/api-client"
import { ensureLocalizedPathname } from "@/lib/i18n"
import { ensureRedirectPathname } from "@/lib/utils"

import { toast } from "@/components/ui/sonner"
import { Button, ButtonLoading } from "@/components/ui/button"
import { CloudinaryUploader, type CloudinaryUploaderRef } from "@/components/ui/cloudinary-uploader"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SeparatorWithText } from "@/components/ui/separator"
import {
  Steps,
  StepsConnector,
  StepsContent,
  StepsItem,
  StepsList,
} from "@/components/ui/steps"
import { OAuthLinks } from "./oauth-links"
import { PasswordRequirements } from "./password-requirements"
import { VerifyEmailForm } from "./verify-email-form"

const TOTAL_STEPS = 5

export function RegisterForm({ dictionary, onSwitchToSignIn }: { dictionary: DictionaryType; onSwitchToSignIn?: () => void }) {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [registeredEmail, setRegisteredEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const uploaderRef = useRef<CloudinaryUploaderRef>(null)

  const form = useForm<RegisterFormType>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "student",
      password: "",
      confirmPassword: "",
      imageProfileUrl: "",
    },
  })

  const locale = params.lang as LocaleType
  const redirectPathname = searchParams.get("redirectTo")
  const t = dictionary.auth.register

  // Validation for each step
  const validateStep = async (step: number): Promise<boolean> => {
    switch (step) {
      case 0: // Basic Info
        return await form.trigger(["name", "email"])
      case 1: // Role
        return await form.trigger(["role"])
      case 2: // Password
        return await form.trigger(["password", "confirmPassword"])
      case 3: // Image (optional, always valid)
        return true
      default:
        return true
    }
  }

  const handleNext = async () => {
    const isValid = await validateStep(activeStep)
    if (isValid && activeStep < TOTAL_STEPS - 1) {
      if (activeStep === 3) {
        // Step 4 (Image) - Submit form
        await handleSubmit()
      } else {
        setActiveStep(activeStep + 1)
      }
    }
  }

  const handlePrevious = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1)
    }
  }

  const handleImageUpload = (result: CloudinaryUploadResult) => {
    form.setValue("imageProfileUrl", result.secureUrl)
  }

  const handleSubmit = async () => {
    const data = form.getValues()
    const { name, email, role, password } = data
    let { imageProfileUrl } = data

    setIsSubmitting(true)

    try {
      // Auto-upload the image if a file was selected but not yet uploaded
      if (uploaderRef.current && !imageProfileUrl) {
        try {
          const uploadResult = await uploaderRef.current.upload()
          imageProfileUrl = uploadResult.secureUrl
          form.setValue("imageProfileUrl", imageProfileUrl)
        } catch {
          // No file selected or upload failed — continue without image
        }
      }

      const result = await apiClient.post<RegisterResponse>(
        "/auth/register",
        {
          name,
          email,
          role,
          password,
          imageProfileUrl: imageProfileUrl || undefined,
        },
        { skipAuth: true }
      )

      // Check if email verification is required
      const response = result as unknown as RegisterResponse
      if (
        "requiresEmailVerification" in response &&
        response.requiresEmailVerification
      ) {
        toast.success(dictionary.auth.register.registrationSuccessful, {
          description:
            result.message || dictionary.auth.register.checkEmailMessage,
        })

        setRegisteredEmail(email)
        setActiveStep(4) // Go to OTP step
        return
      }

      // If no verification needed, go to auth page
      toast.success(dictionary.auth.register.registrationSuccessful)
      if (onSwitchToSignIn) {
        onSwitchToSignIn()
      } else {
        router.push(ensureLocalizedPathname("/auth", locale))
      }
    } catch (error) {
      if (error instanceof ApiClientError) {
        // Handle validation errors
        if (error.isValidationError() && error.data) {
          const apiError = error.data as {
            issues?: { path: string[]; message: string }[]
          }
          if (apiError.issues) {
            apiError.issues.forEach((issue) => {
              const field = issue.path[0] as keyof RegisterFormType
              form.setError(field, { type: "manual", message: issue.message })
            })
            // Go back to relevant step
            if (apiError.issues.some((i) => ["name", "email"].includes(i.path[0]))) {
              setActiveStep(0)
            } else if (apiError.issues.some((i) => i.path[0] === "role")) {
              setActiveStep(1)
            } else if (apiError.issues.some((i) => ["password", "confirmPassword"].includes(i.path[0]))) {
              setActiveStep(2)
            }
            return
          }
        }

        toast.error(dictionary.auth.register.registrationFailed, {
          description: error.message,
        })
      } else {
        toast.error(dictionary.auth.register.registrationFailed, {
          description:
            error instanceof Error
              ? error.message
              : "An unknown error occurred.",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Step 5: OTP Verification (no back button, separate view)
  if (activeStep === 4) {
    return (
      <div className="grid gap-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {dictionary.auth.register.checkEmail}
          </h1>
          <p className="text-muted-foreground text-sm">
            {dictionary.auth.register.verificationSent} {registeredEmail}
          </p>
        </div>
        <VerifyEmailForm
          email={registeredEmail}
          dictionary={dictionary}
          onSuccess={() => {
            router.push(ensureLocalizedPathname("/", locale))
          }}
        />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form className="grid gap-6">
        {/* Steps Header */}
        <Steps
          totalSteps={4}
          activeStep={activeStep}
          onStepChange={(step) => {
            // Only allow going back to completed steps
            if (step < activeStep) {
              setActiveStep(step)
            }
          }}
          allowJump={false}
        >
          <StepsList className="mb-6">
            <StepsItem
              step={0}
              label={t.steps.basicInfo}
              icon={<User className="size-4" />}
              showCheckOnComplete
            />
            <StepsConnector afterStep={0} />
            <StepsItem
              step={1}
              label={t.steps.selectRole}
              icon={<UserCog className="size-4" />}
              showCheckOnComplete
            />
            <StepsConnector afterStep={1} />
            <StepsItem
              step={2}
              label={t.steps.setPassword}
              icon={<Lock className="size-4" />}
              showCheckOnComplete
            />
            <StepsConnector afterStep={2} />
            <StepsItem
              step={3}
              label={t.steps.profileImage}
              icon={<ImageIcon className="size-4" />}
              showCheckOnComplete
            />
          </StepsList>

          {/* Step 1: Basic Info */}
          <StepsContent step={0}>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.fullName}</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder={t.fullNamePlaceholder}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.email}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t.emailPlaceholder}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </StepsContent>

          {/* Step 2: Role Selection */}
          <StepsContent step={1}>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.role}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t.rolePlaceholder} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="student">
                          {t.roles.student}
                        </SelectItem>
                        <SelectItem value="instructor">
                          {t.roles.instructor}
                        </SelectItem>
                        <SelectItem value="freelancer">
                          {t.roles.freelancer}
                        </SelectItem>
                        <SelectItem value="organizer">
                          {t.roles.organizer}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </StepsContent>

          {/* Step 3: Password */}
          <StepsContent step={2}>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.password}</FormLabel>
                    <FormControl>
                      <PasswordInput
                        {...field}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.confirmPassword}</FormLabel>
                    <FormControl>
                      <PasswordInput
                        {...field}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                      />
                    </FormControl>
                    <FormMessage />
                    <PasswordRequirements
                      password={form.watch("password")}
                      isVisible={isPasswordFocused}
                      dictionary={dictionary}
                    />
                  </FormItem>
                )}
              />
            </div>
          </StepsContent>

          {/* Step 4: Profile Image */}
          <StepsContent step={3}>
            <div className="grid gap-4">
              <div className="text-center space-y-2 mb-4">
                <h3 className="font-medium">{t.profileImage}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.profileImageDescription}
                </p>
              </div>
              <CloudinaryUploader
                ref={uploaderRef}
                onUploadComplete={handleImageUpload}
                showTypeSelector={false}
                defaultResourceType="image"
                dictionary={dictionary}
              />
              {form.watch("imageProfileUrl") && (
                <p className="text-sm text-muted-foreground text-start">
                  {t.imageUploaded}
                </p>
              )}
            </div>
          </StepsContent>
        </Steps>

        {/* Navigation Buttons */}

        <div className="flex gap-2">
          {activeStep > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              className="flex-1"
            >
              {t.previous}
            </Button>
          )}

          {activeStep < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="flex-1"
            >
              {t.next}
            </Button>
          ) : (
            <ButtonLoading
              type="button"
              onClick={handleNext}
              isLoading={isSubmitting}
              className="flex-1"
            >
              {t.finish}
            </ButtonLoading>
          )}

        </div>


        {/* Footer Links */}
        <div className="text-center text-sm">
          {t.haveAccount}{" "}
          {onSwitchToSignIn ? (
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="underline"
            >
              {t.signIn}
            </button>
          ) : (
            <Link
              href={ensureLocalizedPathname("/auth", locale)}
              className="underline"
            >
              {t.signIn}
            </Link>
          )}
        </div>
        <SeparatorWithText>{t.orContinue}</SeparatorWithText>
        <OAuthLinks dictionary={dictionary} />
      </form>
    </Form>
  )
}
