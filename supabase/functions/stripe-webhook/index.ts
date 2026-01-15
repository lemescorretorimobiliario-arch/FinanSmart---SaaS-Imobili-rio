
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2022-11-15',
    httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createSubtleCryptoProvider();

console.log("Edge Function: stripe-webhook initialized")

serve(async (req) => {
    const signature = req.headers.get('Stripe-Signature')
    const body = await req.text()
    const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    let event;

    try {
        event = await stripe.webhooks.constructEventAsync(
            body,
            signature!,
            endpointSecret!,
            undefined,
            cryptoProvider
        );
    } catch (err) {
        console.error(`Webhook signature verification failed.`, err.message);
        return new Response(err.message, { status: 400 });
    }

    // Handle the event
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    try {
        console.log(`Processing event: ${event.type}`);

        if (event.type === 'checkout.session.completed' || event.type === 'invoice.payment_succeeded') {
            const data = event.data.object;
            const customerId = data.customer;
            // For checkout session, we use metadata. For invoice, we need to find the user by customerId
            const userId = data.metadata?.userId || data.client_reference_id;
            const subscriptionId = data.subscription;

            if (userId) {
                console.log(`Activating plan for user ${userId}. Sub ID: ${subscriptionId}`);
                await supabase
                    .from('profiles')
                    .update({
                        plan: 'PRO',
                        subscription_id: subscriptionId,
                        subscription_status: 'active',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', userId);
            } else if (customerId) {
                console.log(`Activating plan for customer ${customerId}. Sub ID: ${subscriptionId}`);
                await supabase
                    .from('profiles')
                    .update({
                        plan: 'PRO',
                        subscription_id: subscriptionId,
                        subscription_status: 'active',
                        updated_at: new Date().toISOString()
                    })
                    .eq('stripe_customer_id', customerId);
            }
        }

        if (event.type === 'customer.subscription.updated') {
            const subscription = event.data.object;
            const status = subscription.status; // active, past_due, canceled, unpaid
            const customerId = subscription.customer;

            console.log(`Subscription updated for customer ${customerId}: ${status}`);

            // Find user by stripe_customer_id
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('stripe_customer_id', customerId)
                .single();

            if (profile) {
                const newPlan = (status === 'active' || status === 'trialing') ? 'PRO' : 'FREE';

                await supabase
                    .from('profiles')
                    .update({
                        plan: newPlan,
                        subscription_status: status,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', profile.id);
            }
        }

        if (event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object;
            const customerId = subscription.customer;

            console.log(`Subscription DELETED for customer ${customerId}`);

            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('stripe_customer_id', customerId)
                .single();

            if (profile) {
                await supabase
                    .from('profiles')
                    .update({
                        plan: 'FREE',
                        subscription_status: 'canceled',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', profile.id);
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (err) {
        console.error(`Error processing webhook: ${err.message}`);
        return new Response(`Server Error: ${err.message}`, { status: 500 });
    }
})
