/**
 * Types for Evolution API Webhook (WhatsApp)
 * Based on Evolution API v2 documentation
 */

export interface EvolutionWebhookPayload {
  event: 'MESSAGES_UPSERT' | 'MESSAGES_UPDATE' | 'MESSAGES_SET' | 'MESSAGES_DELETE';
  instance: string;
  data: {
    key: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
    };
    pushName: string;
    message: {
      imageMessage?: {
        url: string;
        mimetype: string;
        caption?: string;
        fileLength: string;
        height: number;
        width: number;
        mediaKey: string;
        directPath: string;
        messageContextInfo?: any;
      };
      conversation?: string;
      extendedTextMessage?: {
        text: string;
      };
    };
    messageType: 'imageMessage' | 'conversation' | 'extendedTextMessage';
    messageTimestamp: number;
    owner: string;
    source: string;
  };
}

export interface WebhookResponse {
  success: boolean;
  message: string;
}
