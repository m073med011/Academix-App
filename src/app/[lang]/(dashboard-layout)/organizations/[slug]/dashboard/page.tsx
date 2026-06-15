import { Suspense } from "react"
import { DashboardView } from "./_components/dashboard-view"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function OrganizationDashboardPage({
  params,
}: {
  params: Promise<{ slug: string; lang: string }>
}) {
  const { slug, lang } = await params

  return (
    <div className="container py-8 lg:py-12 space-y-8">
      {/* back btn */}
      <Button
        variant="outline"
        size="sm"
        className="w-fit"
        asChild
      >
        <Link href={`/${lang}/organizations`}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </Button>
      <Suspense fallback={<div>Loading dashboard...</div>}>
        <DashboardView slug={slug} />
      </Suspense>
    </div>
  )
}
