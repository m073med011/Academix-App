import { Suspense } from "react"
import { DashboardView } from "./_components/dashboard-view"

export default async function OrganizationDashboardPage({
  params,
}: {
  params: Promise<{ slug: string; lang: string }>
}) {
  const { slug, lang } = await params

  return (
    <div className="container h-full w-full p-4 md:p-6 lg:p-8">
      <Suspense fallback={<div>Loading dashboard...</div>}>
        <DashboardView slug={slug} />
      </Suspense>
    </div>
  )
}
