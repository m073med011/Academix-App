"use client"

import { Loader2 } from "lucide-react"

import type { DictionaryType } from "@/lib/get-dictionary"

import { DynamicTable } from "../../(design-system)/tables/_components"
import { useOrganizations } from "../_hooks/use-organizations"
import { CreateOrganizationForm } from "./create-organization-form"

interface OrganizationsViewProps {
  dictionary: DictionaryType["organizationsPage"]
  fullDictionary: DictionaryType
}

export default function OrganizationsView({
  dictionary,
  fullDictionary,
}: OrganizationsViewProps) {
  const t = dictionary
  const {
    loading,
    handleCreateSuccess,
    columns,
    filters,
    tableData,
    roleColors,
    createButton,
    dialogConfig,
    handleDeleteSelected,
  } = useOrganizations(t)

  return (
    <div>
      <DynamicTable
        isLoading={loading}
        data={tableData}
        columns={columns}
        filters={filters}
        createButton={createButton}
        showCheckbox
        colorize
        colorizeColumn="role"
        colors={roleColors}
        searchColumn="name"
        searchPlaceholder={t.list.searchPlaceholder || "Search..."}
        defaultView="table"
        title={t.list.title || "Organizations"}
        rowIdKey="id"
        dialog={dialogConfig}
        onDeleteSelected={handleDeleteSelected}
      >
        <CreateOrganizationForm
          onSuccess={handleCreateSuccess}
          onCancel={() => dialogConfig.onOpenChange(false)}
          fullDictionary={fullDictionary}
          createModal={t.createModal}
        />
      </DynamicTable>
    </div>
  )
}

