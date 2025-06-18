export type Exchange = "OKX" | "Bybit" | "Deribit" | "Binance";

export interface BlandAIConfig {
  apiKey: string;
  phoneNumber: string;
  webhookUrl?: string;
}
