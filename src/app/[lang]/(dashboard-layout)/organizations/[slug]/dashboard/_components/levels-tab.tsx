"use client"

import { useEffect, useState } from "react"
import { Plus, Pencil, Trash } from "lucide-react"
import { toast } from "sonner"

import { DynamicTable } from "../../../../(design-system)/tables/_components"
import type { DynamicColumn } from "../../../../(design-system)/tables/_components/types"
import { organizationService, type Level } from "../../../_services/organization.service"
import { LevelModal } from "./level-modal"

function unwrap<T>(res: any): T[] {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  return []
}

export function LevelsTab({ organizationId }: { organizationId: string }) {
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null)

  const fetchLevels = async () => {
    setLoading(true)
    try {
      const res = await organizationService.getLevels(organizationId)
      setLevels(unwrap<Level>(res))
    } catch (error) {
      console.error(error)
      toast.error("Failed to load levels.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLevels()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId])

  const handleDelete = async (level: Level) => {
    if (!window.confirm(`Are you sure you want to delete level "${level.name}"?`)) return
    try {
      setLoading(true)
      await organizationService.deleteLevel(level._id)
      toast.success("Level deleted successfully.")
      fetchLevels()
    } catch (error) {
      console.error(error)
      toast.error("Failed to delete level.")
      setLoading(false)
    }
  }

  const columns: DynamicColumn<Level>[] = [
    { key: "name", label: "Name" },
    { key: "description", label: "Description", placeholder: "—" },
    { key: "order", label: "Order", align: "center" },
    {
      key: "terms",
      label: "Terms",
      align: "center",
      render: (val) => (Array.isArray(val) ? val.length : 0),
    },
  ]

  const actions = [
    {
      label: "Edit",
      icon: Pencil,
      onClick: (row: Level) => {
        setSelectedLevel(row)
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
    <>
      <DynamicTable
        data={levels as unknown as Record<string, unknown>[]}
        columns={columns as unknown as DynamicColumn<Record<string, unknown>>[]}
        title="Levels List"
        searchable
        searchColumn="name"
        searchPlaceholder="Search levels..."
        noResultsMessage="No levels found."
        isLoading={loading}
        actions={actions as any}
        createButton={{
          label: "Add Level",
          icon: Plus,
          onClick: () => {
            setSelectedLevel(null)
            setIsModalOpen(true)
          },
        }}
      />

      <LevelModal
        organizationId={organizationId}
        level={selectedLevel}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedLevel(null)
        }}
        onSuccess={fetchLevels}
      />
    </>
  )
}
