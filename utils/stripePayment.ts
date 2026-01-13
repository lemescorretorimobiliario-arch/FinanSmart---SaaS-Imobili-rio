import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabaseClient';
import { toast } from 'sonner';

// ============================================================================
// CONFIGURAÇÃO DO STRIPE
// ============================================================================

// 1. Chave Pública (Publishable Key):
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';

// 2. ID do Preço (Price ID): 
const STRIPE_PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ID || '';

// ============================================================================

let stripePromise: any;

export const getStripe = () => {
  if (!STRIPE_PUBLIC_KEY) {
    console.error("Stripe Public Key is missing in environment variables (VITE_STRIPE_PUBLIC_KEY).");
    return null;
  }
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
  }
  return stripePromise;
};

export const subscribeToPro = async (userEmail: string, userId: string) => {
  try {
    const returnUrl = `${window.location.origin}/?payment_success=true`;

    console.log("Iniciando checkout para:", userEmail);

    // Tenta chamar a função backend (Edge Function)
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        email: userEmail,
        userId: userId,
        priceId: STRIPE_PRICE_ID,
        redirectUrl: returnUrl
      },
    });

    // Tratamento detalhado de erro
    if (error) {
      // Detecta erros de conexão, função não existente ou falha de rede
      const isConnectionError =
        error.code === 'FUNCTIONS_HTTP_STATUS_404' ||
        error.message?.includes('not found') ||
        error.message?.includes('Failed to send a request');

      if (isConnectionError) {
        throw new Error("BACKEND_UNAVAILABLE");
      }

      console.error("Erro na Edge Function:", error);
      throw new Error(error.message || "Erro no servidor backend.");
    }

    if (!data?.sessionId) {
      throw new Error('Sessão inválida retornada pelo servidor.');
    }

    // Redireciona para o Checkout real do Stripe
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error("STRIPE_NOT_INITIALIZED");
    }

    const { error: stripeError } = await stripe.redirectToCheckout({
      sessionId: data.sessionId,
    });

    if (stripeError) throw stripeError;

  } catch (error: any) {
    console.warn("Backend Edge Function falhou, tentando fallback client-side...", error);

    // FALLBACK: Tentar iniciar Checkout APENAS com Client-Side (sem sessão do backend)
    try {
      const stripe = await getStripe();
      if (stripe) {
        toast.info("Redirecionando para o Stripe...");
        const { error: redirectError } = await stripe.redirectToCheckout({
          lineItems: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
          mode: 'subscription',
          successUrl: `${window.location.origin}/dashboard?payment_success=true`,
          cancelUrl: `${window.location.origin}/dashboard?payment_cancelled=true`,
          clientReferenceId: userId,
          customerEmail: userEmail
        });
        if (redirectError) throw redirectError;
        return;
      }
    } catch (clientError: any) {
      console.error("Fallback Client-side também falhou:", clientError);
      toast.error("Não foi possível conectar ao Stripe: " + (clientError.message || "Erro de configuração"));
    }

    // Se tudo falhar, oferece simulação
    const confirm = window.confirm(
      "Não foi possível conectar ao Stripe.\n\n" +
      "Isso pode ocorrer por bloqueio de pop-up ou configuração de rede (DNS/Firewall).\n" +
      "Deseja SIMULAR um pagamento aprovado para testar o sistema?"
    );

    return { error: true, simulated: confirm };
  }
};
