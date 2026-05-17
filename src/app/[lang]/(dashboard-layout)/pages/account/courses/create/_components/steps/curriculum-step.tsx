"use client"

import { useState } from "react"
import { DragDropContext, Droppable } from "@hello-pangea/dnd"
import type { DropResult } from "@hello-pangea/dnd"
import {
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  GripVertical,
  HelpCircle,
  Link as LinkIcon,
  Loader2,
  MoreHorizontal,
  Pencil,
  PlayCircle,
  Plus,
  Trash2,
} from "lucide-react"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { CourseContent, CourseFormData, CourseModule } from "../../types"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { SortableList } from "@/components/ui/sortable-list"

import { Section } from "../wizard-shell"
import { AddContentModal } from "./add-content-modal"

// Droppable id helpers. Keeping the prefixes in one place avoids string-drift
// between the renderers and the onDragEnd router.
const MODULES_DROPPABLE_ID = "curriculum:modules"
const CONTENT_DROPPABLE_PREFIX = "curriculum:contents:"
const COLLAPSED_HEADER_PREFIX = "curriculum:module-header:"
const contentDroppableId = (moduleId: string) =>
  `${CONTENT_DROPPABLE_PREFIX}${moduleId}`
const collapsedHeaderDroppableId = (moduleId: string) =>
  `${COLLAPSED_HEADER_PREFIX}${moduleId}`
const moduleIdFromContentDroppable = (id: string) =>
  id.startsWith(CONTENT_DROPPABLE_PREFIX)
    ? id.slice(CONTENT_DROPPABLE_PREFIX.length)
    : null
const moduleIdFromCollapsedHeader = (id: string) =>
  id.startsWith(COLLAPSED_HEADER_PREFIX)
    ? id.slice(COLLAPSED_HEADER_PREFIX.length)
    : null

interface CurriculumStepProps {
  dictionary: DictionaryType
  formData: CourseFormData
  onUpdate: (data: Partial<CourseFormData>) => void
  onNext: () => void
  onBack: () => void
}

const CONTENT_TYPE_LABEL: Record<CourseContent["type"], string> = {
  video: "Video",
  text: "Article",
  quiz: "Quiz",
  assignment: "Assignment",
  link: "Link",
}

function ContentTypeGlyph({ type }: { type: CourseContent["type"] }) {
  // Monochrome by design: DESIGN.md confines accent / chart colors out of UI
  // chrome. The glyph alone carries the content-type signal.
  const common = "size-4 text-muted-foreground"
  switch (type) {
    case "video":
      return <PlayCircle className={common} aria-hidden />
    case "quiz":
      return <HelpCircle className={common} aria-hidden />
    case "assignment":
      return <ClipboardList className={common} aria-hidden />
    case "link":
      return <LinkIcon className={common} aria-hidden />
    case "text":
    default:
      return <FileText className={common} aria-hidden />
  }
}

