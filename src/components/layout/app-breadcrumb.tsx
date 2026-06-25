"use client"

import { Fragment, useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMedia } from "react-use"

import { NavigationNestedItem, NavigationRootItem } from "@/types"

import { navigationsData } from "@/data/navigations"

import { DictionaryType } from "@/lib/get-dictionary"
import { organizationService } from "@/app/[lang]/(dashboard-layout)/organizations/_services/organization.service"
import { courseService } from "@/app/[lang]/(dashboard-layout)/account/courses/_services/course-service"

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const ITEMS_TO_DISPLAY = 3

export function AppBreadcrumb({ dictionary }: { dictionary?: DictionaryType }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const isDesktop = useMedia("(min-width: 768px)")
  const [dynamicLabels, setDynamicLabels] = useState<Record<string, string>>({})

  // Create a Set of all valid hrefs from navigationsData for efficient lookup
  const validHrefs = useMemo(() => {
    const hrefs = new Set<string>()

    const traverse = (items: (NavigationRootItem | NavigationNestedItem)[]) => {
      items.forEach((item) => {
        if ("href" in item && item.href) {
          hrefs.add(item.href)
        }
        if (item.items) {
          traverse(item.items)
        }
      })
    }

    traverse(navigationsData)
    return hrefs
  }, [])

  // Split pathname into segments and filter out empty strings
  const segments = pathname.split("/").filter((segment) => segment !== "")

  // Assume first segment is locale and remove it for display, but keep for link construction
  const locale = segments[0]
  const pathSegments = segments.slice(1)

  useEffect(() => {
    const fetchLabels = async () => {
      const newLabels: Record<string, string> = {}
      for (let i = 0; i < pathSegments.length; i++) {
        const segment = pathSegments[i]
        if (/^[a-f\d]{24}$/i.test(segment) && !dynamicLabels[segment]) {
          const prevSegment = i > 0 ? pathSegments[i - 1] : null
          if (prevSegment === "organizations") {
            try {
              const res = await organizationService.getOrganizationById(segment)
              if (res.success && res.data?.name) {
                newLabels[segment] = res.data.name
              }
            } catch (error) {
              console.error("Failed to fetch organization name for breadcrumb:", error)
            }
          } else if (prevSegment === "course") {
            try {
              const course = await courseService.getCourse(segment)
              if (course && course.title) {
                newLabels[segment] = course.title
              }
            } catch (error) {
              console.error("Failed to fetch course name for breadcrumb:", error)
            }
          }
        }
      }
      if (Object.keys(newLabels).length > 0) {
        setDynamicLabels((prev) => ({ ...prev, ...newLabels }))
      }
    }
    fetchLabels()
  }, [pathname])

  if (pathSegments.length === 0) return null

  const items = pathSegments.map((segment, index) => {
    // Construct href: /locale/segment1/segment2...
    // The raw href (without locale) is needed for validation against navigationsData
    const rawHref = `/${pathSegments.slice(0, index + 1).join("/")}`
    const href = `/${locale}${rawHref}`

    // Try to find translation in dictionary, fallback to capitalized segment
    // We check common dictionary sections for the segment key
    let label = dynamicLabels[segment] ||
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")

    if (dictionary) {
      // Check navigation dictionary first
      if (
        dictionary.navigation &&
        dictionary.navigation[segment as keyof typeof dictionary.navigation]
      ) {
        const navLabel =
          dictionary.navigation[segment as keyof typeof dictionary.navigation]
        if (typeof navLabel === "string") {
          label = navLabel
        }
      }
      // Check other sections if needed, e.g. storePage, profilePage
      // This can be expanded based on requirements
    }

    // Check if the raw href exists in our valid hrefs set
    const isClickable = validHrefs.has(rawHref)

    return { href, label, isClickable }
  })

  const t = (dictionary?.ui?.breadcrumb as any) || {
    home: "Home",
    navigateTo: "Navigate to",
    selectPage: "Select a page to navigate to.",
    close: "Close",
    more: "More",
    toggleMenu: "Toggle menu",
    breadcrumb: "Breadcrumb",
  }

  // Prepend Home item
  const homeItem = {
    href: `/${locale}/dashboards/analytics`,
    label: t.home,
    isClickable: true,
  }

  // Add home item to the beginning
  items.unshift(homeItem)

  // Filter out unclickable items, but ALWAYS keep the last item (current page)
  const filteredItems = items.filter((item, index) => {
    // Always keep the last item
    if (index === items.length - 1) return true
    // Keep clickable items
    return item.isClickable
  })

  return (
    <Breadcrumb className="hidden md:flex" aria-label={t.breadcrumb}>
      <BreadcrumbList>
        {filteredItems.length > ITEMS_TO_DISPLAY ? (
          <>
            <BreadcrumbItem>
              {filteredItems[0].isClickable ? (
                <BreadcrumbLink href={filteredItems[0].href}>
                  {filteredItems[0].label}
                </BreadcrumbLink>
              ) : (
                <span className="font-medium text-muted-foreground">
                  {filteredItems[0].label}
                </span>
              )}
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {isDesktop ? (
                <DropdownMenu open={open} onOpenChange={setOpen}>
                  <DropdownMenuTrigger
                    className="flex items-center gap-1"
                    aria-label={t.toggleMenu}
                  >
                    <BreadcrumbEllipsis
                      className="h-4 w-4"
                      aria-label={t.more}
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {filteredItems.slice(1, -2).map((item, index) => (
                      <DropdownMenuItem
                        key={index}
                        disabled={!item.isClickable}
                      >
                        {item.isClickable ? (
                          <Link href={item.href ? item.href : "#"}>
                            {item.label}
                          </Link>
                        ) : (
                          <span>{item.label}</span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Drawer open={open} onOpenChange={setOpen}>
                  <DrawerTrigger aria-label={t.toggleMenu}>
                    <BreadcrumbEllipsis
                      className="h-4 w-4"
                      aria-label={t.more}
                    />
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader className="text-left">
                      <DrawerTitle>{t.navigateTo}</DrawerTitle>
                      <DrawerDescription>{t.selectPage}</DrawerDescription>
                    </DrawerHeader>
                    <div className="grid gap-1 px-4">
                      {filteredItems.slice(1, -2).map((item, index) =>
                        item.isClickable ? (
                          <Link
                            key={index}
                            href={item.href ? item.href : "#"}
                            className="py-1 text-sm"
                          >
                            {item.label}
                          </Link>
                        ) : (
                          <span
                            key={index}
                            className="py-1 text-sm text-muted-foreground"
                          >
                            {item.label}
                          </span>
                        )
                      )}
                    </div>
                    <DrawerFooter className="pt-4">
                      <DrawerClose asChild>
                        <Button variant="outline">{t.close}</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              )}
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        ) : null}

        {filteredItems
          .slice(
            filteredItems.length > ITEMS_TO_DISPLAY ? -ITEMS_TO_DISPLAY + 1 : 0
          )
          .map((item, index) => {
            const isLast =
              index ===
              filteredItems.slice(
                filteredItems.length > ITEMS_TO_DISPLAY
                  ? -ITEMS_TO_DISPLAY + 1
                  : 0
              ).length -
                1
            return (
              <Fragment key={index}>
                <BreadcrumbItem>
                  {!isLast ? (
                    <>
                      {item.isClickable ? (
                        <BreadcrumbLink
                          className="max-w-20 truncate md:max-w-none"
                          href={item.href}
                        >
                          {item.label}
                        </BreadcrumbLink>
                      ) : (
                        <span className="max-w-20 truncate md:max-w-none font-medium text-muted-foreground">
                          {item.label}
                        </span>
                      )}
                    </>
                  ) : (
                    <BreadcrumbPage className="max-w-20 truncate md:max-w-none">
                      {item.label}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </Fragment>
            )
          })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
