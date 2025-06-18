import axios from "axios";
import { BlandAIConfig } from "@/types";
import { config } from "./config";

export class BlandAIClient {
  private config: BlandAIConfig;

  constructor(blandConfig: BlandAIConfig) {
    this.config = blandConfig;
  }

  async initiateCall(
    phoneNumber: string,
    conversationData?: any
  ): Promise<{ callId: string; status: string }> {
    try {
      const response = await axios.post(
        "https://api.bland.ai/v1/calls",
        {
          phone_number: phoneNumber,
          task: this.buildConversationTask(),
          voice: "maya", // Professional female voice
          language: "en",
          max_duration: 10, // 10 minutes max
          answered_by_enabled: true,
          wait_for_greeting: false,
          record: true,
          webhook: this.config.webhookUrl,
          ...conversationData,
        },
        {
          headers: {
            Authorization: this.config.apiKey,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        callId: response.data.call_id,
        status: response.data.status || "initiated",
      };
    } catch (error) {
      console.error("Error initiating Bland.ai call:", error);
      throw new Error("Failed to initiate call");
    }
  }

  async getCallStatus(callId: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://api.bland.ai/v1/calls/${callId}`,
        {
          headers: {
            Authorization: this.config.apiKey,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error getting call status:", error);
      throw new Error("Failed to get call status");
    }
  }

  async endCall(callId: string): Promise<void> {
    try {
      await axios.post(
        `https://api.bland.ai/v1/calls/${callId}/stop`,
        {},
        {
          headers: {
            Authorization: this.config.apiKey,
          },
        }
      );
    } catch (error) {
      console.error("Error ending call:", error);
      throw new Error("Failed to end call");
    }
  }

  private buildConversationTask(): string {
    return `You are a professional OTC (Over-the-Counter) cryptocurrency trading assistant. Your job is to help users place simulated OTC trades through a structured conversation.

CONVERSATION FLOW:
1. GREETING: Greet the user professionally and explain you'll help them place an OTC trade
2. EXCHANGE SELECTION: Ask them to choose from: OKX, Bybit, Deribit, or Binance
3. SYMBOL SELECTION: Once they choose an exchange, ask which cryptocurrency they want to trade (Bitcoin, Ethereum, etc.)
4. PRICE PRESENTATION: Tell them the current market price of their chosen symbol
5. ORDER DETAILS: Ask for the quantity they want to trade and their desired price
6. CONFIRMATION: Repeat back all order details and confirm this is a simulation

IMPORTANT RULES:
- Always speak clearly and professionally
- If the user says something unclear, politely ask them to repeat or clarify
- Only accept the four supported exchanges: OKX, Bybit, Deribit, Binance
- For symbols, accept common cryptocurrency names like Bitcoin, Ethereum, Solana, etc.
- Always emphasize this is a SIMULATION and no real trades will be executed
- Keep responses concise but friendly
- If user asks about real trading, explain this is for demonstration purposes only

EXAMPLE CONVERSATION:
"Hello! I'm your OTC trading assistant. I'll help you place a simulated cryptocurrency trade. To get started, please tell me which exchange you'd like to use: OKX, Bybit, Deribit, or Binance?"

[User responds with exchange]

"Great choice! You've selected [Exchange]. Now, which cryptocurrency would you like to trade? For example, Bitcoin, Ethereum, or Solana?"

[Continue the flow...]

Remember: Always be helpful, professional, and clear that this is a simulation.`;
  }

  // Static method to create client with default config
  static createClient(): BlandAIClient {
    return new BlandAIClient(config.blandAi);
  }
}
