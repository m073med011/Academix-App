import { CreateOrganizationRequest } from "../../../../../types/Org_types/types"
import { Organization, OrganizationMembership } from "@/types/api"

import { apiClient } from "@/lib/api-client"

export const organizationService = {
  getUserOrganizations: async () => {
    return apiClient.get<OrganizationMembership[]>("/users/organizations")
  },

  createOrganization: async (data: CreateOrganizationRequest) => {
    return apiClient.post("/organizations", data)
  },

  getOrganizationById: async (id: string) => {
    return apiClient.get<Organization>(`/organizations/${id}`)
  },

  deleteOrganizations: async (ids: string[]) => {
    return apiClient.delete<{ successful: string[]; failed: { id: string; reason: string }[] }>(
      "/organizations",
      { body: JSON.stringify({ ids }) }
    )
  },
}
