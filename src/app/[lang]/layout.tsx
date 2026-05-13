import { Inter, Tajawal } from "next/font/google"
import { getServerSession } from "next-auth"

import { i18n } from "@/configs/i18n"
import { authOptions } from "@/configs/next-auth"
import { cn } from "@/lib/utils"

import "../globals.css"

import { Providers } from "@/providers"

import type { LocaleType } from "@/types"
import type { Metadata } from "next"
import type { ReactNode } from "react"

import { Toaster as Sonner } from "@/components/ui/sonner"
import { Toaster } from "@/components/ui/toaster"

// Define metadata for the application
// More info: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
export const metadata: Metadata = {
  title: {
    template: "%s | Academix",
    default: "Academix",
  },
  description: "",
  metadataBase: new URL(process.env.BASE_URL && process.env.BASE_URL !== "undefined"
      ? process.env.BASE_URL
      : "http://localhost:3000"),
}

// Define fonts for the application
// More info: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
const interFont = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})
const tajawalFont = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-tajawal",
})

export default async function RootLayout(props: {
  children: ReactNode
  params: Promise<{ lang: string }>
}) {
  const params = (await props.params) as { lang: LocaleType }

  const { children } = props

  const session = await getServerSession(authOptions)
  const direction = i18n.localeDirection[params.lang]

  return (
    <html lang={params.lang} dir={direction} suppressHydrationWarning>
      <body
        className={cn(
          "[&:lang(en)]:font-inter [&:lang(ar)]:font-tajawal", // Set font styles based on the language
          "bg-background text-foreground antialiased overscroll-none", // Set background, text, , anti-aliasing styles, and overscroll behavior
          interFont.variable, // Include Inter font variable
          tajawalFont.variable // Include Tajawal font variable
        )}
      >
        <Providers locale={params.lang} direction={direction} session={session}>
          {children}
          <Toaster />
          <Sonner />
        </Providers>
      </body>
    </html>
  )
}
