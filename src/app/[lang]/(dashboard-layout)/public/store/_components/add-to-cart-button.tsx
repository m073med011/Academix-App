"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useCartStore } from "@/stores/cart-store"
import { usePurchasedCoursesStore } from "@/stores/purchased-courses-store"
import { Check, CheckCircle2, ShoppingCart } from "lucide-react"

import type { ComponentProps } from "react"

import { ApiClientError } from "@/lib/api-client"

import { useSettings } from "@/hooks/use-settings"
import { useAuthCheck } from "@/hooks/use-auth-check"
import { Button } from "@/components/ui/button"

interface AddToCartButtonProps extends Omit<
  ComponentProps<typeof Button>,
  "onClick"
> {
  courseId: string
}

export function AddToCartButton({
  courseId,
  className,
  variant,
  size = "default",
  ...props
}: AddToCartButtonProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { settings } = useSettings()
  const { status } = useSession()
  const { requireAuth, redirectToSignIn } = useAuthCheck()
  const addToCart = useCartStore((state) => state.addToCart)
  const removeFromCart = useCartStore((state) => state.removeFromCart)
  const isInCart = useCartStore((state) => state.isInCart)
  const isLoading = useCartStore((state) => state.isLoading)

  const isPurchased = usePurchasedCoursesStore((state) => state.isPurchased)
  const initializePurchasedCourses = usePurchasedCoursesStore(
    (state) => state.initializePurchasedCourses
  )

  const inCart = isInCart(courseId)
  const alreadyPurchased = isPurchased(courseId)

  useEffect(() => {
    if (status === "authenticated") {
      initializePurchasedCourses()
    }
  }, [status, initializePurchasedCourses])

  const handleClick = async () => {
    if (!requireAuth()) return

    try {
      if (inCart) {
        await removeFromCart(courseId)
      } else {
        await addToCart(courseId)
      }
    } catch (error) {
      // Fallback redirect if token expired during the request
      if (error instanceof ApiClientError && error.isUnauthorized()) {
        redirectToSignIn()
        return
      }
      console.error("Cart operation failed:", error)
    }
  }

  // Show "Purchased" button if user already owns the course
  if (alreadyPurchased) {
    return (
      <Button
        variant="outline"
        size={size}
        className={className}
        onClick={() => router.push("/account/profile?tab=purchased")}
        {...props}
      >
        <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
        Purchased
      </Button>
    )
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      variant={variant ?? (inCart ? "secondary" : "default")}
      size={size}
      className={className}
      {...props}
    >
      {inCart ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          In Cart
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </>
      )}
    </Button>
  )
}
