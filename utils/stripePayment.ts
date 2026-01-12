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
    const { error: stripeError } = await stripe.redirectToCheckout({
      sessionId: data.sessionId,
    });

    if (stripeError) throw stripeError;

  } catch (error: any) {
    // Verifica se o erro é de backend ausente para ativar o fallback
    const isBackendMissing = 
        error.message === "BACKEND_UNAVAILABLE" || 
        error.message.includes("FunctionsFetchError") ||
        error.message.includes("Failed to send a request");
    
    if (!isBackendMissing) {
        console.error('Erro de Pagamento:', error);
        // Erro de configuração específico do Stripe (ex: ID errado)
        if (error.message && error.message.includes("No such price")) {
            alert(`Erro de Configuração Stripe: O ID do preço '${STRIPE_PRICE_ID}' não foi encontrado na sua conta Stripe.`);
            return { error: true, simulated: false };
        }
    }
    
    // FALLBACK PARA MODO DE DEMONSTRAÇÃO
    // Executa sempre que o backend falhar (comum em dev)
    const confirm = window.confirm(
        "A conexão com o servidor de pagamentos falhou (Edge Function não detectada).\n\n" +
        "Isso é normal em ambiente de desenvolvimento local sem deploy.\n" +
        "Deseja SIMULAR um pagamento aprovado agora?"
    );
    
    return { error: true, simulated: confirm };
  }
};