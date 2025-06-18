# Bland.AI Voice Bot Setup Guide

## Overview

This guide will help you integrate Bland.AI's Chat Widget with your VoiceTrader Pro application to create a professional **voice bot** that works directly on your website.

## What You're Building

**Voice Bot Interface**: Users click a button on your website → Chat widget appears → They speak into their microphone → AI responds with voice

**NOT a phone calling system** - this is a web-based voice chat experience.

## Prerequisites

1. Bland.AI account with dashboard access
2. Basic understanding of Conversational Pathways
3. Microphone-enabled device for testing

## Step 1: Create Your Trading Pathway

1. Sign up at [Bland.AI](https://bland.ai)
2. Go to your dashboard → **Pathways**
3. Click **"Create New Pathway"**
4. Set up your pathway with this configuration:

### Pathway Configuration

**Name**: `OTC Trading Assistant`

**Initial Prompt**:

```
You are a professional OTC trading assistant. Guide users through placing an OTC order step by step.

CONVERSATION FLOW:
1. Greet professionally and ask for exchange choice: OKX, Bybit, Deribit, or Binance
2. Once exchange is chosen, ask which symbol they want to trade
3. Show current market price for their symbol
4. Ask for order quantity and desired price
5. Confirm all order details back to them

IMPORTANT RULES:
- Be concise and professional
- Only proceed when you have required information
- Always confirm details before moving forward
- No real orders will be placed - this is confirmation only
- If they ask unrelated questions, redirect to trading flow

Start by greeting them and asking which exchange they'd like to use.
```

**Voice Settings**:

- Voice: `maya` (professional female voice)
- Speed: `1.0`
- Language: `en`

5. **Save your pathway** and copy the **Pathway ID**

## Step 2: Configure Your Application

### Add Pathway ID

1. Start your Next.js application:

```bash
npm run dev
```

2. Open your browser to `http://localhost:3000`
3. Enter your **Pathway ID** in the input field
4. Click **"🎤 Activate Voice Trading"**

### Expected Behavior

1. **Widget Loads**: A chat button appears in the bottom-right corner
2. **Click to Start**: Click the chat button to open the voice interface
3. **Voice Interaction**:
   - Click the microphone button to speak
   - AI responds with voice
   - Continue the conversation naturally

## Step 3: Test the Voice Bot

### Basic Voice Flow Test

1. Click the chat widget button
2. Click the microphone and say: _"Hello, I want to start trading"_
3. AI should respond asking for exchange choice
4. Say: _"I want to use Binance"_
5. AI should ask for symbol selection
6. Continue the flow...

### Expected Conversation Flow

```
User: "Hello, I want to start trading"
AI: "Hello! I'm your OTC trading assistant. Which exchange would you like to use: OKX, Bybit, Deribit, or Binance?"

User: "Binance"
AI: "Great choice! Which symbol would you like to trade on Binance?"

User: "Bitcoin USDT"
AI: "I see you want to trade BTCUSDT. The current market price is $43,255. What quantity would you like to trade and at what price?"

User: "I want to buy 0.1 Bitcoin at $43,000"
AI: "Let me confirm your order: You want to buy 0.1 BTCUSDT at $43,000 on Binance. Is this correct?"
```

## Step 4: Customize the Widget

You can customize the widget appearance by modifying the configuration in `TradingInterface.tsx`:

```typescript
(window as any).BLAND_CHAT_CONFIG = {
  pathwayId: pathwayId,
  position: "bottom-right", // Widget position
  primaryColor: "#3B82F6", // Main color
  buttonBackgroundColor: "#3B82F6", // Button color
  headerBackgroundColor: "#1F2937", // Header color
  chatTitle: "🎤 VoiceTrader Pro", // Widget title
  width: 400, // Widget width
  height: 600, // Widget height
  buttonSize: 70, // Button size
};
```

## Step 5: Add Real Exchange Data (Optional)

To make the bot more realistic, you can integrate real exchange APIs:

### Create Exchange API Service

```typescript
// src/services/exchangeAPI.ts
export async function getBinancePrices() {
  const response = await fetch("https://api.binance.com/api/v3/ticker/price");
  return response.json();
}

export async function getOKXPrices() {
  const response = await fetch(
    "https://www.okx.com/api/v5/market/tickers?instType=SPOT"
  );
  return response.json();
}
```

### Update Pathway with Webhook

1. In your Bland.AI pathway, add a **Webhook Node**
2. Set webhook URL to: `https://your-domain.com/api/exchange-data`
3. Create the webhook handler to return real price data

## Troubleshooting

### Common Issues

1. **Widget not loading**: Check browser console for script errors
2. **No voice response**: Ensure microphone permissions are granted
3. **Pathway not found**: Verify Pathway ID is correct
4. **Voice not working**: Check browser microphone settings

### Debug Mode

Open browser developer tools and check:

- Console for any JavaScript errors
- Network tab for failed requests
- Microphone permissions in browser settings

## Advanced Features

### Custom Voice Commands

Add these to your pathway prompt:

```
VOICE COMMANDS:
- "start over" → Reset conversation
- "repeat that" → Repeat last response
- "help" → Show available commands
- "cancel" → End conversation
```

### Multi-Language Support

Update pathway voice settings:

```
- Language: "es" (Spanish)
- Language: "fr" (French)
- Language: "de" (German)
```

## Production Deployment

### Environment Considerations

1. **HTTPS Required**: Voice features require secure connection
2. **Microphone Permissions**: Users must grant microphone access
3. **Browser Compatibility**: Test on Chrome, Firefox, Safari
4. **Mobile Support**: Ensure widget works on mobile devices

### Performance Optimization

1. **Lazy Load Widget**: Only load when needed
2. **Cache Pathway**: Store pathway configuration
3. **Error Handling**: Graceful fallbacks for voice failures

## Next Steps

1. ✅ Test basic voice interaction
2. ✅ Customize widget appearance
3. 🔄 Add real exchange API integration
4. 🔄 Implement conversation analytics
5. 🔄 Add voice command shortcuts
6. 🔄 Deploy to production with HTTPS

## Support Resources

- **Bland.AI Docs**: https://docs.bland.ai/
- **Chat Widget Guide**: https://docs.bland.ai/tutorials/chat-widget
- **Pathways Documentation**: https://docs.bland.ai/pathways
- **Discord Community**: Join Bland.AI Discord for support

## Key Differences from Phone Calls

| Feature         | Voice Bot (What you have) | Phone Calls             |
| --------------- | ------------------------- | ----------------------- |
| **Interface**   | Web chat widget           | Phone call              |
| **Activation**  | Click button on website   | Dial phone number       |
| **Device**      | Computer/mobile browser   | Any phone               |
| **Setup**       | Pathway ID only           | Phone numbers, webhooks |
| **Cost**        | Per conversation          | Per minute              |
| **Integration** | JavaScript widget         | API calls               |
