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
    const returnUrl = `${window.location.origin}/dashboard?payment_success=true`;

    if (!STRIPE_PUBLIC_KEY || !STRIPE_PRICE_ID) {
      const missing = !STRIPE_PUBLIC_KEY ? 'VITE_STRIPE_PUBLIC_KEY' : 'VITE_STRIPE_PRICE_ID';
      toast.error(`Configuração ausente: ${missing} não encontrada no ambiente.`);
      throw new Error(`MISSING_ENV: ${missing}`);
    }

    console.log("Iniciando checkout para:", userEmail);
    toast.info("Conectando ao servidor de pagamento...");

    // Tenta chamar a função backend (Edge Function)
    const { data, error: functionError } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        email: userEmail,
        userId: userId,
        priceId: STRIPE_PRICE_ID,
        redirectUrl: returnUrl
      },
    });

    // Tratamento detalhado de erro do Backend
    if (functionError) {
      console.warn("Backend indisponível ou erro na função:", functionError);
      // Se for apenas indisponibilidade, tentamos o fallback silenciosamente
      // Mas se for outro erro, mostramos
      if (functionError.code !== 'FUNCTIONS_HTTP_STATUS_404' && !functionError.message?.includes('Failed to send')) {
        toast.error(`Erro Backend: ${functionError.message}`);
      }
      throw new Error("BACKEND_FAIL");
    }

    if (!data?.sessionId) {
      throw new Error('Sessão inválida retornada pelo servidor.');
    }

    // Redireciona para o Checkout real do Stripe (via Sessão)
    const stripe = await getStripe();
    if (!stripe) throw new Error("STRIPE_NOT_INITIALIZED");

    const { error: stripeError } = await stripe.redirectToCheckout({
      sessionId: data.sessionId,
    });

    if (stripeError) throw stripeError;

  } catch (error: any) {
    console.warn("Falha no fluxo principal, tentando fallback client-side...", error);

    // FALLBACK: Tentar iniciar Checkout APENAS com Client-Side (sem sessão do backend)
    try {
      const stripe = await getStripe();
      if (!stripe) throw new Error("Stripe não pode ser carregado.");

      toast.info("Tentando conexão direta com o Stripe...");

      const { error: redirectError } = await stripe.redirectToCheckout({
        lineItems: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
        mode: 'subscription',
        successUrl: `${window.location.origin}/dashboard?payment_success=true`,
        cancelUrl: `${window.location.origin}/dashboard?payment_cancelled=true`,
        clientReferenceId: userId,
        customerEmail: userEmail
      });

      if (redirectError) {
        // Erro COMUM: "Client-only checkout has been deprecated" ou "not enabled"
        console.error("Erro específico do Stripe Redirect:", redirectError);
        toast.error(`Erro Stripe: ${redirectError.message}`);
        throw redirectError;
      }
      return;
    } catch (clientError: any) {
      console.error("Fallback total falhou:", clientError);

      // Se chegamos aqui, nada funcionou.
      const isDev = window.location.hostname === 'localhost';
      const errorMessage = clientError.message || "Erro de conexão";

      const confirm = window.confirm(
        `NÃO FOI POSSÍVEL ABRIR O CHECKOUT.\n\n` +
        `Motivo técnico: ${errorMessage}\n\n` +
        `1. Verifique se o 'Client-side checkout' está ATIVADO no seu Dashboard do Stripe.\n` +
        `2. Verifique se as chaves VITE_STRIPE estão corretas no Vercel.\n\n` +
        `Deseja SIMULAR um pagamento aprovado para testar o sistema agora?`
      );

      return { error: true, simulated: confirm };
    }
  }
};
