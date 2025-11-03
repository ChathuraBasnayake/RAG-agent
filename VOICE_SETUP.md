# 🎙️ Voice Assistant Setup Guide

## Quick Start

Your F1 GPT is now **voice-enabled**! Here's how to set it up:

---

## 1️⃣ Prerequisites

✅ You already have:
- Google API Key (used for both Gemini & TTS)
- Astra DB configured
- Next.js app running

✅ New package installed:
```bash
npm install @google-cloud/text-to-speech
```

---

## 2️⃣ Environment Variables

Your existing `.env` file already works! The voice features use the same `GOOGLE_API_KEY`:

```env
ASTRA_DB_NAMESPACE=default_keyspace
ASTRA_DB_COLLECTION=f1gpt
ASTRA_DB_API_ENDPOINT=https://...
ASTRA_DB_APPLICATION_TOKEN=AstraCS:...
GOOGLE_API_KEY=AIza...  # ✅ Used for both Gemini & TTS
```

**No additional setup needed!** 🎉

---

## 3️⃣ How It Works

### **Voice Input (Speech-to-Text)**
- Uses **Web Speech API** (browser-native)
- FREE & unlimited
- Works in Chrome, Edge, Safari
- Requires microphone permission

### **Voice Output (Text-to-Speech)**
- Uses **Google Cloud TTS**
- FREE tier: 1 million characters/month
- ~200-300 voice responses per month
- Natural-sounding voices

---

## 4️⃣ Using Voice Features

1. **Start the app:**
   ```bash
   npm run dev
   ```

2. **Open browser:** http://localhost:3000

3. **Click the microphone icon** 🎤 in the chat input

4. **Grant microphone permission** (first time only)

5. **Speak your question** - You'll see "Listening..."

6. **AI responds with voice** - Text is also displayed

7. **Click speaker icon** 🔊 to stop audio playback

---

## 5️⃣ Customization

### Change Voice Settings
Edit `lib/textToSpeech.ts`:

```typescript
const defaultConfig: TTSConfig = {
  languageCode: 'en-US',
  voiceName: 'en-US-Neural2-F',  // Female voice
  gender: 'FEMALE',
  speakingRate: 1.0,  // Speed (0.25 - 4.0)
  pitch: 0,           // Pitch (-20 to +20)
  audioEncoding: 'MP3',
};
```

**Available voices:**
- `en-US-Neural2-F` - Female (default)
- `en-US-Neural2-M` - Male
- `en-US-Neural2-C` - Neutral
- `en-GB-Neural2-F` - British Female
- And many more! ([See all voices](https://cloud.google.com/text-to-speech/docs/voices))

### Change Speech Recognition Language
Edit `components/ChatInterface.tsx`:

```typescript
recognitionRef.current.lang = "en-US";  // Change to 'es-ES', 'fr-FR', etc.
```

---

## 6️⃣ Troubleshooting

### "Voice not supported" message
- **Solution:** Use Chrome, Edge, or Safari
- **Why:** Firefox has limited Web Speech API support

### Microphone not working
- **Solution:** Check browser permissions
- **Chrome:** Settings → Privacy → Site Settings → Microphone
- **Allow** localhost to access microphone

### No voice output
- **Check:** Google API key is valid
- **Check:** You're within free tier limits (1M chars/month)
- **Fallback:** Text response is always shown

### Audio cuts off
- **Reason:** Long responses may take time to synthesize
- **Solution:** Increase timeout or split responses

---

## 7️⃣ Cost & Usage

### Free Tier Limits
- **Google Cloud TTS:** 1 million characters/month FREE
- **Web Speech API:** Unlimited, browser-native

### Estimated Usage
- Average response: ~500 characters
- **2,000 voice responses/month FREE**
- Perfect for development & moderate use

### Monitor Usage
- [Google Cloud Console](https://console.cloud.google.com)
- Navigate to: APIs & Services → Text-to-Speech API → Metrics

---

## 8️⃣ Architecture

```
User speaks → Web Speech API (STT)
                ↓
            Transcript
                ↓
        /api/voice endpoint
                ↓
        RAG Pipeline (existing)
                ↓
        Google Cloud TTS
                ↓
        Base64 MP3 audio
                ↓
    Browser plays audio
```

**Key files:**
- `lib/textToSpeech.ts` - TTS logic
- `app/api/voice/route.ts` - Voice endpoint
- `components/ChatInterface.tsx` - UI with mic button

---

## 9️⃣ Features

✅ Real-time voice transcription
✅ Natural voice responses
✅ Text + Audio simultaneous display
✅ Stop/pause audio playback
✅ Visual indicators (listening, speaking)
✅ Works alongside text chat
✅ Same RAG quality as text

---

## 🔟 Next Steps

- ✅ **Test it now!** Click the mic and ask about F1
- 📝 Customize voice settings
- 🌍 Add more languages
- 🎨 Customize UI indicators
- 📊 Monitor API usage

---

**Enjoy your voice-enabled F1 assistant!** 🏎️🎙️
