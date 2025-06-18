# 🎬 Voice Trading Bot Demo Script

## 🎯 Two Voice Options Available

### 🎤 **Option 1: Browser Voice** (Immediate)

- Real-time speech recognition in your browser
- Hold-to-speak microphone button
- Instant processing and feedback

### 📞 **Option 2: Phone Call** (AI Assistant)

- AI assistant calls your phone number
- Natural conversation over the phone
- Powered by Bland.ai platform

---

## 🎤 Browser Voice Demo Flow

### 1. Initial Setup

- Open browser to `http://localhost:3000`
- Allow microphone permissions when prompted
- See the dual-interface with both voice options

### 2. Start Trading Session

**Action**: Hold microphone button and say: _"Start trading"_

**Expected Response**:

```
Bot: "Hello! I'll help you place an OTC trade. Please select an exchange: OKX, Bybit, Deribit, or Binance."
```

### 3. Select Exchange

**Action**: Hold microphone button and say: _"Binance"_

**Expected Response**:

```
Bot: "Great! You selected Binance. Available symbols include: ETH, LTC, BNB, NEO, QTUM. Which one would you like to trade?"
```

### 4. Choose Trading Symbol

**Action**: Hold microphone button and say: _"Bitcoin"_

**Expected Response**:

```
Bot: "The current price of BTCUSDT is $105,004.99. How much would you like to trade and at what price?"
```

### 5. Place Order

**Action**: Hold microphone button and say: _"0.1 Bitcoin at 104000 dollars"_

**Expected Response**:

```
Bot: "Order confirmed! You want to trade 0.1 BTCUSDT at $104,000 on Binance. This is a simulation - no real order has been placed."
```

### 6. Auto Reset

- After 5 seconds, the conversation automatically resets
- Ready for next trading session

---

## 📞 Phone Call Demo Flow

### 1. Setup Phone Call

- Enter your phone number in the format: `+1234567890`
- Click "📞 Start Call" button
- Wait for the system to initiate the call

### 2. Answer the Call

**AI Assistant**: _"Hello! I'm your OTC trading assistant. I'll help you place a simulated cryptocurrency trade. To get started, please tell me which exchange you'd like to use: OKX, Bybit, Deribit, or Binance?"_

### 3. Natural Conversation

**You**: _"I'd like to use Binance please"_

**AI Assistant**: _"Great choice! You've selected Binance. Available cryptocurrencies include: BTC, ETH, SOL, LTC, BNB. Which one would you like to trade?"_

**You**: _"Bitcoin"_

**AI Assistant**: _"Perfect! The current market price of BTCUSDT is $105,004.99. How much would you like to trade and at what price?"_

**You**: _"I want to buy 0.1 Bitcoin at 104,000 dollars"_

**AI Assistant**: _"Order confirmed! You want to trade 0.1 units at $104,000. This is a simulation - no real order has been placed. Thank you for using our OTC trading service!"_

---

## 🎯 Key Features to Highlight

### 🎤 Browser Voice Features

- **Real-time Recognition**: Instant speech-to-text conversion
- **Visual Feedback**: Recording indicator and live transcript
- **Natural Language**: Understands conversational commands
- **Error Handling**: Clear guidance for unclear commands

### 📞 Phone Call Features

- **Professional AI**: Human-like conversation flow
- **Call Management**: Real-time call status tracking
- **Natural Speech**: No need for specific command formats
- **Phone Integration**: Works on any phone, anywhere

### 📊 Shared Features

- **Live Market Data**: Real cryptocurrency prices from exchanges
- **Multi-Exchange**: Support for 4 major exchanges
- **Order Simulation**: Safe demo environment
- **Modern UI**: Clean, responsive interface

---

## 🎬 Demo Scenarios

### Scenario 1: Quick Browser Demo

```
1. "Start trading" → Exchange selection
2. "OKX" → Symbol selection
3. "Ethereum" → Price display
4. "2 Ethereum at 2600 dollars" → Order confirmation
```

### Scenario 2: Phone Call Demo

```
1. Enter phone number → Click "Start Call"
2. Answer phone → AI greeting
3. "Bybit" → Exchange confirmed
4. "Solana" → Price information
5. "5 Solana at 100 dollars" → Order confirmed
```

### Scenario 3: Error Handling

```
Browser: "Coinbase" → "I didn't catch that. Please say one of: OKX, Bybit, Deribit, or Binance."
Phone: "Some random exchange" → AI politely asks for clarification
```

---

## 🛠️ Technical Highlights

### Browser Voice Technology

- **Web Speech API**: Native browser speech recognition
- **TypeScript**: Fully typed for reliability
- **React Hooks**: Modern state management
- **Real-time Processing**: Instant feedback

### Phone Call Technology

- **Bland.ai Platform**: Professional AI voice assistant
- **Webhook Integration**: Real-time conversation handling
- **Natural Language**: Advanced conversation AI
- **Call Management**: Status tracking and control

### Shared Infrastructure

- **Next.js 13**: Modern React framework
- **Exchange APIs**: Live cryptocurrency data
- **Responsive Design**: Works on all devices
- **Error Handling**: Robust error management

---

## 📋 Demo Checklist

### Pre-Demo Setup

- [ ] Application running on `localhost:3000`
- [ ] Microphone permissions granted
- [ ] Phone number ready (for phone demo)
- [ ] Internet connection stable

### Browser Voice Demo

- [ ] Test microphone button functionality
- [ ] Demonstrate hold-to-speak feature
- [ ] Show real-time transcript
- [ ] Complete full trading flow
- [ ] Show error handling

### Phone Call Demo (if Bland.ai configured)

- [ ] Enter valid phone number
- [ ] Initiate call successfully
- [ ] Answer phone and demonstrate conversation
- [ ] Show call status tracking
- [ ] Complete phone trading flow

---

## 🔧 Troubleshooting

### Browser Voice Issues

- **No Microphone Permission**: Refresh page and allow microphone access
- **Voice Not Recognized**: Speak more clearly or closer to microphone
- **Browser Compatibility**: Use Chrome or Edge for best results

### Phone Call Issues

- **Call Not Initiated**: Check Bland.ai API key configuration
- **No Incoming Call**: Verify phone number format (+country code)
- **Call Quality**: Ensure good phone signal/connection

### General Issues

- **API Errors**: Check internet connection and try again
- **Loading Issues**: Wait for API responses to complete
- **Reset Option**: Use reset button to start over anytime

---

## 🎯 Demo Tips

1. **Clear Communication**: Speak clearly and at normal pace
2. **Wait for Responses**: Allow system to process before next command
3. **Show Both Options**: Demonstrate both browser and phone capabilities
4. **Highlight Real Data**: Point out live cryptocurrency prices
5. **Emphasize Safety**: Mention this is simulation mode
6. **Browser Choice**: Recommend Chrome/Edge for browser voice
7. **Phone Format**: Use international format for phone numbers

---

## 🚀 Next Steps After Demo

1. **Bland.ai Setup**: Guide users through API key configuration
2. **Production Deployment**: Show how to deploy with webhooks
3. **Real Trading**: Explain path to live trading integration
4. **Customization**: Discuss additional exchange integrations
5. **Scaling**: Talk about handling multiple users