export function CurriculumStep({
  dictionary,
  formData,
  onUpdate,
}: CurriculumStepProps) {
  const t = dictionary.profilePage.createCourse.curriculum
  const tActions = dictionary.profilePage.createCourse.actions

  const [isAddContentModalOpen, setIsAddContentModalOpen] = useState(false)
  const [targetModuleId, setTargetModuleId] = useState<string | null>(null)
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null)

  // Inline edit state for module title
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [editingContent, setEditingContent] = useState<CourseContent | null>(
    null
  )

  const modules = formData.modules

  const setModules = (next: CourseModule[]) => onUpdate({ modules: next })

  const handleAddModule = () => {
    const newModule: CourseModule = {
      id: crypto.randomUUID(),
      title: `Module ${modules.length + 1}`,
      isExpanded: true,
      contents: [],
    }
    setModules([...modules, newModule])
    setEditingModuleId(newModule.id)
    setEditingTitle(newModule.title)
  }

  const handleSaveModuleTitle = () => {
    if (!editingModuleId) return
    setModules(
      modules.map((m) =>
        m.id === editingModuleId
          ? { ...m, title: editingTitle.trim() || m.title }
          : m
      )
    )
    setEditingModuleId(null)
    setEditingTitle("")
  }

  const handleDeleteModule = (moduleId: string) => {
    setModules(modules.filter((m) => m.id !== moduleId))
  }

  const handleToggleModule = (moduleId: string) => {
    setModules(
      modules.map((m) =>
        m.id === moduleId ? { ...m, isExpanded: !m.isExpanded } : m
      )
    )
  }

  const handleEditContent = (moduleId: string, content: CourseContent) => {
    setTargetModuleId(moduleId)
    setEditingContent(content)
    setIsAddContentModalOpen(true)
  }

  const handleOpenAddContent = (moduleId: string) => {
    setTargetModuleId(moduleId)
    setEditingContent(null)
    setIsAddContentModalOpen(true)
  }

  const removeLesson = async (moduleId: string, contentId: string) => {
    setDeletingLessonId(contentId)
    const module = modules.find((m) => m.id === moduleId)
    const content = module?.contents.find((c) => c.id === contentId)

    if (content?.url) {
      try {
        const { deleteFromCloudinary, extractPublicId } = await import(
          "@/app/[lang]/(dashboard-layout)/pages/account/courses/_services/cloudinary-service"
        )
        const publicId = extractPublicId(content.url)
        if (publicId) {
          let resourceType: "video" | "image" | "raw" = "image"
          if (content.type === "video") resourceType = "video"
          else if (content.url.match(/\.(pdf|doc|docx|zip|rar)$/i))
            resourceType = "raw"
          await deleteFromCloudinary(publicId, resourceType)
        }
      } catch (error) {
        console.error("Failed to delete file from Cloudinary:", error)
      }
    }

    setModules(
      modules.map((m) =>
        m.id === moduleId
          ? { ...m, contents: m.contents.filter((c) => c.id !== contentId) }
          : m
      )
    )
    setDeletingLessonId(null)
  }

  const handleModalAddContent = (type: string, data: any) => {
    if (!targetModuleId) return

    const mapDataToContent = (
      id: string,
      status: "draft" | "published"
    ): CourseContent => ({
      id,
      type: type as CourseContent["type"],
      title: data.title,
      status,
      description: data.description,
      url: data.videoUrl || data.url,
      isFreePreview: data.isFreePreview,
      allowDownloads: data.allowDownloads,
      content: data.content,
      duration: data.readTime || data.duration || 0,
      thumbnailUrl: data.thumbnailUrl,
      points: data.points,
      dueDate: data.dueDate?.toISOString(),
      submissionTypes: data.submissionTypes,
      allowLate: data.allowLate,
      assignmentFileUrl: data.assignmentFileUrl,
      quizQuestions: data.quizQuestions,
      openInNewTab:
        data.openInNewTab === "new_tab" || data.openInNewTab === true,
      questions: type === "quiz" ? 0 : undefined,
    })

    if (editingContent && data.id) {
      const updated = mapDataToContent(data.id, editingContent.status)
      setModules(
        modules.map((m) =>
          m.id === targetModuleId
            ? {
                ...m,
                contents: m.contents.map((c) =>
                  c.id === data.id ? updated : c
                ),
              }
            : m
        )
      )
    } else {
      const newContent = mapDataToContent(crypto.randomUUID(), "draft")
      setModules(
        modules.map((m) =>
          m.id === targetModuleId
            ? { ...m, contents: [...m.contents, newContent] }
            : m
        )
      )
    }
  }

  const totalLessons = modules.reduce((acc, m) => acc + m.contents.length, 0)

  /**
   * Single onDragEnd router for everything in the curriculum tree.
   * Three drop semantics live here:
   *   1. type "module"  — reorder the modules list.
   *   2. type "content", same droppable — reorder a module's contents.
   *   3. type "content", different droppable — move a content item between
   *      modules; if the target is a collapsed-header zone, append to that
   *      module and auto-expand it.
   * Drops outside any droppable, or self-drops, are no-ops.
   */
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, type } = result
    if (!destination) return

    // Modules: simple in-place reorder.
    if (type === "module") {
      if (source.index === destination.index) return
      const next = Array.from(modules)
      const [moved] = next.splice(source.index, 1)
      next.splice(destination.index, 0, moved)
      setModules(next)
      return
    }

    // Content moves.
    if (type === "content") {
      const sourceModuleId = moduleIdFromContentDroppable(source.droppableId)
      if (!sourceModuleId) return

      // Drop on a collapsed module's header — append + auto-expand.
      const collapsedTargetModuleId = moduleIdFromCollapsedHeader(
        destination.droppableId
      )
      if (collapsedTargetModuleId) {
        if (collapsedTargetModuleId === sourceModuleId) return // no-op
        const sourceModule = modules.find((m) => m.id === sourceModuleId)
        if (!sourceModule) return
        const movedItem = sourceModule.contents[source.index]
        if (!movedItem) return
        setModules(
          modules.map((m) => {
            if (m.id === sourceModuleId) {
              return {
                ...m,
                contents: m.contents.filter((_, i) => i !== source.index),
              }
            }
            if (m.id === collapsedTargetModuleId) {
              return {
                ...m,
                isExpanded: true,
                contents: [...m.contents, movedItem],
              }
            }
            return m
          })
        )
        return
      }

      const destinationModuleId = moduleIdFromContentDroppable(
        destination.droppableId
      )
      if (!destinationModuleId) return

      // Same module — local reorder.
      if (sourceModuleId === destinationModuleId) {
        if (source.index === destination.index) return
        setModules(
          modules.map((m) => {
            if (m.id !== sourceModuleId) return m
            const nextContents = Array.from(m.contents)
            const [moved] = nextContents.splice(source.index, 1)
            nextContents.splice(destination.index, 0, moved)
            return { ...m, contents: nextContents }
          })
        )
        return
      }

      // Cross-module move.
      const sourceModule = modules.find((m) => m.id === sourceModuleId)
      if (!sourceModule) return
      const movedItem = sourceModule.contents[source.index]
      if (!movedItem) return
      setModules(
        modules.map((m) => {
          if (m.id === sourceModuleId) {
            return {
              ...m,
              contents: m.contents.filter((_, i) => i !== source.index),
            }
          }
          if (m.id === destinationModuleId) {
            const nextContents = Array.from(m.contents)
            nextContents.splice(destination.index, 0, movedItem)
            return { ...m, contents: nextContents }
          }
          return m
        })
      )
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <Section
        eyebrow="Structure"
        caption="A course is a sequence of modules; a module is a sequence of materials. Drag to reorder within a module, or across to move materials between modules."
      >
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {modules.length === 0
              ? "No modules yet."
              : `${modules.length} ${modules.length === 1 ? "module" : "modules"} · ${totalLessons} ${totalLessons === 1 ? "item" : "items"}`}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddModule}
          >
            <Plus className="size-4" />
            {t.addNewModule}
          </Button>
        </div>

        {modules.length === 0 ? (
          <EmptyModules onAdd={handleAddModule} />
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex flex-col">
              <SortableList
                items={modules}
                droppableId={MODULES_DROPPABLE_ID}
                type="module"
                useExternalContext
                renderItem={(module, index) => (
                  <ModuleRow
                    module={module}
                    index={index}
                    isEditing={editingModuleId === module.id}
                    editingTitle={editingTitle}
                    setEditingTitle={setEditingTitle}
                    onStartEdit={() => {
                      setEditingModuleId(module.id)
                      setEditingTitle(module.title)
                    }}
                    onSaveTitle={handleSaveModuleTitle}
                    onCancelEdit={() => {
                      setEditingModuleId(null)
                      setEditingTitle("")
                    }}
                    onDelete={() => handleDeleteModule(module.id)}
                    onToggle={() => handleToggleModule(module.id)}
                    onAddContent={() => handleOpenAddContent(module.id)}
                    onEditContent={(content) =>
                      handleEditContent(module.id, content)
                    }
                    onRemoveContent={(contentId) =>
                      removeLesson(module.id, contentId)
                    }
                    deletingLessonId={deletingLessonId}
                    editLabel={tActions?.edit || "Edit"}
                    deleteLabel={(tActions as any)?.delete || "Delete"}
                    addContentLabel={t.addContent}
                  />
                )}
              />
            </div>
          </DragDropContext>
        )}
      </Section>

      <AddContentModal
        isOpen={isAddContentModalOpen}
        onClose={() => {
          setIsAddContentModalOpen(false)
          setEditingContent(null)
        }}
        onAddContent={handleModalAddContent}
        dictionary={dictionary}
        mode={editingContent ? "edit" : "create"}
        initialData={editingContent}
      />
    </div>
  )
}

