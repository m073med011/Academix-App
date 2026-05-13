import type { Metadata } from "next"

import { ConversionFunnel } from "../../../dashboards/analytics/_components/conversion-funnel"
import { PerformanceOverTime } from "../../../dashboards/analytics/_components/performance-over-time"
// Define metadata for the page
// More info: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
export const metadata: Metadata = {
  title: "Analytics Cards",
}

export default function AnalyticsCardsPage() {
  return (
    <section className="container grid gap-4 p-4 md:grid-cols-2">
      <div className="col-span-full">
      </div>
      <PerformanceOverTime />
      <ConversionFunnel />
    </section>
  )
}
