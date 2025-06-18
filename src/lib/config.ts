export const config = {
  blandAi: {
    apiKey: process.env.BLAND_AI_API_KEY || "",
    phoneNumber: process.env.BLAND_AI_PHONE_NUMBER || "",
    webhookUrl: process.env.BLAND_AI_WEBHOOK_URL,
  },
  exchanges: {
    okx: {
      apiKey: process.env.OKX_API_KEY || "",
      apiSecret: process.env.OKX_API_SECRET || "",
      baseUrl: "https://www.okx.com/api/v5",
    },
    bybit: {
      apiKey: process.env.BYBIT_API_KEY || "",
      apiSecret: process.env.BYBIT_API_SECRET || "",
      baseUrl: "https://api.bybit.com",
    },
    deribit: {
      apiKey: process.env.DERIBIT_API_KEY || "",
      apiSecret: process.env.DERIBIT_API_SECRET || "",
      baseUrl: "https://www.deribit.com/api/v2",
    },
    binance: {
      apiKey: process.env.BINANCE_API_KEY || "",
      apiSecret: process.env.BINANCE_API_SECRET || "",
      baseUrl: "https://api.binance.com/api/v3",
    },
  },
} as const;

// Only validate required environment variables in production
if (process.env.NODE_ENV === "production") {
  const requiredEnvVars = ["BLAND_AI_API_KEY", "BLAND_AI_PHONE_NUMBER"];
  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    console.warn(`Missing environment variables: ${missingEnvVars.join(", ")}`);
  }
}