function EmptyModules({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-start gap-4 border-y border-dashed py-12">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">
          Start with a module.
        </p>
        <p className="max-w-md text-sm text-muted-foreground">
          Group your course into modules first — for example, &ldquo;Week 1:
          Setup&rdquo; or &ldquo;Module I: Foundations&rdquo;. Add lessons,
          quizzes, and assignments inside each one.
        </p>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onAdd}>
        <Plus className="size-4" />
        Add the first module
      </Button>
    </div>
  )
}

interface ModuleRowProps {
  module: CourseModule
  index: number
  isEditing: boolean
  editingTitle: string
  setEditingTitle: (s: string) => void
  onStartEdit: () => void
  onSaveTitle: () => void
  onCancelEdit: () => void
  onDelete: () => void
  onToggle: () => void
  onAddContent: () => void
  onEditContent: (c: CourseContent) => void
  onRemoveContent: (id: string) => void
  deletingLessonId: string | null
  editLabel: string
  deleteLabel: string
  addContentLabel: string
}

function ModuleRow({
  module,
  index,
  isEditing,
  editingTitle,
  setEditingTitle,
  onStartEdit,
  onSaveTitle,
  onCancelEdit,
  onDelete,
  onToggle,
  onAddContent,
  onEditContent,
  onRemoveContent,
  deletingLessonId,
  editLabel,
  deleteLabel,
  addContentLabel,
}: ModuleRowProps) {
  return (
    <Collapsible
      open={module.isExpanded}
      onOpenChange={onToggle}
      className="group/module border-b border-border last:border-b-0"
    >
      {/*
        Header row. When the module is collapsed, it doubles as a drop zone
        for content items dragged in from other modules (type="content").
        Expanded modules don't need this — their CollapsibleContent already
        renders a contents Droppable that catches the drop.
      */}
      {module.isExpanded ? (
        <ModuleHeader
          module={module}
          index={index}
          isEditing={isEditing}
          editingTitle={editingTitle}
          setEditingTitle={setEditingTitle}
          onStartEdit={onStartEdit}
          onSaveTitle={onSaveTitle}
          onCancelEdit={onCancelEdit}
          onDelete={onDelete}
          editLabel={editLabel}
          deleteLabel={deleteLabel}
          isDropTarget={false}
        />
      ) : (
        <Droppable
          droppableId={collapsedHeaderDroppableId(module.id)}
          type="content"
        >
          {(provided, snapshot) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <ModuleHeader
                module={module}
                index={index}
                isEditing={isEditing}
                editingTitle={editingTitle}
                setEditingTitle={setEditingTitle}
                onStartEdit={onStartEdit}
                onSaveTitle={onSaveTitle}
                onCancelEdit={onCancelEdit}
                onDelete={onDelete}
                editLabel={editLabel}
                deleteLabel={deleteLabel}
                isDropTarget={snapshot.isDraggingOver}
              />
              {/*
                Placeholder must be rendered for hello-pangea to track this
                droppable, but a collapsed module shows no list — wrap it so
                it has no visual footprint.
              */}
              <div className="hidden">{provided.placeholder}</div>
            </div>
          )}
        </Droppable>
      )}

      <CollapsibleContent className="pb-4">
        <div className="ms-6 flex flex-col gap-2 border-s border-border ps-5">
          {/*
            Always render the contents Droppable, even when empty, so the
            module can receive cross-module drops. The SortableList renders
            its own Droppable internally (external context mode); the empty
            shell below only applies when the module has zero items.
          */}
          {module.contents.length === 0 ? (
            <Droppable
              droppableId={contentDroppableId(module.id)}
              type="content"
            >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "flex flex-col rounded-md border border-dashed border-transparent px-3 py-3 text-xs text-muted-foreground transition-colors",
                    snapshot.isDraggingOver &&
                      "border-border bg-muted/50 text-foreground"
                  )}
                >
                  <span>
                    {snapshot.isDraggingOver
                      ? "Drop here to add to this module"
                      : "No materials yet."}
                  </span>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ) : (
            <SortableList
              items={module.contents}
              droppableId={contentDroppableId(module.id)}
              type="content"
              useExternalContext
              droppableClassName={(isDraggingOver) =>
                cn(
                  "rounded-md border border-transparent transition-colors",
                  isDraggingOver && "border-border bg-muted/40"
                )
              }
              renderItem={(content) => (
                <ContentRow
                  content={content}
                  isDeleting={deletingLessonId === content.id}
                  onEdit={() => onEditContent(content)}
                  onDelete={() => onRemoveContent(content.id)}
                />
              )}
            />
          )}
          <div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onAddContent}
              className="-ms-2 text-muted-foreground hover:text-foreground"
            >
              <Plus className="size-4" />
              {addContentLabel}
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

