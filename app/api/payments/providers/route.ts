import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { paymentService } from "@/lib/payment/service"

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get all available payment providers
    const providers = await paymentService.getAvailableProviders()

    // Format the response
    const formattedProviders = providers.map((provider) => ({
      name: provider.name,
      displayName: provider.displayName,
      description: provider.description,
      logo: provider.logo,
      supportedMethods: provider.getPaymentMethods(),
      supportedCurrencies: provider.getSupportedCurrencies(),
    }))

    return NextResponse.json({
      providers: formattedProviders,
      defaultCurrency: await paymentService.getDefaultCurrency(),
    })
  } catch (error: any) {
    console.error("Error fetching payment providers:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch payment providers" }, { status: 500 })
  }
}
