import { NextApiRequest, NextApiResponse } from "next";
import { getCallTranscript } from "./bland-webhook";

// Store active SSE connections
const sseConnections = new Map<string, Set<NextApiResponse>>();

// Store pending transcripts for calls that don't have connections yet
const pendingTranscripts = new Map<string, Array<any>>();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { callId } = req.query;

  if (!callId || typeof callId !== "string") {
    return res.status(400).json({ error: "Missing callId parameter" });
  }

  // Set up SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
  });

  // Add this connection to the set for this call
  if (!sseConnections.has(callId)) {
    sseConnections.set(callId, new Set());
  }
  sseConnections.get(callId)!.add(res);

  console.log(`🔌 SSE connection established for call: ${callId}`);
  console.log(
    `📊 Total SSE connections for call ${callId}: ${
      sseConnections.get(callId)!.size
    }`
  );

  // Send initial transcript if available
  const existingTranscript = getCallTranscript(callId);
  if (existingTranscript.length > 0) {
    console.log(
      `📜 Sending ${existingTranscript.length} existing transcripts to new SSE client`
    );
    res.write(
      `data: ${JSON.stringify({
        type: "initial_transcript",
        transcript: existingTranscript,
      })}\n\n`
    );

    // Flush the response
    if (res.flush) {
      res.flush();
    }
  } else {
    console.log(`📝 No existing transcripts for call ${callId}`);
  }

  // Send any pending transcripts that arrived before this connection
  const pending = pendingTranscripts.get(callId);
  if (pending && pending.length > 0) {
    console.log(
      `📤 Sending ${pending.length} pending transcripts for call ${callId}`
    );
    pending.forEach((transcriptEntry, index) => {
      setTimeout(() => {
        try {
          res.write(
            `data: ${JSON.stringify({
              type: "transcript_update",
              entry: transcriptEntry,
            })}\n\n`
          );

          // Flush the response
          if (res.flush) {
            res.flush();
          }

          console.log(
            `✅ Sent pending transcript ${index + 1} for call ${callId}`
          );
        } catch (error) {
          console.error(
            `❌ Error sending pending transcript ${index + 1}:`,
            error
          );
        }
      }, index * 500); // 500ms delay between each
    });

    // Clear pending transcripts after sending
    pendingTranscripts.delete(callId);
  }

  // Send heartbeat every 30 seconds
  const heartbeatInterval = setInterval(() => {
    try {
      res.write(
        `data: ${JSON.stringify({
          type: "heartbeat",
          timestamp: new Date().toISOString(),
        })}\n\n`
      );

      // Flush the response
      if (res.flush) {
        res.flush();
      }

      console.log(`💓 Heartbeat sent to SSE client for call ${callId}`);
    } catch (error) {
      console.error(`❌ Error sending heartbeat for call ${callId}:`, error);
      clearInterval(heartbeatInterval);
    }
  }, 30000);

  // Handle client disconnect
  req.on("close", () => {
    console.log(`🔌 SSE connection closed for call: ${callId}`);
    clearInterval(heartbeatInterval);

    const connections = sseConnections.get(callId);
    if (connections) {
      connections.delete(res);
      console.log(
        `📊 Remaining SSE connections for call ${callId}: ${connections.size}`
      );
      if (connections.size === 0) {
        sseConnections.delete(callId);
        console.log(`🗑️ Removed SSE connection map for call ${callId}`);
      }
    }
  });

  // Keep connection alive
  console.log(`🚀 Sending initial connection message for call ${callId}`);
  res.write(`data: ${JSON.stringify({ type: "connected", callId })}\n\n`);

  // Flush the response to ensure it's sent immediately
  if (res.flush) {
    res.flush();
  }
}

// Function to broadcast transcript updates to all connected clients
export function broadcastTranscriptUpdate(
  callId: string,
  transcriptEntry: any
) {
  console.log(`📢 ===== BROADCAST TRANSCRIPT UPDATE =====`);
  console.log(`📞 Call ID: ${callId}`);
  console.log(`📝 Transcript entry:`, {
    speaker: transcriptEntry.speaker,
    text: transcriptEntry.text.substring(0, 100) + "...",
    timestamp: transcriptEntry.timestamp,
  });

  const connections = sseConnections.get(callId);
  console.log(`🔌 SSE connections check:`);
  console.log(
    `   - Found connections for call ${callId}: ${
      connections ? connections.size : 0
    }`
  );
  console.log(
    `   - Total active call IDs: [${Array.from(sseConnections.keys()).join(
      ", "
    )}]`
  );

  if (!connections || connections.size === 0) {
    console.log(`❌ No SSE connections found for call ${callId}`);
    console.log(
      `📊 Available call IDs with connections: [${Array.from(
        sseConnections.keys()
      ).join(", ")}]`
    );

    // Store transcript for when connection is established
    if (!pendingTranscripts.has(callId)) {
      pendingTranscripts.set(callId, []);
    }
    pendingTranscripts.get(callId)!.push(transcriptEntry);
    console.log(`💾 Stored transcript as pending for call ${callId}`);
    console.log(
      `📈 Total pending transcripts for call: ${
        pendingTranscripts.get(callId)!.length
      }`
    );

    // Try again after a short delay (in case connection is being established)
    setTimeout(() => {
      const retryConnections = sseConnections.get(callId);
      if (retryConnections && retryConnections.size > 0) {
        console.log(
          `🔄 Retrying broadcast for call ${callId} - found ${retryConnections.size} connections`
        );
        broadcastToConnections(callId, transcriptEntry, retryConnections);
      } else {
        console.log(`⏳ Still no connections for call ${callId} after retry`);
      }
    }, 2000); // 2 second retry

    return;
  }

  console.log(
    `✅ Found ${connections.size} SSE connections for call ${callId} - proceeding with broadcast`
  );
  broadcastToConnections(callId, transcriptEntry, connections);
}

// Helper function to actually broadcast to connections
function broadcastToConnections(
  callId: string,
  transcriptEntry: any,
  connections: Set<NextApiResponse>
) {
  console.log(`📊 ===== BROADCASTING TO CONNECTIONS =====`);
  console.log(`📞 Call ID: ${callId}`);
  console.log(`🔌 Number of connections: ${connections.size}`);

  const data = JSON.stringify({
    type: "transcript_update",
    entry: transcriptEntry,
  });

  console.log(`📦 Data to send:`, data);

  let successCount = 0;
  let errorCount = 0;

  connections.forEach((res) => {
    try {
      console.log(`📤 Attempting to send data to SSE client...`);
      res.write(`data: ${data}\n\n`);

      // Flush the response to ensure it's sent immediately
      if (res.flush) {
        res.flush();
      }

      successCount++;
      console.log(
        `✅ Successfully sent transcript to SSE client for call ${callId}`
      );
    } catch (error) {
      errorCount++;
      console.error(
        `❌ Error broadcasting to SSE client for call ${callId}:`,
        error
      );
      console.error(`   Error details:`, {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : "Unknown error",
      });
      connections.delete(res);
      console.log(`🗑️ Removed failed connection from pool`);
    }
  });

  console.log(`📈 ===== BROADCAST SUMMARY =====`);
  console.log(`📈 Call ID: ${callId}`);
  console.log(`📈 Success: ${successCount}, Errors: ${errorCount}`);
  console.log(`📈 Remaining connections: ${connections.size}`);
  console.log(`=====================================`);
}
