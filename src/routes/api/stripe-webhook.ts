/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute } from "@tanstack/react-router";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";
import { sendPaymentConfirmedEmail } from "@/lib/resend.server";

const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

const isDummyStripe = !stripeSecret || stripeSecret.includes("dummy");

let stripe: Stripe | null = null;
if (!isDummyStripe) {
  stripe = new Stripe(stripeSecret, {
    apiVersion: "2023-10-16" as any,
  });
}

export const Route = createFileRoute("/api/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        console.log("[Stripe Webhook] Received webhook event request");

        if (isDummyStripe) {
          console.log(
            "[Stripe Webhook] Stripe is in Dummy mode. Ignoring webhook signature verification.",
          );
          return new Response(JSON.stringify({ received: true, mock: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          if (!stripe) {
            return new Response("Stripe not initialized", { status: 500 });
          }

          const sig = request.headers.get("stripe-signature");
          if (!sig) {
            return new Response("Missing stripe-signature header", { status: 400 });
          }

          // Read raw body for Stripe signature validation
          const rawBody = await request.text();
          let event: Stripe.Event;

          try {
            event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
          } catch (err: any) {
            console.error(`Webhook signature verification failed:`, err.message);
            return new Response(`Webhook Error: ${err.message}`, { status: 400 });
          }

          console.log(`[Stripe Webhook] Constructed event type: ${event.type}`);

          // Handle the event
          switch (event.type) {
            case "checkout.session.completed": {
              const session = event.data.object as Stripe.Checkout.Session;
              const userId =
                session.metadata?.supabase_user_id ||
                session.subscription_data?.metadata?.supabase_user_id;
              const customerId = session.customer as string;
              const subscriptionId = session.subscription as string;

              if (!userId) {
                console.error(
                  "[Stripe Webhook] Missing supabase_user_id in session metadata",
                  session,
                );
                break;
              }

              console.log(
                `[Stripe Webhook] Checkout completed for user: ${userId}. Sub: ${subscriptionId}`,
              );

              // Fetch the subscription to check the price ID
              const subscription = await stripe.subscriptions.retrieve(subscriptionId);
              const priceId = subscription.items.data[0].price.id;

              const isYearly =
                priceId === process.env.VITE_STRIPE_ANUAL_PRICE_ID || priceId.includes("anual");
              const planName = isYearly ? "Premium Anual" : "Premium Mensal";

              // Update profiles in Supabase
              const { error } = await supabase
                .from("profiles")
                .update({
                  stripe_customer_id: customerId,
                  stripe_subscription_id: subscriptionId,
                  subscription_status: "active",
                  plan: planName,
                  credits: 50, // Refill to 50 credits
                })
                .eq("id", userId);

              if (error) {
                console.error("[Stripe Webhook] Error updating profile in Supabase:", error);
              } else {
                console.log(`[Stripe Webhook] Profile updated successfully for user ${userId}`);

                // Trigger transactional purchase email
                const email = session.customer_details?.email || session.customer_email || "";
                const name = session.customer_details?.name || "Criador";
                if (email) {
                  sendPaymentConfirmedEmail(email, name, planName).catch((e) =>
                    console.error("[Email Error] Failed sending purchase email:", e),
                  );
                }
              }
              break;
            }

            case "customer.subscription.updated": {
              const subscription = event.data.object as Stripe.Stripe.Subscription;
              const customerId = subscription.customer as string;
              const status = subscription.status;
              const subId = subscription.id;

              console.log(`[Stripe Webhook] Subscription updated: ${subId}. Status: ${status}`);

              // Determine plan from price
              const priceId = subscription.items.data[0].price.id;
              const isYearly =
                priceId === process.env.VITE_STRIPE_ANUAL_PRICE_ID || priceId.includes("anual");
              const planName = isYearly ? "Premium Anual" : "Premium Mensal";

              // Update profiles status based on Stripe customer id
              const { error } = await supabase
                .from("profiles")
                .update({
                  subscription_status: status,
                  plan: status === "active" ? planName : "free",
                })
                .eq("stripe_customer_id", customerId);

              if (error) {
                console.error("[Stripe Webhook] Error updating profile subscription:", error);
              }
              break;
            }

            case "customer.subscription.deleted": {
              const subscription = event.data.object as Stripe.Subscription;
              const customerId = subscription.customer as string;

              console.log(`[Stripe Webhook] Subscription deleted for customer: ${customerId}`);

              // Revert user to free plan
              const { error } = await supabase
                .from("profiles")
                .update({
                  plan: "free",
                  subscription_status: "canceled",
                  stripe_subscription_id: null,
                })
                .eq("stripe_customer_id", customerId);

              if (error) {
                console.error("[Stripe Webhook] Error resetting profile subscription:", error);
              }
              break;
            }

            default:
              console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
          }

          return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: any) {
          console.error("[Stripe Webhook] Unexpected webhook error:", err);
          return new Response(`Webhook Error: ${err.message}`, { status: 500 });
        }
      },
    },
  },
});
