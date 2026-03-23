/**
 * Gera URL de abertura do WhatsApp com mensagem pré-preenchida do produto
 */
export function generateWhatsAppUrl(
  phone: string,
  productName: string,
  productPrice: string,
  productUrl: string
): string {
  const message = encodeURIComponent(
    `Olá! Tenho interesse no produto: ${productName} por ${productPrice}\n${productUrl}`
  )
  return `https://wa.me/${phone}?text=${message}`
}
