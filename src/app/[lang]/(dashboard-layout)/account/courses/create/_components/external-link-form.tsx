"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

interface ExternalLinkFormProps {
  url: string
  onChangeUrl: (url: string) => void
  title: string
  onChangeTitle: (title: string) => void
  description: string
  onChangeDescription: (description: string) => void
  openInNewTab: boolean
  onChangeOpenInNewTab: (openInNewTab: boolean) => void
}

export function ExternalLinkForm({
  url,
  onChangeUrl,
  title,
  onChangeTitle,
  description,
  onChangeDescription,
  openInNewTab,
  onChangeOpenInNewTab,
}: ExternalLinkFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="link-title">Link Title</Label>
        <Input
          id="link-title"
          value={title}
          onChange={(e) => onChangeTitle(e.target.value)}
          placeholder="e.g. Official Documentation"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="link-url">URL</Label>
        <Input
          id="link-url"
          value={url}
          onChange={(e) => onChangeUrl(e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="link-description">Description (Optional)</Label>
        <Textarea
          id="link-description"
          value={description}
          onChange={(e) => onChangeDescription(e.target.value)}
          placeholder="Brief description of the link..."
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label className="text-base">Open in new tab</Label>
          <div className="text-sm text-muted-foreground">
            Open the link in a new browser tab or window
          </div>
        </div>
        <Switch
          checked={openInNewTab}
          onCheckedChange={onChangeOpenInNewTab}
        />
      </div>
    </div>
  )
}
