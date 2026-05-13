"use client"

import { Plus, Search } from "lucide-react"

import { useRole } from "@/hooks/use-role"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface OrganizationsHeaderProps {
  dictionary: {
    title: string
    searchPlaceholder: string
    createOrganization: string
    myOrganizations: string
    publicOrganizations: string
  }
  searchQuery: string
  setSearchQuery: (query: string) => void
  onCreateClick: () => void
}

export function OrganizationsHeader({
  dictionary,
  searchQuery,
  setSearchQuery,
  onCreateClick,
}: OrganizationsHeaderProps) {
  const { isRole } = useRole()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          {dictionary.title}
        </h2>
        {isRole("organizer") && (
          <Button onClick={onCreateClick}>
            <Plus className="mr-2 h-4 w-4" /> {dictionary.createOrganization}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            name="organizations-search"
            // autoComplete="off"
            placeholder={dictionary.searchPlaceholder}
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">{dictionary.myOrganizations}</Button>
          <Button variant="ghost">{dictionary.publicOrganizations}</Button>
        </div>
      </div>
    </div>
  )
}
