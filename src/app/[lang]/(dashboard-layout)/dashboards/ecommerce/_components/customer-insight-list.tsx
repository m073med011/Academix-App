"use client"

import { Crown, UserCheck, UserPlus, Users } from "lucide-react"

import type { CustomerInsightsType } from "../types"

import { CustomerInsightItem } from "./customer-insight-item"

export function CustomerInsightList({ data }: { data: CustomerInsightsType }) {
  return (
    <ul className="grid grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(165px,1fr))] gap-3 md:justify-items-center">
      <CustomerInsightItem
        title="Total Customers"
        value={data.totalCustomers}
        icon={Users}
        color="var(--chart-1)"
      />
      <CustomerInsightItem
        title="New Customers"
        value={data.newCustomers}
        icon={UserPlus}
        color="var(--chart-2)"
      />
      <CustomerInsightItem
        title="Returning Customers"
        value={data.returningCustomers}
        icon={UserCheck}
        color="var(--chart-3)"
      />
      <CustomerInsightItem
        title="VIP Customers"
        value={data.vipCustomers}
        icon={Crown}
        color="var(--chart-4)"
      />
    </ul>
  )
}
