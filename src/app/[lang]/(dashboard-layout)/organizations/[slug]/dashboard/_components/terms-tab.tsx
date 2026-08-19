"use client"

import { useEffect, useState } from "react"
import { Plus, Pencil, Trash } from "lucide-react"
import { toast } from "sonner"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DynamicTable } from "../../../../(design-system)/tables/_components"
import type { DynamicColumn } from "../../../../(design-system)/tables/_components/types"
import { organizationService, type Level, type Term } from "../../../_services/organization.service"
import { TermModal } from "./term-modal"

function unwrap<T>(res: any): T[] {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  return []
}

export function TermsTab({ organizationId }: { organizationId: string }) {
  const [levels, setLevels] = useState<Level[]>([])
  const [loadingLevels, setLoadingLevels] = useState(false)
  const [selectedLevelId, setSelectedLevelId] = useState<string>("")

  const [terms, setTerms] = useState<Term[]>([])
  const [loadingTerms, setLoadingTerms] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null)

  // Load levels for the selector
  useEffect(() => {
    setLoadingLevels(true)
    organizationService
      .getLevels(organizationId)
      .then((res) => {
        const list = unwrap<Level>(res)
        setLevels(list)
        if (list.length > 0) setSelectedLevelId((prev) => prev || list[0]._id)
      })
      .catch((error) => {
        console.error(error)
        toast.error("Failed to load levels.")
      })
      .finally(() => setLoadingLevels(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId])

  const fetchTerms = async (levelId: string) => {
    if (!levelId) {
      setTerms([])
      return
    }
    setLoadingTerms(true)
    try {
      const res = await organizationService.getTerms(levelId)
      setTerms(unwrap<Term>(res))
    } catch (error) {
      console.error(error)
      toast.error("Failed to load terms.")
    } finally {
      setLoadingTerms(false)
    }
  }

  useEffect(() => {
    fetchTerms(selectedLevelId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLevelId])

  const handleDelete = async (term: Term) => {
    if (!window.confirm(`Are you sure you want to delete term "${term.name}"?`)) return
    try {
      setLoadingTerms(true)
      await organizationService.deleteTerm(selectedLevelId, term._id)
      toast.success("Term deleted successfully.")
      fetchTerms(selectedLevelId)
    } catch (error) {
      console.error(error)
      toast.error("Failed to delete term.")
      setLoadingTerms(false)
    }
  }

  const columns: DynamicColumn<Term>[] = [
    { key: "name", label: "Name" },
    { key: "description", label: "Description", placeholder: "—" },
    { key: "startDate", label: "Start Date", component: "date" },
    { key: "endDate", label: "End Date", component: "date" },
  ]

  const actions = [
    {
      label: "Edit",
      icon: Pencil,
      onClick: (row: Term) => {
        setSelectedTerm(row)
        setIsModalOpen(true)
      },
    },
    {
      label: "Delete",
      icon: Trash,
      variant: "destructive" as const,
      onClick: handleDelete,
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 max-w-xs">
        <Label htmlFor="level-select">Level</Label>
        <Select
          value={selectedLevelId}
          onValueChange={setSelectedLevelId}
          disabled={loadingLevels || levels.length === 0}
        >
          <SelectTrigger id="level-select">
            <SelectValue placeholder={loadingLevels ? "Loading levels..." : "Select a level"} />
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

      {levels.length === 0 && !loadingLevels ? (
        <div className="py-8 text-center text-muted-foreground border rounded-md">
          No levels yet. Create a level first to manage its terms.
        </div>
      ) : (
        <DynamicTable
          data={terms as unknown as Record<string, unknown>[]}
          columns={columns as unknown as DynamicColumn<Record<string, unknown>>[]}
          title="Terms List"
          searchable
          searchColumn="name"
          searchPlaceholder="Search terms..."
          noResultsMessage="No terms found for this level."
          isLoading={loadingTerms}
          actions={actions as any}
          createButton={{
            label: "Add Term",
            icon: Plus,
            disabled: !selectedLevelId,
            onClick: () => {
              setSelectedTerm(null)
              setIsModalOpen(true)
            },
          }}
        />
      )}

      <TermModal
        levelId={selectedLevelId}
        term={selectedTerm}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedTerm(null)
        }}
        onSuccess={() => fetchTerms(selectedLevelId)}
      />
    </div>
  )
}
