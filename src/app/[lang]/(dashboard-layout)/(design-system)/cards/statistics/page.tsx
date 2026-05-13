import type { Metadata } from "next"

import { NewVsReturningVisitors } from "../../../dashboards/analytics/_components/new-vs-returning-visitors"
import { Overview as OverviewV3 } from "../../../dashboards/analytics/_components/overview"
// Define metadata for the page
// More info: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
export const metadata: Metadata = {
  title: "Statistics Cards",
}

export default function StatisticsCardsPage() {
  return (
    <section className="container grid gap-4 p-4 md:grid-cols-2">
      <OverviewV3 />
      <div className="col-span-full grid gap-4 md:grid-cols-4">
        <NewVsReturningVisitors />
      </div>
    </section>
  )
}