interface ModuleHeaderProps {
  module: CourseModule
  index: number
  isEditing: boolean
  editingTitle: string
  setEditingTitle: (s: string) => void
  onStartEdit: () => void
  onSaveTitle: () => void
  onCancelEdit: () => void
  onDelete: () => void
  editLabel: string
  deleteLabel: string
  /** Whether a content item is currently hovered over this collapsed header. */
  isDropTarget: boolean
}

function ModuleHeader({
  module,
  index,
  isEditing,
  editingTitle,
  setEditingTitle,
  onStartEdit,
  onSaveTitle,
  onCancelEdit,
  onDelete,
  editLabel,
  deleteLabel,
  isDropTarget,
}: ModuleHeaderProps) {
  return (
    <div
      className={cn(
        "relative flex items-center gap-2 py-3 transition-colors",
        // Quiet drop indicator for collapsed-header targets. A thin
        // inline-start hairline at full ink + a muted plate; no glow, no
        // shadow, per DESIGN.md flat-by-default.
        isDropTarget && "bg-muted/50"
      )}
    >
      {isDropTarget ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-1 w-[2px] rounded-full bg-foreground [inset-inline-start:-0.25rem]"
        />
      ) : null}
      <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground/60 opacity-0 transition-opacity group-hover/module:opacity-100 active:cursor-grabbing" />
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex flex-1 items-center gap-2 text-start outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {module.isExpanded ? (
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-4 shrink-0 text-muted-foreground rtl:rotate-180" />
          )}
          <span className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
          {isEditing ? (
            <Input
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={onSaveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSaveTitle()
                if (e.key === "Escape") onCancelEdit()
              }}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              className="h-8 max-w-sm"
            />
          ) : (
            <span className="truncate text-sm font-semibold text-foreground">
              {module.title}
            </span>
          )}
        </button>
      </CollapsibleTrigger>
      <span className="hidden text-xs text-muted-foreground sm:inline">
        {module.contents.length}{" "}
        {module.contents.length === 1 ? "item" : "items"}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onStartEdit}>
            <Pencil className="size-4" />
            {editLabel}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="size-4" />
            {deleteLabel}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

