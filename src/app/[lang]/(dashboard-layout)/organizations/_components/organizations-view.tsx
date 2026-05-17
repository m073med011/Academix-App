"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

import type { DictionaryType } from "@/lib/get-dictionary"
import { Organization, OrganizationMembership } from "@/types/api"

import { organizationService } from "../_services/organization.service"
import { CreateOrganizationModal } from "./createorganization-modal"
import { OrganizationCard } from "./organization-card"
import { OrganizationsHeader } from "./organizations-header"
import { OrganizationsSkeleton } from "./organizations-skeleton"

interface OrganizationsViewProps {
  dictionary: DictionaryType["organizationsPage"]
  fullDictionary: DictionaryType
}

export default function OrganizationsView({
  dictionary,
  fullDictionary,
}: OrganizationsViewProps) {
  const [memberships, setMemberships] = useState<OrganizationMembership[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefetching, setIsRefetching] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const fetchOrganizations = async (isBackground = false) => {
    try {
      if (isBackground) {
        setIsRefetching(true)
      } else {
        setLoading(true)
      }
      const response = await organizationService.getUserOrganizations()

      if (response.success) {
        const data = response.data
        setMemberships(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Failed to fetch organizations:", error)
    } finally {
      setLoading(false)
      setIsRefetching(false)
    }
  }

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const handleCreateSuccess = () => {
    setTimeout(() => fetchOrganizations(true), 800)
  }

  const validMemberships = memberships.filter(
    (m) => m.organizationId !== null && typeof m.organizationId === "object"
  )

  const filteredMemberships = validMemberships.filter((membership) => {
    const org = membership.organizationId as Organization
    return org?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false
  })

  return (
    <div className="container py-8 lg:py-12 space-y-8">
      <OrganizationsHeader
        dictionary={dictionary.list}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

      {loading ? (
        <OrganizationsSkeleton />
      ) : (
        <>
          {isRefetching && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Refreshing...</span>
            </div>
          )}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMemberships.map((membership) => (
              <OrganizationCard
                key={membership._id}
                membership={membership}
                dictionary={dictionary.list}
              />
            ))}
          </div>
        </>
      )}

      <CreateOrganizationModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleCreateSuccess}
        fullDictionary={fullDictionary}
        createModal={dictionary.createModal}
      />
    </div>
  )
}
