import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("🧪 ===== SSE TEST ENDPOINT =====");
  console.log("📅 Starting SSE test connection");

  // Set up SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
  });

  // Send initial connection message
  console.log("📤 Sending initial SSE message");
  res.write(
    `data: ${JSON.stringify({
      type: "connected",
      message: "SSE test connection established",
      timestamp: new Date().toISOString(),
    })}\n\n`
  );

  // Flush the response to ensure it's sent immediately
  if (res.flush) {
    res.flush();
  }

  // Send test messages every 2 seconds
  let counter = 1;
  const interval = setInterval(() => {
    try {
      const testMessage = {
        type: "test_message",
        counter: counter,
        message: `Test message #${counter}`,
        timestamp: new Date().toISOString(),
      };

      console.log(`📤 Sending test message #${counter}`);
      res.write(`data: ${JSON.stringify(testMessage)}\n\n`);

      // Flush the response to ensure it's sent immediately
      if (res.flush) {
        res.flush();
      }

      counter++;

      // Stop after 10 messages
      if (counter > 10) {
        clearInterval(interval);
        res.write(
          `data: ${JSON.stringify({
            type: "completed",
            message: "SSE test completed",
          })}\n\n`
        );

        // Flush the final message
        if (res.flush) {
          res.flush();
        }

        console.log("✅ SSE test completed");
      }
    } catch (error) {
      console.error("❌ Error sending SSE test message:", error);
      clearInterval(interval);
    }
  }, 2000);

  // Handle client disconnect
  req.on("close", () => {
    console.log("🔌 SSE test connection closed");
    clearInterval(interval);
  });
}
