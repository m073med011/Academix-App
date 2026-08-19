"use client"

import { useState } from "react"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useCartStore } from "@/stores/cart-store"
import { usePurchasedCoursesStore } from "@/stores/purchased-courses-store"
import { useSession } from "next-auth/react"
import {
  CheckCircle,
  Download,
  FileText,
  Globe,
  Heart,
  Play,
  Share2,
  ShoppingCart,
  Smartphone,
  Trophy,
  Video,
} from "lucide-react"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { LocaleType } from "@/types"
import type { Course } from "@/types/api"

import { ensureLocalizedPathname } from "@/lib/i18n"
import { useAuthCheck } from "@/hooks/use-auth-check"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/sonner"

interface CoursePurchaseCardProps {
  dictionary: DictionaryType
  locale: LocaleType
  course: Course
  isLoadingStores: boolean
}

export function CoursePurchaseCard({
  dictionary,
  locale,
  course,
  isLoadingStores,
}: CoursePurchaseCardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const t = dictionary.courseDetailsPage?.purchaseCard
  const { requireAuth } = useAuthCheck()

  // Cart and purchased courses state
  const addToCart = useCartStore((state) => state.addToCart)
  const cart = useCartStore((state) => state.cart)
  const purchasedCourses = usePurchasedCoursesStore((state) => state.courses)
  const { data: session } = useSession()

  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  // Check if course is already purchased or in cart
  const courseAlreadyPurchased = purchasedCourses.some(
    (c) => c._id === course._id
  )
  const courseInCart =
    cart?.items.some((item) => {
      if (!item.courseId) return false
      return typeof item.courseId === "string"
        ? item.courseId === course._id
        : item.courseId._id === course._id
    }) ?? false

  const handleAddToCart = async () => {
    if (!requireAuth()) return

    try {
      await addToCart(course._id)
    } catch (_error) {
      toast.error({ key: "toast.course.failedToAdd", dictionary })
    }
  }

  const handleEnrollNow = async () => {
    if (!requireAuth()) return

    try {
      await addToCart(course._id)
      router.push(ensureLocalizedPathname("/checkout", locale))
    } catch (_error) {
      toast.error({ key: "toast.course.failedToAdd", dictionary })
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: course.title,
          text: course.description,
          url: window.location.href,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success(dictionary.toast.course.linkCopied, {
        description: dictionary.toast.course.linkCopiedDesc,
      })
    }
  }

  const handleToggleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    toast.success(
      isWishlisted
        ? dictionary.toast.course.removedFromWishlist
        : dictionary.toast.course.addedToWishlist,
      {
        description: isWishlisted
          ? dictionary.toast.course.wishlistDescRemoved.replace(
            "{title}",
            course.title
          )
          : dictionary.toast.course.wishlistDescAdded.replace(
            "{title}",
            course.title
          ),
      }
    )
  }

  return (
    <div className="sticky top-24 space-y-4">
      <Card className="overflow-hidden">
        {/* Video Preview */}
        <div className="relative aspect-video bg-muted">
          {isPlaying && course.promoVideoUrl ? (
            <video
              src={course.promoVideoUrl}
              poster={course.thumbnailUrl}
              controls
              autoPlay
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            <>
              {course.thumbnailUrl ? (
                <Image
                  src={course.thumbnailUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/20 to-primary/10">
                  <Play className="h-16 w-16 text-primary/50" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Button
                  variant="secondary"
                  size="lg"
                  className="gap-2"
                  onClick={() => {
                    if (course.promoVideoUrl) {
                      setIsPlaying(true)
                    } else {
                      toast.info(dictionary.toast.course.previewNotAvailable, {
                        description:
                          dictionary.toast.course.previewNotAvailableDesc,
                      })
                    }
                  }}
                >
                  <Play className="h-5 w-5" />
                  {t?.previewCourse || "Preview Course"}
                </Button>
              </div>
            </>
          )}
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">
              ${course.price.toFixed(2)}
            </span>
            {course.price > 99 && (
              <span className="text-lg text-muted-foreground line-through">
                ${(course.price * 1.5).toFixed(2)}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {(session?.user as any)?.id ===
              (typeof course.instructor === "string"
                ? course.instructor
                : course.instructor?._id) ? (
              <div className="flex items-center justify-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  This is your course
                </span>
              </div>
            ) : courseAlreadyPurchased ? (
              <>
                <div className="flex items-center justify-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    {t?.youOwnCourse || "You own this course"}
                  </span>
                </div>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() =>
                    router.push(
                      ensureLocalizedPathname(
                        "/account/profile?tab=purchased",
                        locale
                      )
                    )
                  }
                >
                  {t?.goToCourse || "Go to Course"}
                </Button>
              </>
            ) : courseInCart ? (
              <>
                <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {t?.alreadyInCart || "Already in your cart"}
                  </span>
                </div>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() =>
                    router.push(ensureLocalizedPathname("/cart", locale))
                  }
                >
                  {t?.goToCart || "Go to Cart"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    router.push(ensureLocalizedPathname("/checkout", locale))
                  }
                >
                  {t?.checkoutNow || "Checkout Now"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleEnrollNow}
                  disabled={isLoadingStores}
                >
                  {t?.enrollNow || "Enroll Now"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleAddToCart}
                  disabled={isLoadingStores}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {t?.addToCart || "Add to Cart"}
                </Button>
              </>
            )}
          </div>

          {!courseAlreadyPurchased && (
            <p className="text-xs text-center text-muted-foreground">
              {t?.moneyBackGuarantee || "30-Day Money-Back Guarantee"}
            </p>
          )}

          <Separator />

          {/* Course Includes */}
          <div className="space-y-3">
            <h4 className="font-semibold">
              {t?.courseIncludes || "This course includes:"}
            </h4>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-3">
                <Video className="h-4 w-4 text-muted-foreground" />
                <span>
                  {course.duration} {t?.hoursVideo || "hours on-demand video"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>
                  {course.materials?.length || 0}{" "}
                  {t?.articlesResources || "articles & resources"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Download className="h-4 w-4 text-muted-foreground" />
                <span>
                  {t?.downloadableResources || "Downloadable resources"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span>{t?.lifetimeAccess || "Full lifetime access"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <span>{t?.mobileAccess || "Access on mobile and TV"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Trophy className="h-4 w-4 text-muted-foreground" />
                <span>{t?.certificate || "Certificate of completion"}</span>
              </div>
            </div>
          </div>

          {/* Share and Wishlist */}
          <div className="flex justify-center gap-4 pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
              {t?.share || "Share"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 ${isWishlisted ? "text-red-500" : ""}`}
              onClick={handleToggleWishlist}
            >
              <Heart
                className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`}
              />
              {isWishlisted
                ? t?.wishlisted || "Wishlisted"
                : t?.addToWishlist || "Add to Wishlist"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
