import { NextApiRequest, NextApiResponse } from "next";
import { broadcastTranscriptUpdate } from "./transcript-stream";

// Store active call transcripts in memory (in production, use Redis or database)
const callTranscripts = new Map<
  string,
  Array<{
    speaker: "user" | "assistant";
    text: string;
    timestamp: string;
  }>
>();

// Store active WebSocket connections for each call
const activeConnections = new Map<string, Set<any>>();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const webhookData = req.body;
    console.log("🔔 ========== BLAND.AI WEBHOOK RECEIVED ==========");
    console.log("📅 Timestamp:", new Date().toISOString());
    console.log("📦 Full webhook data:", JSON.stringify(webhookData, null, 2));
    console.log("================================================");

    const {
      call_id,
      c_id,
      event_type,
      transcript,
      speaker,
      text,
      transcripts,
      completed,
    } = webhookData;
    const finalCallId = call_id || c_id;

    if (!finalCallId) {
      console.error("❌ No call_id in webhook data");
      return res.status(400).json({ error: "Missing call_id" });
    }

    console.log(`📞 Processing webhook for call: ${finalCallId}`);
    console.log(`📝 Event type: ${event_type || "undefined"}`);
    console.log(`🎤 Speaker: ${speaker || "undefined"}`);
    console.log(`💬 Text: ${text || "undefined"}`);
    console.log(
      `📊 Has transcripts array: ${transcripts ? transcripts.length : "none"}`
    );
    console.log(`✅ Completed: ${completed || "false"}`);

    // Log all possible webhook fields for debugging
    console.log("🔍 ===== WEBHOOK FIELD ANALYSIS =====");
    console.log("Available fields:", Object.keys(webhookData));
    if (webhookData.transcript_chunk)
      console.log("📝 Has transcript_chunk:", webhookData.transcript_chunk);
    if (webhookData.live_transcript)
      console.log("🎙️ Has live_transcript:", webhookData.live_transcript);
    if (webhookData.real_time_transcript)
      console.log(
        "⚡ Has real_time_transcript:",
        webhookData.real_time_transcript
      );
    console.log("=====================================");

    // Handle different webhook events
    if (
      event_type === "transcript" ||
      event_type === "live_transcript" ||
      event_type === "transcript_partial" ||
      event_type === "transcript_complete" ||
      event_type === "transcript_update"
    ) {
      console.log("🎙️ ===== PROCESSING REAL-TIME TRANSCRIPT =====");
      console.log(`🔥 Event type: ${event_type}`);
      // Real-time transcript update during call
      if (text && speaker) {
        const transcriptEntry = {
          speaker:
            speaker === "user" ? ("user" as const) : ("assistant" as const),
          text: text,
          timestamp: new Date().toISOString(),
        };

        // Store transcript
        if (!callTranscripts.has(finalCallId)) {
          callTranscripts.set(finalCallId, []);
        }
        callTranscripts.get(finalCallId)!.push(transcriptEntry);

        console.log(
          `✅ Stored real-time transcript for call ${finalCallId}:`,
          transcriptEntry
        );
        console.log(
          `📈 Total transcripts stored: ${
            callTranscripts.get(finalCallId)!.length
          }`
        );

        // Broadcast to connected SSE clients with retry
        console.log(`📡 Broadcasting transcript update to SSE clients...`);
        setTimeout(() => {
          broadcastTranscriptUpdate(finalCallId, transcriptEntry);
        }, 500); // Increased delay to allow SSE connections to establish
      } else {
        console.log("❌ Real-time transcript event missing text or speaker");
        console.log(`   - Text: "${text}"`);
        console.log(`   - Speaker: "${speaker}"`);
      }
    } else if (
      webhookData.transcript_chunk ||
      webhookData.live_transcript ||
      webhookData.real_time_transcript
    ) {
      // Handle alternative transcript formats
      console.log("🎙️ ===== PROCESSING ALTERNATIVE TRANSCRIPT FORMAT =====");
      const altTranscript =
        webhookData.transcript_chunk ||
        webhookData.live_transcript ||
        webhookData.real_time_transcript;
      console.log("📦 Alternative transcript data:", altTranscript);

      if (altTranscript && typeof altTranscript === "object") {
        const transcriptEntry = {
          speaker:
            altTranscript.speaker === "user"
              ? ("user" as const)
              : ("assistant" as const),
          text:
            altTranscript.text ||
            altTranscript.content ||
            altTranscript.message ||
            "",
          timestamp: altTranscript.timestamp || new Date().toISOString(),
        };

        if (transcriptEntry.text) {
          // Store transcript
          if (!callTranscripts.has(finalCallId)) {
            callTranscripts.set(finalCallId, []);
          }
          callTranscripts.get(finalCallId)!.push(transcriptEntry);

          console.log(
            `✅ Stored alternative format transcript for call ${finalCallId}:`,
            transcriptEntry
          );

          // Broadcast to connected SSE clients
          setTimeout(() => {
            broadcastTranscriptUpdate(finalCallId, transcriptEntry);
          }, 500);
        }
      }
    } else if (event_type === "call_started") {
      console.log(`🟢 Call ${finalCallId} started`);
      callTranscripts.set(finalCallId, []);
    } else if (event_type === "call_ended" || completed === true) {
      console.log(`🔴 ===== CALL ENDED OR COMPLETED =====`);
      console.log(`🔴 Call ${finalCallId} ended or completed`);

      // Process final transcripts if available
      if (transcripts && Array.isArray(transcripts)) {
        console.log(
          `📚 Processing ${transcripts.length} final transcripts for call ${finalCallId}`
        );

        // Clear existing transcripts for this call
        callTranscripts.set(finalCallId, []);

        transcripts.forEach((transcript: any, index: number) => {
          const transcriptEntry = {
            speaker:
              transcript.user === "user"
                ? ("user" as const)
                : ("assistant" as const),
            text: transcript.text,
            timestamp: transcript.created_at || new Date().toISOString(),
          };

          callTranscripts.get(finalCallId)!.push(transcriptEntry);

          console.log(
            `📤 Broadcasting final transcript ${index + 1}/${
              transcripts.length
            }:`,
            {
              speaker: transcriptEntry.speaker,
              text: transcriptEntry.text.substring(0, 50) + "...",
            }
          );

          // Broadcast each transcript entry with a small delay to show them appearing
          setTimeout(() => {
            console.log(
              `🔥 Actually broadcasting final transcript ${
                index + 1
              } for call ${finalCallId}`
            );
            broadcastTranscriptUpdate(finalCallId, transcriptEntry);
          }, index * 1000); // 1 second delay between each entry
        });
      } else {
        console.log(
          "❌ No final transcripts array found in call completion webhook"
        );
      }

      // Keep transcript for a while, then clean up
      setTimeout(() => {
        callTranscripts.delete(finalCallId);
        console.log(`🗑️ Cleaned up transcript for call ${finalCallId}`);
      }, 300000); // 5 minutes
    } else {
      console.log(`❓ ===== UNHANDLED EVENT TYPE =====`);
      console.log(`❓ Unhandled event type: ${event_type || "undefined"}`);

      // If no event_type but we have transcripts, it might be a call completion webhook
      if (transcripts && Array.isArray(transcripts)) {
        console.log(
          `📝 Processing transcripts from completion webhook for call ${finalCallId}`
        );

        // Clear existing transcripts for this call
        callTranscripts.set(finalCallId, []);

        transcripts.forEach((transcript: any, index: number) => {
          const transcriptEntry = {
            speaker:
              transcript.user === "user"
                ? ("user" as const)
                : ("assistant" as const),
            text: transcript.text,
            timestamp: transcript.created_at || new Date().toISOString(),
          };

          callTranscripts.get(finalCallId)!.push(transcriptEntry);

          console.log(
            `📤 Broadcasting final transcript ${index + 1}/${
              transcripts.length
            }:`,
            {
              speaker: transcriptEntry.speaker,
              text: transcriptEntry.text.substring(0, 50) + "...",
            }
          );

          // Broadcast each transcript entry with a small delay
          setTimeout(() => {
            console.log(
              `🔥 Actually broadcasting final transcript ${
                index + 1
              } for call ${finalCallId}`
            );
            broadcastTranscriptUpdate(finalCallId, transcriptEntry);
          }, index * 1000); // 1 second delay between each entry
        });
      }
    }

    console.log("✅ Webhook processed successfully");
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("💥 Webhook error:", error);
    res.status(500).json({
      error: "Webhook processing failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// Export function to get transcript for a call
export function getCallTranscript(callId: string) {
  return callTranscripts.get(callId) || [];
}
