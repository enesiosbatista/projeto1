/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerFn } from "@tanstack/react-start";
import Stripe from "stripe";

// Initialize Stripe safely on the server side
const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
const isDummyStripe = !stripeSecret || stripeSecret.includes("dummy");

let stripe: Stripe | null = null;
if (!isDummyStripe) {
  stripe = new Stripe(stripeSecret, {
    apiVersion: "2023-10-16" as any,
  });
}

/**
 * 1. SERVER FUNCTION — Create Stripe Checkout Session
 */
export const createCheckoutSession = createServerFn({ method: "POST" })
  .validator((data: { priceId: string; userId: string; email: string }) => data)
  .handler(async ({ data }) => {
    const { priceId, userId, email } = data;

    // Determine the billing interval/plan name based on the price ID
    const isYearly = priceId.includes("anual") || priceId === "price_anual_8990";
    const planName = isYearly ? "Premium Anual" : "Premium Mensal";

    const host = process.env.VITE_URL || "http://localhost:3000";

    if (isDummyStripe) {
      console.log(
        `[Stripe Mock] Creating simulated checkout session for ${email} with plan ${planName}`,
      );

      // Return a simulated success redirection URL
      // This will let the frontend simulate a successful subscription landing page
      const successUrl = `${host}/dashboard?checkout_success=true&price_id=${priceId}&user_id=${userId}`;
      return { url: successUrl };
    }

    try {
      if (!stripe) throw new Error("Stripe is not initialized");

      // 1. Check if the user already has a customer record in Stripe
      // We can use Supabase on the server to check this, or just search by email
      const customers = await stripe.customers.list({
        email: email,
        limit: 1,
      });

      let customerId = customers.data.length > 0 ? customers.data[0].id : null;

      // 2. If not, create a new Customer
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: email,
          metadata: {
            supabase_user_id: userId,
          },
        });
        customerId = customer.id;
      }

      // 3. Create Checkout Session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${host}/dashboard?checkout_success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${host}/pricing?checkout_canceled=true`,
        subscription_data: {
          metadata: {
            supabase_user_id: userId,
          },
        },
      });

      return { url: session.url || `${host}/dashboard` };
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      throw new Error(error.message || "Failed to initiate checkout");
    }
  });

/**
 * 2. SERVER FUNCTION — Create Stripe Billing Portal Session
 */
export const createPortalSession = createServerFn({ method: "POST" })
  .validator((data: { userId: string; stripeCustomerId?: string }) => data)
  .handler(async ({ data }) => {
    const { userId, stripeCustomerId } = data;
    const host = process.env.VITE_URL || "http://localhost:3000";

    if (isDummyStripe || !stripeCustomerId) {
      console.log(`[Stripe Mock] Redirecting user ${userId} to simulated billing portal`);
      // In simulated mode, return a dummy portal URL which resets subscription in front
      const mockPortalUrl = `${host}/profile?portal_success=true`;
      return { url: mockPortalUrl };
    }

    try {
      if (!stripe) throw new Error("Stripe is not initialized");

      const session = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: `${host}/profile`,
      });

      return { url: session.url };
    } catch (error: any) {
      console.error("Error creating billing portal session:", error);
      throw new Error(error.message || "Failed to initiate billing portal");
    }
  });
