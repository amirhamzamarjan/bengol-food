/**
 * US BENGOL - WhatsApp Ordering Utility
 * 
 * Generates structured, pre-filled WhatsApp ordering messages
 * directed to official brand number.
 */

(function (window) {
  'use strict';

  const WHATSAPP_PHONE = window.US_BENGOL_CONFIG?.brand?.whatsappNumber || '8801000000000';

  function createProductOrderUrl(productName, quantity, pricePerPack) {
    const qty = parseInt(quantity, 10) || 1;
    const price = parseFloat(pricePerPack) || 0;
    const total = (qty * price).toFixed(2);

    let message = `Hello US BENGOL,\n\nI would like to order:\n- Product: ${productName}\n- Quantity: ${qty} pack(s)`;

    if (price > 0) {
      message += `\n- Price: ৳${price.toFixed(2)} each\n- Estimated Total: ৳${total}`;
    }

    message += `\n\nPlease let me know availability and delivery confirmation.\nThank you!`;

    const encoded = encodeURIComponent(message);
    return `https://wa.me/${WHATSAPP_PHONE}?text=${encoded}`;
  }

  function createGeneralInquiryUrl(customMessage) {
    const defaultMsg = customMessage || `Hello US BENGOL, I would like to inquire about your fresh roti and parota delivery.`;
    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(defaultMsg)}`;
  }

  function openWhatsApp(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  window.USB_WhatsApp = {
    phone: WHATSAPP_PHONE,
    createProductOrderUrl: createProductOrderUrl,
    createGeneralInquiryUrl: createGeneralInquiryUrl,
    open: openWhatsApp
  };
})(window);
