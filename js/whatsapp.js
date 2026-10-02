/**
 * US BENGOL - WhatsApp Ordering Utility
 * 
 * Generates structured, pre-filled WhatsApp ordering messages
 * directed to official brand number: 01921692008 (+8801921692008).
 */

(function (window) {
  'use strict';

  const WHATSAPP_PHONE = '8801921692008';

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
