import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabaseClient';

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
        // Lança erro controlado para ativar o modo simulação sem sujar o console
        throw new Error("BACKEND_UNAVAILABLE");
      }

      console.error("Erro na Edge Function:", error);

      // Tenta ler a mensagem de erro retornada pelo backend
      let serverMessage = '';
      try {
        const body = await error.context.json();
        serverMessage = body.error || '';
      } catch (e) { /* ignore */ }

      throw new Error(serverMessage || error.message || "Erro desconhecido no servidor.");
    }

    if (!data?.sessionId) {
      throw new Error('Sessão inválida retornada pelo servidor.');
    }

    // Redireciona para o Checkout real do Stripe
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error("Stripe não inicializado (Chave Pública ausente?)");
    }

    const { error: stripeError } = await stripe.redirectToCheckout({
      sessionId: data.sessionId,
    });

    if (stripeError) throw stripeError;

  } catch (error: any) {
    console.warn("Backend Edge Function falhou, tentando fallback client-side...", error);

    // FALLBACK: Tentar iniciar Checkout APENAS com Client-Side (sem sessão do backend)
    // Isso funciona se a chave pública e o preço estiverem corretos.
    try {
      const stripe = await getStripe();
      if (stripe) {
        const { error: redirectError } = await stripe.redirectToCheckout({
          lineItems: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
          mode: 'subscription',
          successUrl: `${window.location.origin}/?payment_success=true`,
          cancelUrl: `${window.location.origin}/?payment_cancelled=true`,
          clientReferenceId: userId, // Importante para o Webhook saber quem pagou
          customerEmail: userEmail
        });
        if (redirectError) throw redirectError;
        return; // Sucesso no redirect
      }
    } catch (clientError) {
      console.error("Fallback Client-side também falhou:", clientError);
    }

    // Se tudo falhar, oferece simulação
    const confirm = window.confirm(
      "Não foi possível conectar ao Stripe (Backend e Client-side falharam).\n\n" +
      "Isso pode ocorrer por bloqueio de pop-up ou configuração de rede.\n" +
      "Deseja SIMULAR um pagamento aprovado para testar o sistema?"
    );

    return { error: true, simulated: confirm };
  }
};