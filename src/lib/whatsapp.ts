/**
 * Utility to send messages via Evolution API
 */

export async function sendWhatsAppMessage(to: string, text: string) {
  const apiUrl = process.env.WHATSAPP_API_URL;
  const apiKey = process.env.WHATSAPP_API_KEY;
  const instance = process.env.WHATSAPP_INSTANCE;

  if (!apiUrl || !apiKey || !instance) {
    console.warn("[WhatsApp] API credentials not found. Notification skipped.");
    return null;
  }

  // Clean the number (remove non-digits, append @s.whatsapp.net if missing)
  let cleanNumber = to.replace(/\D/g, "");
  if (!cleanNumber.endsWith("@s.whatsapp.net")) {
    cleanNumber = `${cleanNumber}@s.whatsapp.net`;
  }

  try {
    const response = await fetch(`${apiUrl}/message/sendText/${instance}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": apiKey
      },
      body: JSON.stringify({
        number: cleanNumber,
        text: text,
        delay: 1200,
        linkPreview: false
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[WhatsApp] Error sending message:", error);
    return null;
  }
}
