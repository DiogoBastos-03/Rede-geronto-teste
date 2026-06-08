import contato from '../data/contato.json';

/**
 * Abre o WhatsApp Web/app em nova aba com a mensagem pré-preenchida.
 * Usa o número centralizado em src/data/contato.json.
 */
export function openWhatsApp(message: string): void {
  const url = `https://wa.me/${contato.whatsapp}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
