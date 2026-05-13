import type { RevenueBySourceType } from "../types"

export const revenueBySourceData: RevenueBySourceType = {
  period: "Last year",
  summary: {
    totalRevenue: 1000000,
    percentageChange: 0.08,
  },
  sources: [
    {
      name: "Direct",
      value: 250000,
      percentage: 0.26,
      fill: "var(--chart-1)",
    },
    {
      name: "Organic Search",
      value: 320000,
      percentage: 0.33,
      fill: "var(--chart-2)",
    },
    {
      name: "Paid Ads",
      value: 180000,
      percentage: 0.19,
      fill: "var(--chart-3)",
    },
    {
      name: "Social Media",
      value: 120000,
      percentage: 0.12,
      fill: "var(--chart-4)",
    },
    {
      name: "Referrals",
      value: 82000,
      percentage: 0.08,
      fill: "var(--chart-5)",
    },
    {
      name: "Email Marketing",
      value: 48000,
      percentage: 0.05,
      fill: "var(--muted-foreground)",
    },
  ],
}
