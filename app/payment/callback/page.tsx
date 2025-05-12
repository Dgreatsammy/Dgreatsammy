"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Sparkles, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function PaymentCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState<string>("Verifying your payment...")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const callbackId = searchParams.get("id")
  const transactionId =
    searchParams.get("transaction_id") || searchParams.get("tx_ref") || searchParams.get("reference")

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (!callbackId) {
          setStatus("error")
          setMessage("Payment information not found. Please contact support.")
          return
        }

        // First, get the payment intent from the database using the callback ID
        const getPaymentResponse = await fetch(`/api/payments/callback?callbackId=${callbackId}`)
        const paymentData = await getPaymentResponse.json()

        if (!paymentData.success || !paymentData.paymentIntent) {
          setStatus("error")
          setMessage("Payment information not found. Please contact support.")
          return
        }

        // Now verify the payment
        const verifyResponse = await fetch("/api/payments/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentId: paymentData.paymentIntent.id,
            providerName: paymentData.paymentIntent.provider,
            transactionId,
          }),
        })

        const verifyData = await verifyResponse.json()

        if (verifyData.verified) {
          setStatus("success")
          setMessage("Payment successful! Your subscription has been activated.")
        } else if (verifyData.status === "canceled") {
          setStatus("error")
          setMessage("Payment was canceled. Please try again.")
        } else {
          setStatus("error")
          setMessage("Payment verification failed. Please contact support.")
        }
      } catch (error) {
        console.error("Error verifying payment:", error)
        setStatus("error")
        setMessage("An error occurred while verifying your payment. Please contact support.")
      }
    }

    verifyPayment()
  }, [callbackId, transactionId, toast])

  return (
    <div className="min-h-screen bg-festive-cream flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-festive-pink" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-festive-purple to-festive-pink bg-clip-text text-transparent">
              BIRTHDAY BLISS BUDDIES
            </h1>
            <Sparkles className="h-6 w-6 text-festive-purple" />
          </div>
          <p className="text-gray-600">Payment Verification</p>
        </div>

        <Card className="border-festive-purple/20">
          <CardContent className="pt-6 pb-6 text-center">
            {status === "loading" && (
              <>
                <Loader2 className="h-12 w-12 text-festive-purple mx-auto mb-4 animate-spin" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Processing Payment</h2>
                <p className="text-gray-600 mb-6">{message}</p>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <Button
                  onClick={() => router.push("/")}
                  className="bg-gradient-to-r from-festive-purple to-festive-pink hover:opacity-90 text-white"
                >
                  Return to Dashboard
                </Button>
              </>
            )}

            {status === "error" && (
              <>
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Payment Failed</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="space-y-2">
                  <Button
                    onClick={() => router.push("/pricing")}
                    className="bg-gradient-to-r from-festive-purple to-festive-pink hover:opacity-90 text-white"
                  >
                    Try Again
                  </Button>
                  <Button
                    onClick={() => router.push("/")}
                    variant="outline"
                    className="w-full border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  >
                    Return to Dashboard
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
