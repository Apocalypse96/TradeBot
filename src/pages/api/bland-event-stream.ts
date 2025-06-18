import type { NextApiRequest, NextApiResponse } from "next";

interface SSEClient {
  res: NextApiResponse;
  callId: string;
}

// Store active SSE connections
const sseClients = new Map<string, SSEClient[]>();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { callId } = req.query;

  if (!callId || typeof callId !== "string") {
    return res.status(400).json({ error: "Call ID is required" });
  }

  console.log(`🎯 Starting Bland.AI Event Stream for call: ${callId}`);

  // Set up SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Cache-Control");

  // Send initial connection message
  res.write(
    `data: ${JSON.stringify({
      type: "connected",
      callId: callId,
      message: "Event stream connected",
    })}\n\n`
  );
  res.flush();

  // Connect to Bland.AI Event Stream
  const blandApiKey = process.env.BLAND_API_KEY;
  if (!blandApiKey) {
    console.error("❌ BLAND_API_KEY not found");
    res.write(
      `data: ${JSON.stringify({
        type: "error",
        message: "API key not configured",
      })}\n\n`
    );
    res.flush();
    return res.end();
  }

  try {
    console.log(
      `🔗 Connecting to Bland.AI Event Stream: https://api.bland.ai/v1/event_stream/${callId}`
    );

    // Fetch event stream from Bland.AI
    const response = await fetch(
      `https://api.bland.ai/v1/event_stream/${callId}`,
      {
        method: "GET",
        headers: {
          Authorization: blandApiKey,
          Accept: "text/event-stream",
        },
      }
    );

    console.log(`📊 Bland.AI Response Status: ${response.status}`);
    console.log(
      `📊 Bland.AI Response Headers:`,
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      // Log the error response body
      const errorText = await response.text();
      console.error(`❌ Bland.AI API Error Response:`, errorText);

      res.write(
        `data: ${JSON.stringify({
          type: "error",
          message: `Bland.AI API error: ${response.status} ${response.statusText}`,
          details: errorText,
        })}\n\n`
      );
      res.flush();
      return res.end();
    }

    console.log(`✅ Connected to Bland.AI Event Stream for call: ${callId}`);

    // Check if response body exists and is readable
    if (!response.body) {
      throw new Error("No response body from Bland.AI Event Stream");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    // Handle client disconnect
    req.on("close", () => {
      console.log(`🔌 Client disconnected from event stream: ${callId}`);
      reader.cancel();
    });

    // Read the stream
    try {
      let chunkCount = 0;
      while (true) {
        const { done, value } = await reader.read();
        chunkCount++;

        console.log(
          `📦 Stream read #${chunkCount}: done=${done}, valueLength=${
            value?.length || 0
          }`
        );

        if (done) {
          console.log(
            `🏁 Bland.AI Event Stream ended for call: ${callId} after ${chunkCount} chunks`
          );
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        console.log(
          `📦 Received chunk #${chunkCount} from Bland.AI (${chunk.length} chars):`,
          chunk.substring(0, 200) + (chunk.length > 200 ? "..." : "")
        );

        // Parse and forward events
        const lines = chunk.split("\n");
        console.log(
          `📋 Processing ${lines.length} lines from chunk #${chunkCount}`
        );

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6); // Remove 'data: ' prefix
            console.log(
              `🎯 Found SSE data line:`,
              data.substring(0, 100) + (data.length > 100 ? "..." : "")
            );

            try {
              const eventData = JSON.parse(data);
              console.log(`🎙️ Parsed event data:`, eventData);

              // Check if this is a transcript event
              if (
                eventData.message &&
                eventData.message.includes("transcript")
              ) {
                console.log(`📝 Transcript event detected:`, eventData);

                // Forward to our SSE clients
                res.write(
                  `data: ${JSON.stringify({
                    type: "transcript",
                    callId: callId,
                    event: eventData,
                    timestamp: new Date().toISOString(),
                  })}\n\n`
                );
                res.flush();
              } else {
                // Forward all other events as well
                res.write(
                  `data: ${JSON.stringify({
                    type: "event",
                    callId: callId,
                    event: eventData,
                    timestamp: new Date().toISOString(),
                  })}\n\n`
                );
                res.flush();
              }
            } catch (parseError) {
              console.log(`⚠️ Could not parse event data:`, data);
              // Forward raw data
              res.write(
                `data: ${JSON.stringify({
                  type: "raw",
                  callId: callId,
                  data: data,
                  timestamp: new Date().toISOString(),
                })}\n\n`
              );
              res.flush();
            }
          } else if (line.trim()) {
            console.log(`📄 Non-data line:`, line);
          }
        }
      }
    } catch (readError) {
      console.error(`❌ Error reading from Bland.AI Event Stream:`, readError);
      res.write(
        `data: ${JSON.stringify({
          type: "error",
          message: "Stream read error",
          error: readError.message,
        })}\n\n`
      );
      res.flush();
    }
  } catch (error) {
    console.error(`❌ Error connecting to Bland.AI Event Stream:`, error);
    res.write(
      `data: ${JSON.stringify({
        type: "error",
        message: "Failed to connect to Bland.AI Event Stream",
        error: error.message,
      })}\n\n`
    );
    res.flush();
  }

  // Send final message and close
  res.write(
    `data: ${JSON.stringify({
      type: "disconnected",
      callId: callId,
      message: "Event stream disconnected",
    })}\n\n`
  );
  res.flush();
  res.end();
}
