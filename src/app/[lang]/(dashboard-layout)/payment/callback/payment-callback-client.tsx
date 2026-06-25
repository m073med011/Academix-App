"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { paymentService } from "@/app/[lang]/(dashboard-layout)/checkout/_services/payment-service"
import { useCartStore } from "@/stores/cart-store"
import { usePurchasedCoursesStore } from "@/stores/purchased-courses-store"
import { CheckCircle, Loader2, XCircle } from "lucide-react"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { LocaleType } from "@/types"
import type { Payment } from "@/types/api"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/sonner"

interface PaymentCallbackClientProps {
  dictionary: DictionaryType
  locale: LocaleType
}

export function PaymentCallbackClient({
  dictionary,
  locale,
}: PaymentCallbackClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const refreshCart = useCartStore((state) => state.refreshCart)
  const refreshPurchasedCourses = usePurchasedCoursesStore(
    (state) => state.refreshPurchasedCourses
  )
  const t = dictionary.paymentCallbackPage

  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading"
  )
  const [paymentDetails, setPaymentDetails] = useState<Payment | null>(null)

  const paymentId = searchParams.get("paymentId")
  const paymentStatus = searchParams.get("status")
  const paymobSuccess = searchParams.get("success")
  const paymobPending = searchParams.get("pending")

  useEffect(() => {
    const verifyPayment = async () => {
      if (!paymentId) {
        setStatus("failed")
        toast.error({ key: "toast.payment.invalidInformation", dictionary })
        return
      }

      try {
        // Check if Paymob callback indicates success (ONLY check the 'success' parameter)
        const isPaymobSuccess = paymobSuccess === "true"
        const isPaymobPending = paymobPending === "true"

        // Check for explicit failure from Paymob
        const errorOccurred = searchParams.get("error_occured") === "true"

        // If payment explicitly failed, show error immediately
        if (paymobSuccess === "false" || errorOccurred) {
          setStatus("failed")
          const errorMessage =
            searchParams.get("data.message") || dictionary
              ? { key: "toast.payment.failed", dictionary }
              : "Payment failed"
          toast.error(
            typeof errorMessage === "string" ? errorMessage : errorMessage
          )
          return
        }

        if (isPaymobSuccess && !isPaymobPending) {
          // Payment was successful according to Paymob callback
          // Wait a bit for webhook to process
          await new Promise((resolve) => setTimeout(resolve, 2000))

          // Try to get payment details (webhook might have updated it)
          try {
            const payment = await paymentService.getPayment(paymentId)
            setPaymentDetails(payment)

            if (payment.status === "success") {
              setStatus("success")
              toast.success({ key: "toast.payment.successful", dictionary })

              // Refresh cart to remove purchased items and update purchased courses
              await refreshCart()
              await refreshPurchasedCourses()

              // Redirect to purchased courses after 3 seconds
              setTimeout(() => {
                router.push(`/${locale}/account/profile?tab=purchased`)
              }, 3000)
              return
            }

            // If still pending, manually verify and complete payment
            if (payment.status === "pending") {
              console.log("Payment still pending, manually verifying...")
              try {
                const verifiedPayment =
                  await paymentService.manuallyVerifyPayment(paymentId)
                setPaymentDetails(verifiedPayment)

                if (verifiedPayment.status === "success") {
                  setStatus("success")
                  toast.success({ key: "toast.payment.successful", dictionary })

                  // Refresh cart to remove purchased items and update purchased courses
                  await refreshCart()
                  await refreshPurchasedCourses()

                  setTimeout(() => {
                    router.push(
                      `/${locale}/account/profile?tab=purchased`
                    )
                  }, 3000)
                  return
                }
              } catch (verifyError) {
                console.error("Manual verification failed:", verifyError)
              }

              // Paymob confirmed success but our backend hasn't processed yet
              // Trust Paymob and show success - webhook will complete enrollment
              setStatus("success")
              toast.success({ key: "toast.payment.successful", dictionary })

              // Refresh cart and purchased courses
              await refreshCart()
              await refreshPurchasedCourses()

              setTimeout(() => {
                router.push(`/${locale}/account/profile?tab=purchased`)
              }, 3000)
              return
            }

            // If payment has unexpected status but Paymob says success, trust Paymob
            // This can happen if webhook updated with different status
            console.log(
              "Unexpected payment status:",
              payment.status,
              "but Paymob confirmed success"
            )
            setStatus("success")
            toast.success({ key: "toast.payment.successful", dictionary })

            await refreshCart()
            await refreshPurchasedCourses()

            setTimeout(() => {
              router.push(`/${locale}/account/profile?tab=purchased`)
            }, 3000)
            return
          } catch (error) {
            // Error fetching payment details but Paymob confirmed success
            // Trust Paymob's response - payment was successful
            console.error(
              "Error fetching payment, but Paymob confirmed success:",
              error
            )
            setStatus("success")
            toast.success({ key: "toast.payment.successful", dictionary })

            // Refresh cart and purchased courses
            await refreshCart()
            await refreshPurchasedCourses()

            setTimeout(() => {
              router.push(`/${locale}/account/profile?tab=purchased`)
            }, 3000)
            return
          }
        }

        // Get payment details
        const payment = await paymentService.getPayment(paymentId)
        setPaymentDetails(payment)

        if (payment.status === "success") {
          setStatus("success")
          toast.success({ key: "toast.payment.successful", dictionary })

          // Refresh cart to remove purchased items and update purchased courses
          await refreshCart()
          await refreshPurchasedCourses()

          // Redirect to purchased courses after 3 seconds
          setTimeout(() => {
            router.push(`/${locale}/account/profile?tab=purchased`)
          }, 3000)
        } else if (payment.status === "pending") {
          // Still processing - retry up to 5 times
          const retryCount = parseInt(
            sessionStorage.getItem("paymentRetryCount") || "0"
          )
          if (retryCount < 5) {
            sessionStorage.setItem("paymentRetryCount", String(retryCount + 1))
            setStatus("loading")
            setTimeout(() => verifyPayment(), 3000)
          } else {
            // Give up after 5 retries, assume webhook failed
            sessionStorage.removeItem("paymentRetryCount")
            if (isPaymobSuccess) {
              setStatus("success")
              toast.success({ key: "toast.payment.processed", dictionary })

              // Refresh cart to remove purchased items and update purchased courses
              await refreshCart()
              await refreshPurchasedCourses()

              setTimeout(
                () =>
                  router.push(`/${locale}/account/profile?tab=purchased`),
                3000
              )
            } else {
              setStatus("failed")
              toast.error({
                key: "toast.payment.verificationTimeout",
                dictionary,
              })
            }
          }
        } else {
          setStatus("failed")
          toast.error({ key: "toast.payment.failed", dictionary })
        }
      } catch (error) {
        console.error("Payment verification error:", error)
        setStatus("failed")
        toast.error({ key: "toast.payment.verificationFailed", dictionary })
      }
    }

    verifyPayment()
  }, [
    paymentId,
    paymentStatus,
    paymobSuccess,
    paymobPending,
    router,
    refreshCart,
    refreshPurchasedCourses,
    dictionary,
    locale,
    searchParams,
  ])

  return (
    <div className="container flex items-center justify-center min-h-[60vh]">
      <Card className="p-8 max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">{t.loading.title}</h2>
            <p className="text-muted-foreground">{t.loading.description}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {t.loading.note}
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-bold mb-2 text-green-600">
              {t.success.title}
            </h2>
            <p className="text-muted-foreground mb-4">
              {t.success.description}
            </p>
            {paymentDetails && (
              <div className="text-sm text-muted-foreground mb-6 space-y-1">
                <p>
                  {t.success.paymentId}: {paymentDetails._id}
                </p>
                {(paymentDetails.discountAmount || 0) > 0 && (
                  <>
                    <p>
                      {t.success.originalAmount}: EGP{" "}
                      {paymentDetails.originalAmount}
                    </p>
                    <div className="flex justify-between text-green-600">
                      <span>{t.success.discount}</span>
                      <span>
                        -EGP {(paymentDetails.discountAmount || 0).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
                <p>
                  {t.success.amountPaid}: EGP {paymentDetails.amount}
                </p>
                <p>
                  {t.success.courses}: {paymentDetails.courseIds?.length || 0}
                </p>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Button
                onClick={() =>
                  router.push(`/${locale}/account/profile?tab=purchased`)
                }
              >
                {t.success.viewMyCourses}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/${locale}/public/store`)}
              >
                {t.success.browseMoreCourses}
              </Button>
            </div>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-2 text-red-600">
              {t.failed.title}
            </h2>
            <p className="text-muted-foreground mb-6">{t.failed.description}</p>
            {paymentDetails && (
              <div className="text-sm text-muted-foreground mb-6">
                <p>
                  {t.failed.paymentId}: {paymentDetails._id}
                </p>
                <p>
                  {t.failed.status}: {paymentDetails.status}
                </p>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Button onClick={() => router.push(`/${locale}/checkout`)}>
                {t.failed.returnToCheckout}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/${locale}/cart`)}
              >
                {t.failed.viewCart}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
