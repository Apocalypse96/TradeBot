# 🎤 Voice-Operated OTC Trading Bot

A web-based voice-operated trading bot for Over-the-Counter (OTC) digital asset trades using modern web technologies, exchange APIs, and AI-powered phone calls.

## 🚀 Features

- **Dual Voice Options**: Browser voice recognition AND AI-powered phone calls
- **Browser Voice**: Uses Web Speech API for natural voice commands
- **Phone Integration**: AI assistant calls you via Bland.ai platform
- **Multi-Exchange Support**: Supports OKX, Bybit, Deribit, and Binance
- **Real-time Pricing**: Fetches live cryptocurrency prices
- **Interactive UI**: Modern, responsive interface with real-time feedback
- **Conversation Flow**: Guided voice-driven trading experience

## 🛠️ Tech Stack

- **Frontend**: Next.js 13.5.6, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Next.js API Routes
- **Voice**: Web Speech API (SpeechRecognition) + Bland.ai platform
- **APIs**: Exchange REST APIs (Binance, OKX, etc.) + Bland.ai API
- **Styling**: Tailwind CSS with custom components

## 📋 Prerequisites

- Node.js 18.13.0 or higher
- Modern browser with Web Speech API support (Chrome, Edge, Safari) for browser voice
- Microphone access for browser voice option
- Bland.ai API key for phone call functionality (optional)

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd TradeBot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with:

   ```env
   # Bland.ai Configuration (Required for phone call functionality)
   BLAND_AI_API_KEY=your_bland_ai_api_key_here
   BLAND_AI_PHONE_NUMBER=your_bland_ai_phone_number_here
   BLAND_AI_WEBHOOK_URL=https://yourdomain.com/api/webhooks/bland

   # Exchange API Keys (optional - using public endpoints for demo)
   BINANCE_API_KEY=your_binance_api_key_here
   BINANCE_API_SECRET=your_binance_api_secret_here
   # ... other exchange keys
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

### Two Voice Options Available:

#### 🎤 Browser Voice (Immediate)

- Click and hold the microphone button
- Speak your commands directly to the browser
- Real-time processing with instant feedback

#### 📞 Phone Call (AI Assistant)

- Enter your phone number
- Click "Start Call" to receive a call from our AI assistant
- Have a natural conversation over the phone

### Voice Commands Flow

1. **Start Trading**: Say "start trading" (browser) or answer the phone call
2. **Select Exchange**: Say one of: "OKX", "Bybit", "Deribit", or "Binance"
3. **Choose Symbol**: Say a cryptocurrency name like "Bitcoin", "Ethereum", etc.
4. **Place Order**: Specify quantity and price, e.g., "0.1 Bitcoin at 45000 dollars"
5. **Confirmation**: Review and confirm your simulated order

### Example Conversations

#### Browser Voice:

```
You: "Start trading"
Bot: "Hello! I'll help you place an OTC trade. Please select an exchange..."

You: "Binance"
Bot: "Great! You selected Binance. Available symbols include: BTC, ETH, SOL..."

You: "Bitcoin"
Bot: "The current price of BTCUSDT is $105,004.99. How much would you like to trade?"

You: "0.1 Bitcoin at 104000 dollars"
Bot: "Order confirmed! You want to trade 0.1 BTCUSDT at $104,000 on Binance..."
```

#### Phone Call:

```
AI: "Hello! I'm your OTC trading assistant. Which exchange would you like to use?"
You: "I'd like to use Binance"
AI: "Perfect! Binance selected. Which cryptocurrency interests you today?"
You: "Bitcoin please"
AI: "Bitcoin is currently trading at $105,004.99. What's your order?"
You: "I want to buy 0.1 Bitcoin at 104,000 dollars"
AI: "Confirmed! 0.1 Bitcoin at $104,000 on Binance. This is a simulation."
```

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── exchanges/     # Exchange API endpoints
│   │   ├── calls/         # Bland.ai call management
│   │   └── webhooks/      # Webhook handlers
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Main page
├── components/            # React components
│   └── TradingInterface.tsx
├── hooks/                 # Custom React hooks
│   └── useVoiceRecording.ts
├── lib/                   # Utility libraries
│   ├── exchanges/         # Exchange-specific clients
│   ├── bland-ai.ts       # Bland.ai integration
│   ├── config.ts         # Configuration
│   ├── exchange-client.ts # Base exchange client
│   └── exchange-factory.ts # Exchange factory
└── types/                 # TypeScript type definitions
    ├── index.ts
    └── speech.d.ts
```

## 🔌 API Endpoints

### Exchange APIs

```
GET /api/exchanges/symbols?exchange=Binance
GET /api/exchanges/price?exchange=Binance&symbol=BTCUSDT
```

### Bland.ai Integration

```
POST /api/calls/initiate          # Initiate phone call
GET /api/calls/initiate?callId=x  # Get call status
POST /api/webhooks/bland          # Webhook for call events
```

## 🌐 Browser Compatibility

| Browser | Voice Recognition | Phone Calls | Status           |
| ------- | ----------------- | ----------- | ---------------- |
| Chrome  | ✅ Full Support   | ✅ Yes      | Recommended      |
| Edge    | ✅ Full Support   | ✅ Yes      | Recommended      |
| Safari  | ⚠️ Limited        | ✅ Yes      | Phone calls work |
| Firefox | ❌ Not Supported  | ✅ Yes      | Phone calls only |

## 🔒 Security Notes

- **Demo Mode**: Currently runs in simulation mode - no real trades are executed
- **API Keys**: Keep all API keys secure and never commit them to version control
- **HTTPS**: Voice recognition requires HTTPS in production
- **Permissions**: Browser voice requires microphone permission
- **Phone Privacy**: Phone calls are processed by Bland.ai - review their privacy policy

## 🚧 Development Status

### ✅ Completed Features

- ✅ Browser voice recognition and processing
- ✅ Bland.ai phone call integration
- ✅ Exchange API integration (Binance, OKX)
- ✅ Real-time price fetching
- ✅ Interactive conversation flow (both voice options)
- ✅ Modern responsive UI with dual interface
- ✅ TypeScript implementation
- ✅ Webhook handling for phone conversations

### 🔄 In Progress

- Additional exchange implementations (Bybit, Deribit with real APIs)
- Order execution (currently simulated)
- Enhanced conversation state management

### 📋 Planned Features

- Real order placement (with proper authentication)
- Order history and tracking
- Advanced voice commands
- Multi-language support
- SMS notifications

## 🎯 Bland.ai Setup

To enable phone call functionality:

1. **Sign up for Bland.ai**: Visit [bland.ai](https://bland.ai) and create an account
2. **Get API credentials**: Obtain your API key and phone number
3. **Set webhook URL**: Configure webhook to point to your deployed app
4. **Add environment variables**: Update your `.env.local` file

Example webhook URL for production: `https://yourdomain.com/api/webhooks/bland`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This is a demonstration project. Do not use with real trading credentials or for actual financial transactions without proper security audits and risk management procedures.
