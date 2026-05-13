import type { Metadata } from "next"

import { EngagementByDevice } from "../../../dashboards/analytics/_components/engagement-by-device"
import { VisitorsByCountry } from "../../../dashboards/analytics/_components/visitors-by-country"
// Define metadata for the page
// More info: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
export const metadata: Metadata = {
  title: "Advanced Cards",
}

export default function AdvancedCardsPage() {
  return (
    <section className="container grid gap-4 p-4 md:grid-cols-2">
      <VisitorsByCountry />
      <EngagementByDevice />
    </section>
  )
}
