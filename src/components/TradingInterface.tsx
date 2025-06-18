"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { TradingLayout } from "./layout/TradingLayout";
import { TopNavigation } from "./navigation/TopNavigation";

interface TranscriptEntry {
  speaker: "user" | "assistant";
  text: string;
  timestamp: string;
}

const TradingInterface = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isConnected, setIsConnected] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isCallInProgress, setIsCallInProgress] = useState(false);
  const [callStatus, setCallStatus] = useState<string>("");
  const [currentCallId, setCurrentCallId] = useState<string>("");
  const [realTimeTranscript, setRealTimeTranscript] = useState<
    TranscriptEntry[]
  >([]);
  const [webhookConfigured, setWebhookConfigured] = useState<boolean>(false);
  const [conversationLog, setConversationLog] = useState<
    Array<{
      type: "user" | "assistant" | "system";
      message: string;
      timestamp: Date;
    }>
  >([]);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Account balance state
  const [accountInfo, setAccountInfo] = useState<{
    status: string;
    billing: {
      currentBalance: number | null;
      refillTo: number | null;
    };
    totalCalls: number | null;
    hasEnoughBalance: boolean | null;
    isFreeAccount?: boolean;
    message?: string;
  } | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  // Get Pathway ID from environment variable
  const PATHWAY_ID =
    process.env.NEXT_PUBLIC_BLAND_PATHWAY_ID ||
    "decf6d38-0ffb-441f-9a75-10f9776b9831";

  const addDebugInfo = (message: string) => {
    console.log(`[VoiceTrader Debug]: ${message}`);
    setDebugInfo((prev) => [
      ...prev.slice(-4),
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const addToConversationLog = (
    type: "user" | "assistant" | "system",
    message: string
  ) => {
    setConversationLog((prev) => [
      ...prev,
      {
        type,
        message,
        timestamp: new Date(),
      },
    ]);
  };

  // Check account balance
  const checkAccountBalance = async () => {
    setBalanceLoading(true);
    try {
      addDebugInfo("🔍 Checking Bland.AI account balance...");

      const response = await fetch("/api/bland-account");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const accountData = await response.json();
      setAccountInfo(accountData);

      addDebugInfo(
        `💰 Account Balance: $${
          accountData.billing.currentBalance?.toFixed(2) || "N/A"
        }`
      );
      addDebugInfo(`📞 Total Calls Made: ${accountData.totalCalls || "N/A"}`);
      addDebugInfo(
        `✅ Has Enough Balance: ${accountData.hasEnoughBalance ? "Yes" : "No"}`
      );

      if (!accountData.hasEnoughBalance) {
        addDebugInfo("⚠️ Insufficient balance for calls - please add credits");
        addToConversationLog(
          "system",
          "⚠️ Low account balance detected. Please add credits to your Bland.AI account to make calls."
        );
      }
    } catch (error) {
      addDebugInfo(`❌ Error checking balance: ${error}`);
      console.error("Error checking account balance:", error);
    } finally {
      setBalanceLoading(false);
    }
  };

  const connectToTranscriptStream = useCallback(
    (callId: string) => {
      addDebugInfo(`🔗 Connecting to SSE for call: ${callId}`);

      if (eventSourceRef.current) {
        addDebugInfo("🔄 Closing existing SSE connection");
        eventSourceRef.current.close();
      }

      addDebugInfo(`📡 Establishing SSE connection for call: ${callId}`);
      addDebugInfo(`🌐 SSE URL: /api/transcript-stream?callId=${callId}`);

      const eventSource = new EventSource(
        `/api/transcript-stream?callId=${callId}`
      );
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log("✅ SSE onopen event fired for call:", callId);
        addDebugInfo(
          `✅ SSE connection opened successfully for call: ${callId}`
        );
        addDebugInfo(
          `📊 SSE Ready State: ${eventSource.readyState} (1 = OPEN)`
        );
      };

      eventSource.onmessage = (event) => {
        console.log("🔍 ===== SSE MESSAGE RECEIVED =====");
        console.log("📞 Call ID:", callId);
        console.log("📦 Raw event data:", event.data);
        console.log("📊 Event source ready state:", eventSource.readyState);

        try {
          const data = JSON.parse(event.data);
          console.log("📋 Parsed data:", data);
          addDebugInfo(`📨 SSE message: ${data.type} for call ${callId}`);

          if (data.type === "connected") {
            console.log(`✅ SSE connection confirmed for call: ${callId}`);
            addDebugInfo(
              `🎯 SSE connection established and ready for call: ${callId}`
            );
          } else if (data.type === "transcript_update" && data.entry) {
            console.log("🎙️ ===== TRANSCRIPT RECEIVED =====");
            console.log("📝 Transcript data:", data.entry);
            addDebugInfo(
              `📝 Transcript received: ${
                data.entry.speaker
              }: ${data.entry.text.substring(0, 50)}...`
            );

            // Add to real-time transcript
            setRealTimeTranscript((prev) => [
              ...prev,
              {
                speaker: data.entry.speaker || "assistant",
                text: data.entry.text,
                timestamp: data.entry.timestamp || new Date().toISOString(),
              },
            ]);

            // Also add to conversation log
            addToConversationLog(
              data.entry.speaker === "user" ? "user" : "assistant",
              data.entry.text
            );
          } else if (data.type === "initial_transcript" && data.transcript) {
            console.log("📜 ===== INITIAL TRANSCRIPT RECEIVED =====");
            console.log(
              `📊 Initial transcript entries: ${data.transcript.length}`
            );
            addDebugInfo(
              `📜 Received ${data.transcript.length} initial transcript entries`
            );

            // Add all initial transcripts
            data.transcript.forEach((entry: any, index: number) => {
              setTimeout(() => {
                setRealTimeTranscript((prev) => [
                  ...prev,
                  {
                    speaker: entry.speaker || "assistant",
                    text: entry.text,
                    timestamp: entry.timestamp || new Date().toISOString(),
                  },
                ]);

                addToConversationLog(
                  entry.speaker === "user" ? "user" : "assistant",
                  entry.text
                );

                addDebugInfo(
                  `📝 Added initial transcript ${index + 1}: ${
                    entry.speaker
                  }: ${entry.text.substring(0, 30)}...`
                );
              }, index * 300); // 300ms delay between each
            });
          } else if (data.type === "heartbeat") {
            console.log(`💓 SSE heartbeat received for call: ${callId}`);
            addDebugInfo(
              `💓 SSE heartbeat - connection alive for call: ${callId}`
            );
          } else if (data.type === "error") {
            console.error(`❌ SSE error for call ${callId}:`, data.message);
            addDebugInfo(`❌ SSE error for call ${callId}: ${data.message}`);
          } else {
            console.log(`❓ Unknown SSE message type: ${data.type}`);
            addDebugInfo(`❓ Unknown SSE message type: ${data.type}`);
          }
        } catch (error) {
          console.error("❌ Error parsing SSE message:", error);
          addDebugInfo(`❌ Error parsing SSE message: ${error}`);
        }
      };

      eventSource.onerror = (error) => {
        console.error(`❌ SSE error event for call ${callId}:`, error);
        console.log(`📊 Event source ready state: ${eventSource.readyState}`);
        addDebugInfo(
          `❌ SSE connection error for call ${callId} - Ready state: ${eventSource.readyState}`
        );

        if (eventSource.readyState === EventSource.CLOSED) {
          addDebugInfo(`🔴 SSE connection closed for call ${callId}`);
        }
      };
    },
    [addDebugInfo]
  );

  // Handle transcript updates from Event Stream
  const handleTranscriptFromEvent = (callId: string, eventData: any) => {
    console.log("🎙️ Processing transcript from event:", eventData);

    // This will need to be adapted based on the actual format
    // that Bland.AI sends in their event stream
    if (eventData.level === "call" && eventData.category === "info") {
      // Try to extract transcript information from the message
      const message = eventData.message;

      // Look for transcript-related messages
      if (message.includes("transcript") || message.includes("speaking")) {
        addDebugInfo(`📝 Potential transcript in message: ${message}`);

        // For now, just log the event - we'll need to see the actual format
        // to properly parse transcript data
        console.log("📝 Transcript-related event:", eventData);
      }
    }
  };

  // Disconnect from SSE stream
  const disconnectFromTranscriptStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      addDebugInfo("Disconnected from transcript stream");
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    addDebugInfo("Voice trading interface ready");
    setIsConnected(true);

    // Check account balance on load
    checkAccountBalance();
  }, []);

  // Cleanup SSE connection on unmount
  useEffect(() => {
    return () => {
      disconnectFromTranscriptStream();
    };
  }, []);

  const initiateCall = async () => {
    if (!phoneNumber.trim()) {
      addDebugInfo("Please enter a phone number");
      return;
    }

    try {
      setIsCallInProgress(true);
      setCallStatus("Initiating call...");
      setRealTimeTranscript([]); // Clear previous transcript
      addDebugInfo(`Initiating call to ${phoneNumber}`);
      addToConversationLog("system", `Calling ${phoneNumber}...`);

      const response = await fetch("/api/bland-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          pathwayId: PATHWAY_ID,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle different types of errors
        if (errorData.errorType === "billing") {
          addDebugInfo(`💳 Billing Error: ${errorData.error}`);
          addToConversationLog(
            "system",
            `❌ Billing Issue: ${errorData.error}`
          );
          setCallStatus(
            "❌ Billing Error - Please add credits to your Bland.AI account"
          );
        } else {
          addDebugInfo(`❌ API Error: ${errorData.error}`);
          addToConversationLog("system", `❌ Error: ${errorData.error}`);
          setCallStatus("❌ Call Failed");
        }

        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      addDebugInfo("Call initiated successfully");
      setCallStatus("Call in progress...");
      setCurrentCallId(result.callId);
      setWebhookConfigured(result.webhookConfigured || false);

      // Add detailed debugging
      addDebugInfo(`Webhook configured: ${result.webhookConfigured}`);
      addDebugInfo(`Call ID: ${result.callId}`);

      // CRITICAL: Establish SSE connection IMMEDIATELY - no delays!
      if (result.callId) {
        addDebugInfo(
          `🚀 IMMEDIATELY establishing SSE connection for: ${result.callId}`
        );
        connectToTranscriptStream(result.callId);
        addDebugInfo(
          "✅ SSE connection initiated - ready for real-time transcripts"
        );
      }

      if (result.webhookConfigured) {
        addToConversationLog(
          "system",
          "Call connected! Your AI trading assistant will guide you through the process. Real-time transcript will appear below."
        );
      } else {
        addToConversationLog(
          "system",
          "Call connected! Your AI trading assistant will guide you through the process. (Real-time transcript unavailable in development)"
        );
      }

      // Start polling call status
      if (result.callId) {
        if (!result.webhookConfigured) {
          addDebugInfo(
            "Note: Real-time transcript may be limited without webhook configuration"
          );
        }

        pollCallStatus(result.callId);
      }
    } catch (error) {
      addDebugInfo(`Error initiating call: ${error}`);
      setCallStatus("Call failed");
      setIsCallInProgress(false);
      addToConversationLog(
        "system",
        "Call failed to connect. Please try again."
      );
      // Clean up SSE connection on error
      disconnectFromTranscriptStream();
    }
  };

  const pollCallStatus = async (callId: string) => {
    try {
      const response = await fetch(`/api/bland-call-status?callId=${callId}`);
      const result = await response.json();

      if (result.status === "completed") {
        setIsCallInProgress(false);
        setCallStatus("Call completed");
        addDebugInfo("Call completed");
        addToConversationLog("system", "Call completed successfully!");
        disconnectFromTranscriptStream();

        // Add call transcript if available
        if (result.transcript) {
          addToConversationLog("system", `Call Summary: ${result.transcript}`);
        }
      } else if (result.status === "failed") {
        setIsCallInProgress(false);
        setCallStatus("Call failed");
        addDebugInfo("Call failed");
        addToConversationLog("system", "Call failed or was disconnected.");
        disconnectFromTranscriptStream();
      } else {
        // Continue polling
        setTimeout(() => pollCallStatus(callId), 3000);
      }
    } catch (error) {
      addDebugInfo(`Error checking call status: ${error}`);
    }
  };

  const handleReset = () => {
    addDebugInfo("Resetting interface...");
    setConversationLog([]);
    setRealTimeTranscript([]);
    setCallStatus("");
    setIsCallInProgress(false);
    setPhoneNumber("");
    setCurrentCallId("");
    setWebhookConfigured(false);
    disconnectFromTranscriptStream();
  };

  // Debug function to test SSE transcript functionality
  const testTranscript = async () => {
    if (!currentCallId) {
      addDebugInfo("❌ No active call ID - start a call first to test");
      return;
    }

    try {
      addDebugInfo("🧪 Testing transcript broadcast...");

      const response = await fetch("/api/debug-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          callId: currentCallId,
          text: "This is a test transcript message to verify SSE functionality is working correctly.",
          speaker: "assistant",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      addDebugInfo(`✅ Test transcript sent: ${result.message}`);
    } catch (error) {
      addDebugInfo(`❌ Test transcript failed: ${error}`);
    }
  };

  // Simple SSE test function
  const testSSE = () => {
    addDebugInfo("🧪 Starting SSE basic test...");

    const testEventSource = new EventSource("/api/test-sse");

    testEventSource.onopen = () => {
      addDebugInfo("✅ SSE test connection opened");
      console.log("✅ SSE test onopen event fired");
      console.log("📊 SSE test ready state:", testEventSource.readyState);
    };

    testEventSource.onmessage = (event) => {
      try {
        console.log("🔍 ===== SSE TEST MESSAGE RECEIVED =====");
        console.log("📦 Raw test event data:", event.data);
        console.log(
          "📊 Test event source ready state:",
          testEventSource.readyState
        );

        const data = JSON.parse(event.data);
        console.log("📋 Parsed test data:", data);
        addDebugInfo(
          `📨 SSE test message: ${data.type} - ${data.message || data.counter}`
        );

        if (data.type === "completed") {
          testEventSource.close();
          addDebugInfo("🏁 SSE test completed successfully");
        }
      } catch (error) {
        console.error("❌ SSE test parse error:", error);
        addDebugInfo(`❌ SSE test parse error: ${error}`);
      }
    };

    testEventSource.onerror = (error) => {
      console.error("❌ SSE test connection error:", error);
      console.error(
        "📊 Test event source ready state:",
        testEventSource.readyState
      );
      console.error("📊 Test event source URL:", testEventSource.url);
      addDebugInfo(
        `❌ SSE test connection error - Ready state: ${testEventSource.readyState}`
      );
      testEventSource.close();
    };
  };

  // Test Transcript Stream API
  const testTranscriptSSE = () => {
    if (!currentCallId) {
      addDebugInfo("❌ No active call to test Transcript Stream");
      return;
    }

    addDebugInfo("🧪 Testing Transcript Stream API...");

    // Create a test connection to the Transcript Stream
    const testEventSource = new EventSource(
      `/api/transcript-stream?callId=${currentCallId}`
    );

    testEventSource.onopen = () => {
      console.log("✅ Transcript Stream test onopen event fired");
      console.log(
        "📊 Transcript Stream test ready state:",
        testEventSource.readyState
      );
      addDebugInfo("✅ Transcript Stream test connection opened");
    };

    testEventSource.onmessage = (event) => {
      console.log("🔍 ===== TRANSCRIPT STREAM TEST MESSAGE RECEIVED =====");
      console.log("📦 Raw test event data:", event.data);
      console.log(
        "📊 Test event source ready state:",
        testEventSource.readyState
      );

      try {
        const data = JSON.parse(event.data);
        console.log("📋 Parsed test data:", data);
        addDebugInfo(
          `📨 Transcript Stream test message: ${data.type} - ${
            data.message || data.text || "N/A"
          }`
        );
      } catch (error) {
        console.error("❌ Error parsing Transcript Stream test data:", error);
        addDebugInfo(`❌ Error parsing Transcript Stream test data: ${error}`);
      }
    };

    testEventSource.onerror = (error) => {
      console.error("❌ Transcript Stream test error:", error);
      console.log(
        "📊 Transcript Stream test ready state:",
        testEventSource.readyState
      );
      addDebugInfo(
        `❌ Transcript Stream test error - Ready state: ${testEventSource.readyState}`
      );
    };

    // Close the test connection after 10 seconds
    setTimeout(() => {
      testEventSource.close();
      addDebugInfo("🔚 Transcript Stream test connection closed");
    }, 10000);
  };

  // Test full SSE flow with proper timing
  const testFullSSEFlow = async () => {
    addDebugInfo("🧪 Testing full SSE flow with proper timing...");

    // Generate a test call ID
    const testCallId = `test_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    addDebugInfo(`🆔 Using test call ID: ${testCallId}`);

    // Step 1: Establish SSE connection FIRST
    addDebugInfo("📡 Step 1: Establishing SSE connection...");
    connectToTranscriptStream(testCallId);

    // Step 2: Wait for connection to establish
    addDebugInfo("⏳ Step 2: Waiting for SSE connection to establish...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Step 3: Send test transcript via webhook simulation
    addDebugInfo("📝 Step 3: Sending test transcript...");
    try {
      const response = await fetch("/api/debug-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          callId: testCallId,
          text: "This is a test transcript to verify the full SSE flow is working correctly with proper timing.",
          speaker: "assistant",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      addDebugInfo(`✅ Test transcript sent: ${result.message}`);
      addDebugInfo(
        "🎯 If SSE is working properly, you should see the transcript appear above!"
      );
    } catch (error) {
      addDebugInfo(`❌ Test transcript failed: ${error}`);
    }
  };

  return (
    <TradingLayout
      navigation={
        <TopNavigation
          currentTime={currentTime}
          conversationStep="ready"
          onReset={handleReset}
        />
      }
      mainContent={
        <div className="w-full max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">📞</div>
            <h1 className="text-4xl font-bold text-white mb-2">
              VoiceTrader Pro
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              AI-Powered Voice Trading Assistant
            </p>
          </div>

          {/* Phone Input Section */}
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800/50 rounded-lg p-8 text-center space-y-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              🚀 Start Voice Trading
            </h2>

            {!isConnected ? (
              <div className="space-y-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-gray-300">Initializing voice interface...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Phone Number Input */}
                <div className="max-w-md mx-auto">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Enter your phone number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1234567890"
                    disabled={isCallInProgress}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Include country code (e.g., +1 for US)
                  </p>
                </div>
                {/* Call Button */}
                <div className="flex justify-center">
                  <button
                    onClick={initiateCall}
                    disabled={
                      !isConnected ||
                      isCallInProgress ||
                      !phoneNumber.trim() ||
                      (accountInfo &&
                        !accountInfo.isFreeAccount &&
                        (accountInfo.hasEnoughBalance === false ||
                          accountInfo.hasEnoughBalance === null))
                    }
                    className={`
                      relative px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105
                      ${
                        isCallInProgress
                          ? "bg-yellow-600 border-yellow-400 cursor-not-allowed"
                          : accountInfo &&
                            !accountInfo.isFreeAccount &&
                            (accountInfo.hasEnoughBalance === false ||
                              accountInfo.hasEnoughBalance === null)
                          ? "bg-red-600 border-red-400 cursor-not-allowed"
                          : "bg-green-600 border-green-400 hover:bg-green-700 shadow-lg shadow-green-500/50"
                      }
                      ${
                        !isConnected ||
                        !phoneNumber.trim() ||
                        (accountInfo &&
                          !accountInfo.isFreeAccount &&
                          (accountInfo.hasEnoughBalance === false ||
                            accountInfo.hasEnoughBalance === null))
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }
                      text-white border-2
                    `}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="text-2xl">
                        {isCallInProgress
                          ? "⏳"
                          : accountInfo &&
                            !accountInfo.isFreeAccount &&
                            (accountInfo.hasEnoughBalance === false ||
                              accountInfo.hasEnoughBalance === null)
                          ? "💳"
                          : "📞"}
                      </div>
                      <span>
                        {isCallInProgress
                          ? "Calling..."
                          : accountInfo &&
                            !accountInfo.isFreeAccount &&
                            (accountInfo.hasEnoughBalance === false ||
                              accountInfo.hasEnoughBalance === null)
                          ? "Insufficient Balance"
                          : "Start Voice Trading"}
                      </span>
                    </div>
                  </button>
                </div>

                {/* Call Status */}
                {callStatus && (
                  <div className="text-center">
                    <p className="text-lg text-blue-300 font-medium">
                      {callStatus}
                    </p>
                  </div>
                )}

                <div className="text-center space-y-2">
                  <p className="text-lg text-gray-300">
                    {isCallInProgress
                      ? "📱 Answer your phone - our AI trading assistant is calling!"
                      : "Click the button above to receive a call from our AI trading assistant"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {isCallInProgress
                      ? "The AI will guide you through the entire trading process via voice"
                      : "You'll receive a phone call and can speak naturally with our AI"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Real-Time Transcript */}
          {realTimeTranscript.length > 0 && (
            <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-800/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4 text-center flex items-center justify-center space-x-2">
                <span className="animate-pulse">🎙️</span>
                <span>Live Conversation</span>
                <span className="animate-pulse">🎙️</span>
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {realTimeTranscript.map((entry, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      entry.speaker === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`
                        max-w-xs lg:max-w-md px-4 py-3 rounded-lg text-sm
                        ${
                          entry.speaker === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-purple-600 text-white"
                        }
                      `}
                    >
                      <div className="font-medium text-xs mb-1 opacity-75">
                        {entry.speaker === "user"
                          ? "👤 You"
                          : "🤖 AI Assistant"}
                      </div>
                      <div className="leading-relaxed">{entry.text}</div>
                      <div className="text-xs opacity-50 mt-1">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {isCallInProgress && (
                <div className="text-center mt-4">
                  <div className="inline-flex items-center space-x-2 text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">
                      Live conversation in progress...
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Development Notice for Real-Time Transcript */}
          {isCallInProgress && !webhookConfigured && (
            <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-400 mb-3 text-center">
                ⚠️ Development Mode Notice
              </h3>
              <div className="text-center space-y-2">
                <p className="text-yellow-300 text-sm">
                  Real-time transcript is not available in development mode
                  because Bland.AI requires HTTPS webhooks.
                </p>
                <p className="text-yellow-200 text-xs">
                  Your call is working perfectly! To enable real-time
                  transcript:
                </p>
                <div className="bg-yellow-900/30 rounded p-3 mt-3">
                  <p className="text-yellow-100 text-xs font-mono">
                    1. Use ngrok:{" "}
                    <code className="bg-black/30 px-1 rounded">
                      ngrok http 3000
                    </code>
                    <br />
                    2. Set NEXT_PUBLIC_WEBHOOK_URL in .env.local to your ngrok
                    HTTPS URL
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Conversation Log */}
          {conversationLog.length > 0 && (
            <div className="bg-gray-800/30 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4 text-center">
                📋 Call Activity
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {conversationLog.map((entry, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      entry.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`
                      max-w-xs lg:max-w-md px-4 py-2 rounded-lg text-sm
                      ${
                        entry.type === "user"
                          ? "bg-blue-600 text-white"
                          : entry.type === "system"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-700 text-gray-100"
                      }
                    `}
                    >
                      <div className="font-medium text-xs mb-1 opacity-75">
                        {entry.type === "user"
                          ? "👤 You"
                          : entry.type === "system"
                          ? "🔔 System"
                          : "🤖 AI Assistant"}
                      </div>
                      <div>{entry.message}</div>
                      <div className="text-xs opacity-50 mt-1">
                        {entry.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Debug Panel */}
          {debugInfo.length > 0 && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">
                🔧 Debug Information
              </h3>
              <div className="space-y-1">
                {debugInfo.map((info, index) => (
                  <p key={index} className="text-xs text-gray-500 font-mono">
                    {info}
                  </p>
                ))}
              </div>
              {/* Debug Test Button */}
              <div className="mt-4 pt-3 border-t border-gray-600">
                <div className="space-x-2 mb-2">
                  <button
                    onClick={testSSE}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Test Basic SSE
                  </button>
                  <button
                    onClick={testTranscript}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Test Transcript SSE
                  </button>
                  <button
                    onClick={testTranscriptSSE}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    disabled={!currentCallId}
                  >
                    Test Transcript Stream
                  </button>
                  <button
                    onClick={testFullSSEFlow}
                    className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
                  >
                    Test Full SSE Flow
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  {currentCallId
                    ? "Test SSE connection and transcript functionality"
                    : "Test basic SSE connection (transcript test requires active call)"}
                </p>
              </div>
            </div>
          )}

          {/* Trading Flow Preview */}
          <div className="bg-gray-800/30 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4 text-center">
              📋 Expected Voice Trading Flow
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">
                  1
                </span>
                <div>
                  <span className="text-blue-400 font-medium">
                    You receive call:
                  </span>
                  <span className="text-gray-300 ml-2">
                    AI calls your phone number
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">
                  2
                </span>
                <div>
                  <span className="text-purple-400 font-medium">
                    AI greets you:
                  </span>
                  <span className="text-gray-300 ml-2">
                    "Hello! I'm your AI trading assistant. Ready to start
                    trading?"
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">
                  3
                </span>
                <div>
                  <span className="text-blue-400 font-medium">
                    You respond:
                  </span>
                  <span className="text-gray-300 ml-2">
                    "Yes, I want to trade on Binance"
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">
                  4
                </span>
                <div>
                  <span className="text-purple-400 font-medium">
                    AI continues:
                  </span>
                  <span className="text-gray-300 ml-2">
                    "Great! Which symbol would you like to trade?"
                  </span>
                </div>
              </div>
              <div className="text-center text-gray-500 text-xs mt-4">
                ... continues through symbol, price, quantity, and confirmation
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                📞 Phone-Based Trading
              </h3>
              <p className="text-gray-400 text-sm">
                Receive a call from our AI and speak naturally to place OTC
                orders. No apps or websites needed!
              </p>
            </div>

            <div className="bg-gray-800/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                🎙️ Live Transcript
              </h3>
              <p className="text-gray-400 text-sm">
                Watch your conversation unfold in real-time on the website while
                you speak on the phone.
              </p>
            </div>

            <div className="bg-gray-800/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                📊 Real-Time Prices
              </h3>
              <p className="text-gray-400 text-sm">
                AI fetches live market prices from major exchanges during your
                phone conversation.
              </p>
            </div>

            <div className="bg-gray-800/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                🔒 Safe & Secure
              </h3>
              <p className="text-gray-400 text-sm">
                No real orders placed. Voice-based confirmation system for OTC
                trading discussions.
              </p>
            </div>
          </div>

          {/* Billing Information */}
          <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-800/50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-yellow-400 mb-4 text-center flex items-center justify-center space-x-2">
              <span>💳</span>
              <span>Bland.AI Credits Required</span>
            </h3>
            <div className="space-y-4">
              {/* Account Balance Display */}
              {accountInfo && (
                <div className="bg-yellow-900/30 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-yellow-200 font-semibold">
                      Your Account Status:
                    </h4>
                    <button
                      onClick={checkAccountBalance}
                      disabled={balanceLoading}
                      className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded transition-colors disabled:opacity-50"
                    >
                      {balanceLoading ? "Checking..." : "Refresh"}
                    </button>
                  </div>

                  {accountInfo.isFreeAccount ? (
                    // Free Account Display
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">🆓</span>
                        <div>
                          <p className="text-yellow-300 font-semibold">
                            Free Account Detected
                          </p>
                          <p className="text-yellow-200 text-sm">
                            Balance information not available on free accounts
                          </p>
                        </div>
                      </div>

                      <div className="bg-blue-900/30 rounded border border-blue-800 p-3">
                        <h5 className="text-blue-300 font-semibold mb-2">
                          🎯 Free Account Limitations:
                        </h5>
                        <ul className="text-blue-200 text-sm space-y-1 list-disc list-inside">
                          <li>
                            Limited API access (balance checking not available)
                          </li>
                          <li>May have call limits or restrictions</li>
                          <li>Reduced features compared to paid accounts</li>
                        </ul>
                      </div>

                      <div className="bg-green-900/30 rounded border border-green-800 p-3">
                        <h5 className="text-green-300 font-semibold mb-2">
                          💡 To Enable Full Features:
                        </h5>
                        <ol className="text-green-200 text-sm space-y-1 list-decimal list-inside">
                          <li>
                            Visit{" "}
                            <a
                              href="https://app.bland.ai"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-300 hover:text-green-200 underline"
                            >
                              app.bland.ai
                            </a>
                          </li>
                          <li>Upgrade to a paid plan</li>
                          <li>Add credits to your account</li>
                          <li>Enjoy unlimited API access and features</li>
                        </ol>
                      </div>
                    </div>
                  ) : (
                    // Paid Account Display
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-yellow-300">Balance: </span>
                        <span
                          className={`font-mono ${
                            accountInfo.hasEnoughBalance
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          $
                          {accountInfo.billing.currentBalance?.toFixed(2) ||
                            "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-yellow-300">Total Calls: </span>
                        <span className="text-yellow-100">
                          {accountInfo.totalCalls || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-yellow-300">Status: </span>
                        <span className="text-yellow-100 capitalize">
                          {accountInfo.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-yellow-300">Ready to Call: </span>
                        <span
                          className={
                            accountInfo.hasEnoughBalance
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          {accountInfo.hasEnoughBalance ? "✅ Yes" : "❌ No"}
                        </span>
                      </div>
                    </div>
                  )}

                  {!accountInfo.isFreeAccount &&
                    (accountInfo.hasEnoughBalance === false ||
                      accountInfo.hasEnoughBalance === null) && (
                      <div className="mt-3 p-3 bg-red-900/30 rounded border border-red-800">
                        <p className="text-red-300 text-sm font-semibold">
                          ⚠️ Insufficient Balance
                        </p>
                        <p className="text-red-200 text-xs mt-1">
                          You need at least $0.15 to make a call. Please add
                          credits to continue.
                        </p>
                      </div>
                    )}
                </div>
              )}

              <div className="text-center">
                <p className="text-yellow-300 mb-2">
                  Phone calls require credits in your Bland.AI account
                </p>
                <p className="text-yellow-200 text-sm">
                  Typical cost: ~$0.05-$0.15 per minute
                </p>
              </div>

              <div className="bg-yellow-900/30 rounded-lg p-4">
                <h4 className="text-yellow-200 font-semibold mb-2">
                  How to Add Credits:
                </h4>
                <ol className="text-yellow-100 text-sm space-y-1 list-decimal list-inside">
                  <li>
                    Visit{" "}
                    <a
                      href="https://app.bland.ai"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-300 hover:text-yellow-200 underline"
                    >
                      app.bland.ai
                    </a>
                  </li>
                  <li>Log into your account</li>
                  <li>Navigate to "Billing" or "Credits" section</li>
                  <li>Purchase credits (minimum $5-10 recommended)</li>
                  <li>Return here and click "Refresh" to update balance</li>
                </ol>
              </div>

              <div className="text-center">
                <p className="text-yellow-200 text-xs">
                  ⚠️ If you see "Insufficient balance" error, you need to add
                  credits first
                </p>
              </div>
            </div>
          </div>

          {/* Free Account Notice */}
          {accountInfo?.isFreeAccount && (
            <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-800/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-blue-400 mb-4 text-center flex items-center justify-center space-x-2">
                <span>🆓</span>
                <span>Free Account - Try Making a Call!</span>
              </h3>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-blue-300 mb-2">
                    You can still try making calls with your free account
                  </p>
                  <p className="text-blue-200 text-sm">
                    Free accounts may have usage limits, but basic calling
                    should work
                  </p>
                </div>

                <div className="bg-blue-900/30 rounded-lg p-4">
                  <h4 className="text-blue-200 font-semibold mb-2">
                    What to Expect:
                  </h4>
                  <ul className="text-blue-100 text-sm space-y-1 list-disc list-inside">
                    <li>You may encounter usage limits or restrictions</li>
                    <li>Some advanced features might not be available</li>
                    <li>If calls fail due to limits, consider upgrading</li>
                    <li>Basic voice trading functionality should still work</li>
                  </ul>
                </div>

                <div className="text-center">
                  <p className="text-blue-200 text-xs">
                    💡 If you encounter "Insufficient balance" errors, upgrade
                    to a paid plan at{" "}
                    <a
                      href="https://app.bland.ai"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 hover:text-blue-200 underline"
                    >
                      app.bland.ai
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="text-center">
            {isConnected ? (
              <div className="inline-flex items-center space-x-2 bg-green-900/20 border border-green-800 rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">
                  {isCallInProgress ? "Call In Progress" : "Ready to Call"}
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center space-x-2 bg-yellow-900/20 border border-yellow-800 rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-yellow-400 text-sm font-medium">
                  Initializing...
                </span>
              </div>
            )}
          </div>
        </div>
      }
    />
  );
};

export default TradingInterface;
