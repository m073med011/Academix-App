"use client"

import { useEffect, useRef, useState } from "react"
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  FileText,
  HelpCircle,
  Link as LinkIcon,
  Loader2,
  Video,
  X,
} from "lucide-react"

import type { DictionaryType } from "@/lib/get-dictionary"
import { QuizQuestion } from "@/types/api"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CloudinaryUploader } from "@/components/ui/cloudinary-uploader"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Editor } from "@/components/ui/editor"
import { Input } from "@/components/ui/input"
import { InputSpin } from "@/components/ui/input-spin"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArticleEditor } from "../article-editor"
import { AssignmentForm } from "../assignment-form"
import { ExternalLinkForm } from "../external-link-form"
import { QuizBuilder } from "../quiz-builder"

type ContentType = "video" | "text" | "quiz" | "assignment" | "link"

interface AddContentModalProps {
  isOpen: boolean
  onClose: () => void
  onAddContent: (type: ContentType, data: any) => void
  dictionary: DictionaryType
  mode?: "create" | "edit"
  initialData?: any
}

export function AddContentModal({
  isOpen,
  onClose,
  onAddContent,
  dictionary,
  mode = "create",
  initialData,
}: AddContentModalProps) {
  const [step, setStep] = useState<"selection" | "form">(
    mode === "edit" ? "form" : "selection"
  )
  const [selectedType, setSelectedType] = useState<ContentType | null>(
    (initialData?.type as ContentType) || null
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Refs for auto-upload
  const videoUploaderRef =
    useRef<import("@/components/ui/cloudinary-uploader").CloudinaryUploaderRef>(
      null
    )
  const articleUploaderRef =
    useRef<import("@/components/ui/cloudinary-uploader").CloudinaryUploaderRef>(
      null
    )

  // Common State
  const [title, setTitle] = useState(initialData?.title || "")
  const [description, setDescription] = useState(initialData?.description || "")

  // Video State
  const [videoSource, setVideoSource] = useState<
    "upload" | "embed" | "library"
  >(initialData?.videoSource || "upload")
  const [videoUrl, setVideoUrl] = useState(
    initialData?.url || initialData?.videoUrl || ""
  )
  const [isFreePreview, setIsFreePreview] = useState(
    initialData?.isFreePreview || false
  )
  const [allowDownloads, setAllowDownloads] = useState(
    initialData?.allowDownloads || false
  )
  const [isPublished, setIsPublished] = useState(
    initialData?.isPublished ?? true
  )

  // Article State
  const [articleContent, setArticleContent] = useState(
    initialData?.content || ""
  )
  const [readTime, setReadTime] = useState(initialData?.duration || 0)

  // Assignment State
  const [points, setPoints] = useState(initialData?.points || 100)
  const [dueDate, setDueDate] = useState<Date | undefined>(
    initialData?.dueDate ? new Date(initialData.dueDate) : undefined
  )
  const [submissionTypes, setSubmissionTypes] = useState<string[]>(
    initialData?.submissionTypes || ["file"]
  )
  const [allowLate, setAllowLate] = useState(initialData?.allowLate || false)
  const [assignmentFileUrl, setAssignmentFileUrl] = useState(
    initialData?.assignmentFileUrl || ""
  )

  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(
    initialData?.quizQuestions || []
  )

  // Article State (Extended)
  const [thumbnailUrl, setThumbnailUrl] = useState(
    initialData?.thumbnailUrl || ""
  )

  // Link State
  const [openInNewTab, setOpenInNewTab] = useState(
    initialData?.openInNewTab ?? true
  )

  // Search State
  const [searchQuery, setSearchQuery] = useState("")

  // Sync state with initialData when modal opens or data changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setStep("form")
        setSelectedType(initialData.type as ContentType)
        setTitle(initialData.title || "")
        setDescription(initialData.description || "")

        // Video
        setVideoSource(initialData.videoSource || "upload")
        setVideoUrl(initialData.url || initialData.videoUrl || "")
        setIsFreePreview(initialData.isFreePreview || false)
        setAllowDownloads(initialData.allowDownloads || false)
        setIsPublished(initialData.isPublished ?? true)

        // Article
        setArticleContent(initialData.content || "")
        setReadTime(initialData.duration || 0)
        setThumbnailUrl(initialData.thumbnailUrl || "")

        // Assignment
        setPoints(initialData.points || 100)
        setReadTime(initialData.duration || 0) // Assignment duration
        setDueDate(
          initialData.dueDate ? new Date(initialData.dueDate) : undefined
        )
        setSubmissionTypes(initialData.submissionTypes || ["file"])
        setAllowLate(initialData.allowLate || false)
        setAssignmentFileUrl(initialData.assignmentFileUrl || "")

        // Quiz
        setQuizQuestions(initialData.quizQuestions || [])

        // Link
        setOpenInNewTab(initialData.openInNewTab ?? true)
      } else {
        // Reset for create mode
        setStep("selection")
        setSelectedType(null)
        setTitle("")
        setDescription("")
        setVideoUrl("")
        setArticleContent("")
        setPoints(100)
        setDueDate(undefined)
        setAssignmentFileUrl("")
        setQuizQuestions([])
        setThumbnailUrl("")
        setOpenInNewTab(true)
        setIsPublished(true)
        setIsFreePreview(false)
        setAllowDownloads(false)
      }
    }
  }, [isOpen, mode, initialData])

  const handleTypeSelect = (type: ContentType) => {
    // If selected type is 'text', we treat it as 'article' in UI but 'text' in data
    setSelectedType(type)
    setStep("form")
    // Reset form defaults for new content
    setTitle("")
    setDescription("")
    setVideoUrl("")
    setArticleContent("")
    setPoints(100)
    setDueDate(undefined)
    setAssignmentFileUrl("")
    setQuizQuestions([])
    setThumbnailUrl("")
    setOpenInNewTab(true)
    setIsPublished(true)
    setIsFreePreview(false)
    setAllowDownloads(false)
  }

  const handleBack = () => {
    setStep("selection")
    setSelectedType(null)
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setStep("selection")
      setSelectedType(null)
    }, 300)
  }

  const handleSubmit = async () => {
    if (!selectedType) return

    setIsSubmitting(true)
    let finalVideoUrl = videoUrl

    try {
      // Handle Auto-Upload for Video
      if (selectedType === "video" && videoSource === "upload" && !videoUrl) {
        if (videoUploaderRef.current) {
          try {
            const result = await videoUploaderRef.current.upload()
            finalVideoUrl = result.secureUrl
          } catch (error) {
            console.error("Auto upload failed", error)
            setIsSubmitting(false)
            return // Stop submission if upload fails
          }
        }
      }

      // Handle Auto-Upload for Article (Thumbnail)
      let finalThumbnailUrl = ""
      if (selectedType === "text") {
        if (articleUploaderRef.current) {
          try {
            const result = await articleUploaderRef.current.upload()
            finalThumbnailUrl = result.secureUrl
          } catch (error: any) {
            if (error.message !== "No file selected") {
              console.error("Thumbnail upload failed", error)
            }
          }
        }
      }

      const commonData = { title, description, isPublished }
      let specificData = {}

      switch (selectedType) {
        case "video":
          specificData = {
            videoSource,
            videoUrl: finalVideoUrl,
            isFreePreview,
            allowDownloads,
          }
          break
        case "text": // Changed from "article"
          specificData = {
            content: articleContent,
            readTime,
            duration: readTime,
            isFreePreview,
            allowDownloads,
            thumbnailUrl: thumbnailUrl || finalThumbnailUrl,
          }
          break
        case "assignment":
          specificData = {
            points,
            dueDate,
            submissionTypes,
            allowLate,
            assignmentFileUrl,
            duration: readTime,
            isFreePreview,
            allowDownloads,
          }
          break
        case "quiz":
          specificData = { quizQuestions, isFreePreview }
          break
        case "link":
          specificData = { url: videoUrl, openInNewTab } // Reusing videoUrl for link URL as per original code
          break
      }

      onAddContent(selectedType, {
        ...commonData,
        ...specificData,
        // Preserve ID if editing
        id: initialData?.id,
      })
      handleClose()
      setIsSubmitting(false)
    } catch (e) {
      console.error(e)
      setIsSubmitting(false)
    }
  }

  const contentTypes = [
    {
      id: "video",
      // ...
      label: "Lesson (Video)",
      description: "Upload video files or embed from external sources",
      icon: Video,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      id: "text", // Changed from "article"
      label: "Lesson (Article)",
      description: "Create text-based lessons with rich media",
      icon: FileText,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      id: "quiz",
      label: "Quiz",
      description: "Assess student knowledge with multiple questions",
      icon: HelpCircle,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      id: "assignment",
      label: "Assignment",
      description: "Create tasks for students to submit files or text",
      icon: ClipboardList,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
    },
    {
      id: "link",
      label: "External Link",
      description: "Link to external resources or websites",
      icon: LinkIcon,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
  ] as const

  // Filter content types based on search query
  const filteredContentTypes = contentTypes.filter((type) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      type.label.toLowerCase().includes(query) ||
      type.description.toLowerCase().includes(query)
    )
  })

  const renderForm = () => {
    switch (selectedType) {
      case "video":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Lesson Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Introduction to UX Design"
              />
            </div>

            <div className="space-y-2">
              <Label>Video Source</Label>
              <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
                {(["upload", "embed", "library"] as const).map((source) => (
                  <Button
                    key={source}
                    variant="ghost"
                    onClick={() => setVideoSource(source)}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded-md transition-all h-auto",
                      videoSource === source
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {source.charAt(0).toUpperCase() + source.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {videoSource === "upload" ? (
              <CloudinaryUploader
                key={`video-${initialData?.id || "new"}-${initialData?.url || initialData?.videoUrl || ""}`}
                ref={videoUploaderRef}
                dictionary={dictionary}
                defaultResourceType="video"
                showTypeSelector={false}
                onUploadComplete={(res) => setVideoUrl(res.secureUrl)}
                onRemove={() => setVideoUrl("")}
                accept="video/*"
                initialValue={initialData?.url || initialData?.videoUrl}
              />
            ) : (
              <div className="space-y-2">
                <Label>Video URL</Label>
                <Input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a brief description..."
              />
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-published"
                  checked={isPublished}
                  onCheckedChange={(c) => setIsPublished(!!c)}
                />
                <Label htmlFor="is-published">Published</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="free-preview"
                  checked={isFreePreview}
                  onCheckedChange={(c) => setIsFreePreview(!!c)}
                />
                <Label htmlFor="free-preview">Enable free preview</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allow-downloads"
                  checked={allowDownloads}
                  onCheckedChange={(c) => setAllowDownloads(!!c)}
                />
                <Label htmlFor="allow-downloads">Allow downloads</Label>
              </div>
            </div>
          </div>
        )

      case "text": // Changed from "article"
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Lesson Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Understanding User Research"
              />
            </div>

            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a brief description..."
              />
            </div>

            <ArticleEditor
              dictionary={dictionary}
              content={articleContent}
              onChangeContent={setArticleContent}
              duration={readTime}
              onChangeDuration={setReadTime}
            />

            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-published-text"
                  checked={isPublished}
                  onCheckedChange={(c) => setIsPublished(!!c)}
                />
                <Label htmlFor="is-published-text">Published</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="free-preview-text"
                  checked={isFreePreview}
                  onCheckedChange={(c) => setIsFreePreview(!!c)}
                />
                <Label htmlFor="free-preview-text">Enable free preview</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allow-downloads-text"
                  checked={allowDownloads}
                  onCheckedChange={(c) => setAllowDownloads(!!c)}
                />
                <Label htmlFor="allow-downloads-text">Allow downloads</Label>
              </div>
            </div>
          </div>
        )

      case "assignment":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Assignment Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Final UX Case Study"
              />
            </div>

            <div className="space-y-2">
              <Label>Instructions</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide detailed instructions..."
                className="min-h-[100px]"
              />
            </div>

            <AssignmentForm
              dictionary={dictionary}
              points={points}
              onChangePoints={setPoints}
              fileUrl={assignmentFileUrl}
              onChangeFileUrl={setAssignmentFileUrl}
            />

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  min={0}
                  value={readTime || ""}
                  onChange={(e) => setReadTime(parseInt(e.target.value) || 0)}
                  placeholder="e.g. 60"
                />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <DatePicker value={dueDate} onValueChange={setDueDate} />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label>Submission Type</Label>
              <div className="flex gap-4">
                {["File Upload", "Text Entry", "Website URL"].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`sub-${type}`}
                      checked={submissionTypes.includes(type)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSubmissionTypes([...submissionTypes, type])
                        } else {
                          setSubmissionTypes(
                            submissionTypes.filter((t) => t !== type)
                          )
                        }
                      }}
                    />
                    <Label htmlFor={`sub-${type}`}>{type}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="allow-late"
                checked={allowLate}
                onCheckedChange={(c) => setAllowLate(!!c)}
              />
              <Label htmlFor="allow-late">Allow Late Submissions</Label>
            </div>

            <div className="flex flex-wrap gap-4 pt-4 border-t mt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-published-assignment"
                  checked={isPublished}
                  onCheckedChange={(c) => setIsPublished(!!c)}
                />
                <Label htmlFor="is-published-assignment">Published</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="free-preview-assignment"
                  checked={isFreePreview}
                  onCheckedChange={(c) => setIsFreePreview(!!c)}
                />
                <Label htmlFor="free-preview-assignment">
                  Enable free preview
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allow-downloads-assignment"
                  checked={allowDownloads}
                  onCheckedChange={(c) => setAllowDownloads(!!c)}
                />
                <Label htmlFor="allow-downloads-assignment">
                  Allow downloads
                </Label>
              </div>
            </div>
          </div>
        )

      case "link":
        return (
          <ExternalLinkForm
            url={videoUrl}
            onChangeUrl={setVideoUrl}
            title={title}
            onChangeTitle={setTitle}
            description={description}
            onChangeDescription={setDescription}
            openInNewTab={openInNewTab}
            onChangeOpenInNewTab={setOpenInNewTab}
          />
        )

      case "quiz":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Quiz Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chapter 1 Quiz"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Quiz instructions..."
              />
            </div>
            <QuizBuilder
              questions={quizQuestions}
              onChange={setQuizQuestions}
            />

            <div className="flex flex-wrap gap-4 pt-4 border-t mt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-published-quiz"
                  checked={isPublished}
                  onCheckedChange={(c) => setIsPublished(!!c)}
                />
                <Label htmlFor="is-published-quiz">Published</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="free-preview-quiz"
                  checked={isFreePreview}
                  onCheckedChange={(c) => setIsFreePreview(!!c)}
                />
                <Label htmlFor="free-preview-quiz">Enable free preview</Label>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            Form for {selectedType} is under construction.
          </div>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          "p-0 gap-0 overflow-hidden flex flex-col h-[85vh]",
          step === "selection" ? "sm:max-w-md" : "sm:max-w-2xl"
        )}
      >
        <DialogHeader className="p-6 pb-2 shrink-0">
          <DialogTitle className="text-xl">
            {step === "selection"
              ? "Add Content to Module"
              : `${mode === "edit" ? "Edit" : "Add New"} ${
                  contentTypes
                    .find((c) => c.id === selectedType)
                    ?.label.split(" ")[0]
                }${
                  selectedType === "video" || selectedType === "text"
                    ? `: ${contentTypes
                        .find((c) => c.id === selectedType)
                        ?.label.split("(")[1]
                        .replace(")", "")}`
                    : ""
                }`}
          </DialogTitle>
          {step === "selection" && (
            <DialogDescription>
              Choose the type of content you want to add to this module.
            </DialogDescription>
          )}
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 pt-2">
          {step === "selection" ? (
            <div className="space-y-4">
              <div className="relative">
                <Input
                  placeholder="Search content type..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute left-3 top-3 text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {searchQuery ? "Results" : "Recommended"}
                </p>
                <div className="grid gap-2">
                  {filteredContentTypes.length > 0 ? (
                    filteredContentTypes.map((type) => (
                      <Button
                        key={type.id}
                        variant="ghost"
                        onClick={() => handleTypeSelect(type.id)}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left w-full group h-auto justify-start"
                      >
                        <div
                          className={cn(
                            "p-2 rounded-md transition-colors shrink-0",
                            type.bgColor
                          )}
                        >
                          <type.icon className={cn("size-5", type.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium group-hover:text-primary transition-colors">
                            {type.label}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {type.description}
                          </div>
                        </div>
                      </Button>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No content types found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">{renderForm()}</div>
          )}
          </div>
        </ScrollArea>

        {step === "form" && (
          <div className="p-6 pt-4 border-t shrink-0 bg-background flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={isSubmitting || mode === "edit"}
              className={mode === "edit" ? "invisible" : ""}
            >
              <ArrowLeft className="size-4 mr-2" />
              Back
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading & Saving...
                  </>
                ) : mode === "edit" ? (
                  "Update Lesson"
                ) : selectedType === "assignment" ? (
                  "Save Assignment"
                ) : selectedType === "link" ? (
                  "Save Link"
                ) : selectedType === "text" ? (
                  "Save Lesson"
                ) : (
                  "Add Lesson"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
