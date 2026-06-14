"use client"

import { DictionaryType } from "@/lib/get-dictionary"

import { CloudinaryUploader } from "@/components/ui/cloudinary-uploader"
import { Editor } from "@/components/ui/editor"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface ArticleEditorProps {
  content: string
  onChangeContent: (content: string) => void
  duration: number
  onChangeDuration: (duration: number) => void

  dictionary: DictionaryType
}

export function ArticleEditor({
  content,
  onChangeContent,
  duration,
  onChangeDuration,

  dictionary,
}: ArticleEditorProps) {
  const [mode, setMode] = useState<"text" | "file">(
    content.startsWith("http") ? "file" : "text"
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="duration">Estimated Read Time (minutes)</Label>
          <Input
            id="duration"
            type="number"
            min={0}
            value={duration || ""}
            onChange={(e) => onChangeDuration(parseInt(e.target.value) || 0)}
            placeholder="e.g. 5"
          />
        </div>

        <div className="space-y-2">
          <Label>Content Type</Label>
          <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
            <Button
              variant="ghost"
              onClick={() => {
                setMode("text")
                if (content.startsWith("http")) onChangeContent("") 
              }}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all h-auto",
                mode === "text"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Rich Text
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setMode("file")
                if (!content.startsWith("http")) onChangeContent("")
              }}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all h-auto",
                mode === "file"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              File
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Lesson Content</Label>
        {mode === "text" ? (
          <div className="min-h-[300px] border rounded-md">
            <Editor
              value={content}
              onValueChange={onChangeContent}
              placeholder="Write your lesson content here..."
            />
          </div>
        ) : (
             <div className="space-y-2">
                 <CloudinaryUploader
                    dictionary={dictionary}
                    defaultResourceType="raw"
                    showTypeSelector={false}
                    onUploadComplete={(res) => onChangeContent(res.secureUrl)}
                    initialValue={content.startsWith("http") ? content : ""}
                    onRemove={() => onChangeContent("")}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                />
                <p className="text-sm text-muted-foreground">
                    Upload a PDF, Word document, or other file for students to read.
                </p>
             </div>
        )}
      </div>
    </div>
  )
}
