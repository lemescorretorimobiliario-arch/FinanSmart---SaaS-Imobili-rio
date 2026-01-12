
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2022-11-15',
    httpClient: Stripe.createFetchHttpClient(),
})

console.log("Edge Function: create-checkout-session initialized")

serve(async (req) => {
    // CORS Helper
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            }
        })
    }

    try {
        const { email, userId, priceId, redirectUrl } = await req.json()

        if (!email || !userId || !priceId) {
            throw new Error("Missing required fields: email, userId, priceId")
        }

        // 1. Get or Create Stripe Customer
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const supabase = createClient(supabaseUrl, supabaseKey)

        const { data: profile } = await supabase
            .from('profiles')
            .select('stripe_customer_id')
            .eq('id', userId)
            .single()

        let customerId = profile?.stripe_customer_id

        if (!customerId) {
            console.log("Creating new Stripe customer for", email)
            const customer = await stripe.customers.create({
                email,
                metadata: { supabase_user_id: userId }
            })
            customerId = customer.id
            // Update profile
            await supabase
                .from('profiles')
                .update({ stripe_customer_id: customerId })
                .eq('id', userId)
        }

        // 2. Create Checkout Session
        console.log("Creating Session for customer", customerId)
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            customer: customerId,
            success_url: redirectUrl,
            cancel_url: redirectUrl.replace('payment_success=true', 'payment_cancelled=true'),
            metadata: {
                userId: userId
            }
        })

        return new Response(
            JSON.stringify({ sessionId: session.id }),
            {
                headers: {
                    "Content-Type": "application/json",
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
                },
            },
        )
    } catch (error) {
        console.error("Error creating session:", error)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 400,
                headers: {
                    "Content-Type": "application/json",
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
                },
            },
        )
    }
})
