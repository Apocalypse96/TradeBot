import { NextApiRequest, NextApiResponse } from "next";
import { broadcastTranscriptUpdate } from "./transcript-stream";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { callId, text, speaker } = req.body;

    if (!callId || !text || !speaker) {
      return res.status(400).json({
        error: "Missing required fields: callId, text, speaker",
      });
    }

    console.log("🧪 ===== DEBUG WEBHOOK TEST =====");
    console.log(`📞 Test Call ID: ${callId}`);
    console.log(`🎤 Test Speaker: ${speaker}`);
    console.log(`💬 Test Text: ${text}`);

    const testTranscriptEntry = {
      speaker: speaker === "user" ? ("user" as const) : ("assistant" as const),
      text: text,
      timestamp: new Date().toISOString(),
    };

    console.log("📡 Broadcasting test transcript...");
    broadcastTranscriptUpdate(callId, testTranscriptEntry);

    res.status(200).json({
      success: true,
      message: "Test transcript broadcasted",
      entry: testTranscriptEntry,
    });
  } catch (error) {
    console.error("❌ Debug webhook error:", error);
    res.status(500).json({
      error: "Debug webhook failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
