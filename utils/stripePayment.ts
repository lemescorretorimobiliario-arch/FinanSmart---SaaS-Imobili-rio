import { toast } from 'sonner';

// URL do Link de Pagamento (CONFIGURE ISSO NO STRIPE DASHBOARD -> PAYMENT LINKS)
// DICA: Adicione "?client_reference_id={userId}" e "?prefilled_email={email}" na chamada
const STRIPE_PAYMENT_LINK_BASE = import.meta.env.VITE_STRIPE_PAYMENT_LINK || '';

export const subscribeToPro = async (userEmail: string, userId: string) => {
  try {
    if (!STRIPE_PAYMENT_LINK_BASE) {
      toast.error("Link de pagamento não configurado (VITE_STRIPE_PAYMENT_LINK).");
      return;
    }

    console.log("Redirecionando para Payment Link:", userEmail);
    toast.info("Redirecionando para o pagamento seguro...");

    // Construir URL com parâmetros para rastreamento
    // client_reference_id = Essencial para o webhook saber quem pagou
    // prefilled_email = Preenche o email automaticamente para o usuário
    const finalUrl = `${STRIPE_PAYMENT_LINK_BASE}?client_reference_id=${userId}&prefilled_email=${encodeURIComponent(userEmail)}`;

    // Redirecionamento direto
    window.location.href = finalUrl;

  } catch (error: any) {
    console.error("Erro no redirecionamento:", error);
    toast.error("Erro ao abrir pagamento.");
  }
};
