// Dados de contato usados no CTA e no rodapé (o atendimento é pelo WhatsApp e pelo Instagram)
export const WHATSAPP_URL = "https://wa.me/5521987501858";
export const PHONE_LABEL = "+55 21 98750-1858";
export const INSTAGRAM_URL = "https://www.instagram.com/nayro_tech/";
export const INSTAGRAM_LABEL = "@nayro_tech";

/** Link do WhatsApp já com uma mensagem escrita */
export const whatsappLink = (message: string) => `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
