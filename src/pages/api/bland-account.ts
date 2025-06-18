import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("Fetching Bland.AI account information...");

    // Get account info using Bland.AI API
    const blandResponse = await fetch("https://api.bland.ai/v1/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.BLAND_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!blandResponse.ok) {
      const errorText = await blandResponse.text();
      console.error("Bland.AI API error:", errorText);

      // Handle specific error cases
      if (blandResponse.status === 401) {
        return res.status(401).json({
          error: "Invalid API key",
          details: "Please check your BLAND_API_KEY in environment variables",
        });
      }

      // Handle free account limitations (500 error with "fetching api key data")
      if (blandResponse.status === 500) {
        try {
          const errorData = JSON.parse(errorText);
          if (
            errorData.message &&
            errorData.message.includes("fetching api key data")
          ) {
            console.log(
              "Free account detected - balance endpoint not available"
            );
            return res.status(200).json({
              status: "free_account",
              billing: {
                currentBalance: null,
                refillTo: null,
              },
              totalCalls: null,
              hasEnoughBalance: null, // Unknown for free accounts
              isFreeAccount: true,
              message:
                "Free account detected. Balance information not available.",
            });
          }
        } catch (parseError) {
          console.log("Could not parse 500 error response");
        }
      }

      throw new Error(
        `Bland.AI API error: ${blandResponse.status} - ${errorText}`
      );
    }

    const result = await blandResponse.json();
    console.log("Account info retrieved:", {
      status: result.status,
      balance: result.billing?.current_balance,
      totalCalls: result.total_calls,
    });

    res.status(200).json({
      status: result.status,
      billing: {
        currentBalance: result.billing?.current_balance || 0,
        refillTo: result.billing?.refill_to || null,
      },
      totalCalls: result.total_calls || 0,
      hasEnoughBalance: (result.billing?.current_balance || 0) > 0.15, // Minimum for a call
    });
  } catch (error) {
    console.error("Error fetching account info:", error);
    res.status(500).json({
      error: "Failed to fetch account information",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