interface ContentRowProps {
  content: CourseContent
  isDeleting: boolean
  onEdit: () => void
  onDelete: () => void
}

function ContentRow({ content, isDeleting, onEdit, onDelete }: ContentRowProps) {
  return (
    <div
      className={cn(
        "group/row -mx-2 flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/60"
      )}
    >
      <GripVertical className="size-3.5 shrink-0 cursor-grab text-muted-foreground/50 opacity-0 transition-opacity group-hover/row:opacity-100 active:cursor-grabbing" />
      <ContentTypeGlyph type={content.type} />
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate text-sm text-foreground">
          {content.title || "Untitled"}
        </span>
        <span className="hidden text-[0.6875rem] uppercase tracking-[0.08em] text-muted-foreground sm:inline">
          {CONTENT_TYPE_LABEL[content.type]}
        </span>
        {content.status === "draft" ? (
          <span className="hidden text-[0.6875rem] uppercase tracking-[0.08em] text-muted-foreground sm:inline">
            · Draft
          </span>
        ) : null}
      </span>
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover/row:opacity-100">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={onEdit}
          aria-label="Edit"
        >
          <Pencil className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-destructive"
          onClick={onDelete}
          disabled={isDeleting}
          aria-label="Delete"
        >
          {isDeleting ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Trash2 className="size-3.5" />
          )}
        </Button>
      </div>
    </div>
  )
}
