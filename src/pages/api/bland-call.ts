import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { phoneNumber, pathwayId } = req.body;

    if (!phoneNumber || !pathwayId) {
      return res
        .status(400)
        .json({ error: "Missing required fields: phoneNumber and pathwayId" });
    }

    console.log(`Initiating call to ${phoneNumber} with pathway ${pathwayId}`);

    // Debug environment variables
    console.log("Environment variables check:");
    console.log(
      "- NEXT_PUBLIC_WEBHOOK_URL:",
      process.env.NEXT_PUBLIC_WEBHOOK_URL
    );
    console.log("- NODE_ENV:", process.env.NODE_ENV);

    // Get the base URL for webhook - only use if HTTPS
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers.host;
    const webhookUrl = `${protocol}://${host}/api/bland-webhook`;

    console.log(`Detected webhook URL: ${webhookUrl}`);
    console.log(`Protocol: ${protocol}, Host: ${host}`);

    // Prepare the call payload
    const callPayload: any = {
      phone_number: phoneNumber,
      pathway_id: pathwayId,
      voice: "maya", // You can customize this
      first_sentence:
        "Hello! I'm your AI trading assistant from VoiceTrader Pro. I'm here to help you with OTC trading. Are you ready to get started?",
      wait_for_greeting: true,
      record: true,
      max_duration: 600, // 10 minutes max
      answered_by_enabled: true,
      interruption_threshold: 100,
      voicemail_message:
        "Hi, this is your AI trading assistant from VoiceTrader Pro. Please call back when you're ready to discuss trading options.",

      // 🎯 LIVE TRANSCRIPTION SETTINGS
      live_transcript: true,
      webhook_send_transcript: true,
      transcript_settings: {
        live_transcript: true,
        partial_transcripts: true,
        transcript_streaming: true,
      },
    };

    // Check for webhook configuration
    const hasWebhookUrl = !!process.env.NEXT_PUBLIC_WEBHOOK_URL;
    const hasHttps = protocol === "https";

    console.log(
      `Webhook check - hasWebhookUrl: ${hasWebhookUrl}, hasHttps: ${hasHttps}`
    );

    // Use webhook if we have NEXT_PUBLIC_WEBHOOK_URL set OR if we have HTTPS
    if (hasWebhookUrl || hasHttps) {
      const finalWebhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL || webhookUrl;
      callPayload.webhook = finalWebhookUrl;
      callPayload.webhook_events = [
        "transcript",
        "live_transcript",
        "transcript_partial",
        "transcript_complete",
        "transcript_update",
        "call_started",
        "call_ended",
        "call_completed",
        "call_status_change",
      ];

      console.log(`🎯 Webhook URL set to: ${finalWebhookUrl}`);
      console.log(
        `📋 Webhook events: ${callPayload.webhook_events.join(", ")}`
      );

      // Add headers for ngrok free tier (to bypass browser warning)
      if (
        finalWebhookUrl.includes("ngrok-free.app") ||
        finalWebhookUrl.includes("ngrok.io")
      ) {
        callPayload.webhook_headers = {
          "ngrok-skip-browser-warning": "true",
        };
        console.log("Added ngrok bypass headers");
      }
    } else {
      console.log(
        "❌ Skipping webhook configuration - no HTTPS and no NEXT_PUBLIC_WEBHOOK_URL"
      );
    }

    // Make call using Bland.AI API
    const blandResponse = await fetch("https://api.bland.ai/v1/calls", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.BLAND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(callPayload),
    });

    if (!blandResponse.ok) {
      const errorText = await blandResponse.text();
      console.error("Bland.AI API error:", errorText);

      // Parse error response to provide better user feedback
      let errorMessage = `Bland.AI API error: ${blandResponse.status} - ${errorText}`;
      let userFriendlyMessage = "Failed to initiate call";

      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          // Handle specific error types
          if (
            errorData.message.includes("Insufficient balance") ||
            errorData.message.includes("insufficient balance")
          ) {
            userFriendlyMessage =
              "Insufficient account balance. Please add credits to your Bland.AI account to make calls.";
            errorMessage = `Billing Error: ${errorData.message}`;
          } else if (errorData.message.includes("Invalid phone number")) {
            userFriendlyMessage =
              "Invalid phone number format. Please check the phone number and try again.";
            errorMessage = `Phone Number Error: ${errorData.message}`;
          } else if (errorData.message.includes("Invalid pathway")) {
            userFriendlyMessage =
              "Invalid pathway configuration. Please check your Bland.AI pathway setup.";
            errorMessage = `Pathway Error: ${errorData.message}`;
          } else {
            userFriendlyMessage = errorData.message;
            errorMessage = `API Error: ${errorData.message}`;
          }
        }
      } catch (parseError) {
        // If we can't parse the error, use the raw text
        console.log("Could not parse error response:", parseError);
      }

      // Return structured error response
      return res.status(blandResponse.status).json({
        error: userFriendlyMessage,
        details: errorMessage,
        errorType: blandResponse.status === 402 ? "billing" : "api",
        status: blandResponse.status,
      });
    }

    const result = await blandResponse.json();
    console.log("Call initiated successfully:", result);

    const webhookConfigured = hasWebhookUrl || hasHttps;
    console.log(`Webhook configured: ${webhookConfigured}`);

    res.status(200).json({
      success: true,
      callId: result.call_id,
      status: result.status || "initiated",
      message: "Call initiated successfully",
      webhookConfigured: webhookConfigured,
    });
  } catch (error) {
    console.error("Error initiating call:", error);
    res.status(500).json({
      error: "Failed to initiate call",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
