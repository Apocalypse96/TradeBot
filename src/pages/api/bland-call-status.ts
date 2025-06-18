import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { callId } = req.query;

    if (!callId || typeof callId !== "string") {
      return res
        .status(400)
        .json({ error: "Missing or invalid callId parameter" });
    }

    console.log(`Checking status for call: ${callId}`);

    // Get call status using Bland.AI API
    const blandResponse = await fetch(
      `https://api.bland.ai/v1/calls/${callId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.BLAND_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!blandResponse.ok) {
      const errorText = await blandResponse.text();
      console.error("Bland.AI API error:", errorText);
      throw new Error(
        `Bland.AI API error: ${blandResponse.status} - ${errorText}`
      );
    }

    const result = await blandResponse.json();
    console.log("Call status retrieved:", {
      callId,
      status: result.status,
      duration: result.call_length,
    });

    res.status(200).json({
      callId: result.call_id,
      status: result.status,
      duration: result.call_length,
      transcript: result.transcript || null,
      recording_url: result.recording_url || null,
      created_at: result.created_at,
      answered_by: result.answered_by || null,
      summary: result.summary || null,
    });
  } catch (error) {
    console.error("Error checking call status:", error);
    res.status(500).json({
      error: "Failed to check call status",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
