# 🛠️ Complete Tools & Technologies Used in F1 GPT

## 📦 All Dependencies Breakdown

---

## **CORE FRAMEWORK & RUNTIME**

### 1. **Next.js 16.0.1** 🚀
**What**: Full-stack React framework
**Used For**:
- Web server & routing
- API endpoints (`/api/chat`, `/api/voice`)
- Server-side rendering
- Built-in API support

**Where in code**:
```
app/
  ├─ page.tsx          # Main page
  ├─ layout.tsx        # Root layout
  ├─ global.css        # Global styles
  └─ api/
     ├─ chat/route.ts   # Text API
     └─ voice/route.ts  # Voice API
```

**Key files**:
- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript config for Next.js

---

### 2. **React 19.2.0** ⚛️
**What**: Frontend UI library
**Used For**:
- Building UI components
- Managing component state (useState, useRef, useEffect)
- Event handling

**Where in code**:
```
components/ChatInterface.tsx
  └─ Uses React hooks:
     ├─ useState() - chat messages, loading state, voice state
     ├─ useRef()  - mic recognition, audio playback, textarea
     └─ useEffect()- initialize voice API, cleanup
```

**Example**:
```typescript
const [messages, setMessages] = useState<Message[]>([]);
const [isListening, setIsListening] = useState(false);
const recognitionRef = useRef<any>(null);
```

---

### 3. **React DOM 19.2.0** 
**What**: React rendering engine
**Used For**: Rendering React components to DOM

---

### 4. **TypeScript 5** 📘
**What**: Static type checker for JavaScript
**Used For**:
- Type safety across entire app
- Better IntelliSense & autocomplete
- Compile-time error detection

**Configured by**: `tsconfig.json`

**Example types**:
```typescript
interface Message {
  role: "user" | "assistant";
  content: string;
}

interface TTSConfig {
  languageCode?: string;
  voiceName?: string;
  speakingRate?: number;
}
```

---

## **AI & MACHINE LEARNING**

### 5. **@xenova/transformers 2.17.2** 🤖
**What**: JavaScript ML library (local, browser/Node-based)
**Used For**: 
- Generating embeddings locally
- Uses `Xenova/all-MiniLM-L6-v2` model

**Where in code**:
```
lib/embeddings.ts
  ├─ getEmbedder() - Load model once
  └─ generateEmbedding(text) - Convert text to 384D vector
```

**Process**:
```
Text Input: "What is Formula 1?"
     ↓
all-MiniLM-L6-v2 model (local)
     ↓
Output: Float32Array(384) [0.234, -0.123, ..., 0.789]
```

**Why local?**
- ✅ No API call needed
- ✅ No cost
- ✅ Fast (50-100ms)
- ✅ Privacy (data stays on server)

---

### 6. **@google/generative-ai 0.24.1** 🔮
**What**: Google Gemini API client library
**Used For**:
- Sending prompts to Gemini AI
- Streaming responses
- Generating answers based on context

**Where in code**:
```
lib/gemini.ts
  ├─ getGeminiModel() - Initialize Gemini 2.0 Flash
  ├─ generateStreamingResponse(prompt) - Stream response
  └─ generateResponse(prompt) - Non-streaming response
```

**Configuration**:
```typescript
const config = {
  model: "gemini-2.0-flash-exp",
  temperature: 0.7,      // Creativity level
  topP: 0.95,            // Nucleus sampling
  topK: 40,              // Top-K sampling
  maxOutputTokens: 2048  // Max response length
};
```

**API Key**: Stored in `.env` as `GOOGLE_API_KEY`

---

### 7. **@google-cloud/text-to-speech 6.4.0** 🔊
**What**: Google Cloud Text-to-Speech API
**Used For**:
- Converting AI responses to natural-sounding voice
- Supports multiple languages & voices

**Where in code**:
```
lib/textToSpeech.ts
  ├─ getTTSClient() - Initialize TTS client
  ├─ textToSpeech(text, config) - Convert text to MP3
  └─ getAvailableVoices() - List available voices
```

**Configuration**:
```typescript
const defaultConfig = {
  languageCode: 'en-US',
  voiceName: 'en-US-Neural2-F',  // Natural female voice
  gender: 'FEMALE',
  speakingRate: 1.0,
  pitch: 0,
  audioEncoding: 'MP3'
};
```

**Free Tier**: 1 million characters/month

---

## **DATABASE & VECTOR SEARCH**

### 8. **@datastax/astra-db-ts 1.1.0** 🗄️
**What**: DataStax Astra DB TypeScript client
**Used For**:
- Storing text chunks
- Storing embeddings (vectors)
- Vector similarity search
- RAG knowledge base

**Where in code**:
```
lib/vectorDb.ts
  ├─ getDatabase() - Connect to Astra DB
  ├─ searchSimilarDocuments(vector, limit) - Vector search
  ├─ insertDocument(text, vector) - Store chunk + embedding
  └─ [internal] - Create indexes for fast search
```

**Configuration**:
```env
ASTRA_DB_NAMESPACE=default_keyspace
ASTRA_DB_COLLECTION=f1gpt
ASTRA_DB_API_ENDPOINT=https://...
ASTRA_DB_APPLICATION_TOKEN=AstraCS:...
```

**How it works**:
```
Question: "What is F1?"
     ↓
Embedding: [0.234, -0.123, ..., 0.789]
     ↓
Astra DB Vector Search
     ↓
Cosine Similarity Calculation
     ↓
Top 5 Most Similar Chunks
     ↓
Return to Gemini as context
```

---

## **DATA PROCESSING**

### 9. **langchain 0.1.36** 🔗
**What**: LLM integration framework
**Used For**:
- Text splitting (chunking documents)
- Creating prompts
- Managing document loading

**Where in code**:
```
scripts/loadDb-clean.ts
  └─ RecursiveCharacterTextSplitter
     ├─ Splits text into 512-char chunks
     ├─ Adds 50-char overlap
     └─ Prepares for embedding
```

**Usage**:
```typescript
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 50,
});

const chunks = await splitter.splitText(text);
```

---

### 10. **puppeteer 19.11.1** 🤖
**What**: Headless browser automation
**Used For**:
- Web scraping F1 data
- Extracting content from websites
- Running in seed script

**Where in code**:
```
scripts/loadDb-clean.ts
  └─ Web scraping:
     ├─ Launch browser
     ├─ Navigate to URLs
     ├─ Extract text content
     ├─ Clean HTML
     └─ Pass to splitter
```

**Example**:
```typescript
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto(url);
const content = await page.evaluate(() => 
  document.body.innerText
);
```

---

## **USER INTERFACE & STYLING**

### 11. **Tailwind CSS 4** 🎨
**What**: Utility-first CSS framework
**Used For**:
- Styling all UI components
- Responsive design
- Dark mode support

**Where in code**:
```
components/ChatInterface.tsx
  └─ Tailwind classes:
     ├─ Layout: flex, grid, absolute
     ├─ Spacing: p-4, m-2, gap-3
     ├─ Colors: bg-gray-900, text-white
     ├─ Effects: rounded, shadow, hover
     └─ Animations: animate-bounce, animate-pulse
```

**Config**: `tailwind.config.js` (auto-generated)

**Example**:
```tsx
<button className="px-4 py-3 rounded-lg bg-gray-900 hover:bg-gray-800 text-white transition">
  Send
</button>
```

---

### 12. **@tailwindcss/postcss 4** 
**What**: PostCSS plugin for Tailwind
**Used For**: Processing Tailwind CSS directives

**Config**: `postcss.config.mjs`

---

### 13. **lucide-react 0.552.0** 🎯
**What**: Icon library (React components)
**Used For**: SVG icons in UI

**Where in code**:
```
components/ChatInterface.tsx
  └─ Icons used:
     ├─ Send - Send message button
     ├─ Mic - Start voice input
     ├─ MicOff - Stop voice input
     ├─ Volume2 - Speaker/audio playing
     ├─ VolumeX - Stop audio
     ├─ Plus - New chat
     ├─ Menu - Toggle sidebar
     ├─ User - User avatar
     ├─ MessageSquare - Chat messages
     └─ Trash2 - Delete conversation
```

**Example**:
```tsx
import { Send, Mic, Volume2 } from "lucide-react";

<button><Send className="w-4 h-4" /></button>
```

---

## **UTILITIES & ENVIRONMENT**

### 14. **dotenv 16.4.5** 🔐
**What**: Environment variable loader
**Used For**: Loading `.env` file variables

**Where in code**:
```
lib/embeddings.ts
lib/vectorDb.ts
lib/gemini.ts
lib/textToSpeech.ts
  └─ All use: process.env.GOOGLE_API_KEY, etc.
```

**Configured in**: `.env` file (not in repo)

---

### 15. **ts-node 10.9.2** ⚙️
**What**: TypeScript execution runtime
**Used For**: Running TypeScript scripts directly

**Where in code**:
```
npm run seed:clean
  └─ ts-node ./scripts/loadDb-clean.ts
     ├─ Executes TypeScript without compilation
     ├─ Loads environment variables
     └─ Scrapes and seeds data
```

---

## **LINTING & CODE QUALITY**

### 16. **ESLint 9** ✅
**What**: JavaScript/TypeScript linter
**Used For**: 
- Code quality checking
- Finding bugs
- Enforcing code style

**Config**: `eslint.config.mjs`

**Run**: `npm run lint`

---

### 17. **@types/node 20** 📘
**What**: TypeScript types for Node.js
**Used For**: Type checking in Node.js code

---

### 18. **@types/react 19** 📘
**What**: TypeScript types for React
**Used For**: Type checking React components

---

### 19. **@types/react-dom 19** 📘
**What**: TypeScript types for React DOM
**Used For**: Type checking React DOM code

---

### 20. **eslint-config-next 16.0.1** ✅
**What**: ESLint config for Next.js
**Used For**: Next.js-specific linting rules

---

## **BROWSER BUILT-IN APIS** (No install needed!)

### 21. **Web Speech API** 🎤
**What**: Browser native API
**Used For**: Speech-to-Text (STT)
- Transcribing user voice
- Real-time recognition

**Where in code**:
```
components/ChatInterface.tsx
  └─ useEffect (line ~26):
     ├─ window.SpeechRecognition || webkitSpeechRecognition
     ├─ recognitionRef.current.start()
     ├─ onresult event listener
     └─ Gets transcript text
```

**Browsers**: Chrome, Edge, Safari (✅ Full support)

---

### 22. **Web Audio API** 🔊
**What**: Browser native API
**Used For**: 
- Playing voice response audio
- Audio playback control

**Where in code**:
```
components/ChatInterface.tsx
  └─ playAudio() function:
     ├─ new Audio(base64String)
     ├─ audio.play()
     ├─ audio.pause()
     └─ Event listeners: onplay, onended, onerror
```

---

### 23. **Speech Synthesis API** 🗣️
**What**: Browser native API (fallback)
**Used For**: Text-to-Speech when Google API unavailable

**Where in code**:
```
components/ChatInterface.tsx
  └─ playBrowserTTS() function:
     ├─ window.speechSynthesis
     ├─ new SpeechSynthesisUtterance(text)
     └─ window.speechSynthesis.speak()
```

---

### 24. **Fetch API** 🌐
**What**: Browser native API
**Used For**: 
- HTTP requests to backend
- Sending/receiving data

**Where in code**:
```
components/ChatInterface.tsx
  └─ Multiple places:
     ├─ fetch("/api/chat", {...})
     ├─ fetch("/api/voice", {...})
     └─ response.json() to parse

lib/
  └─ All API calls to Google/Astra DB
```

---

## **ARCHITECTURE & ORGANIZATION**

```
lib/                          # Core business logic
  ├─ embeddings.ts           # @xenova/transformers
  ├─ vectorDb.ts             # @datastax/astra-db-ts
  ├─ gemini.ts               # @google/generative-ai
  ├─ textToSpeech.ts         # @google-cloud/text-to-speech
  └─ rag.ts                  # Orchestrates above

app/                          # Next.js app router
  ├─ api/
  │  ├─ chat/route.ts        # Uses lib/* modules
  │  └─ voice/route.ts       # Uses lib/* modules
  ├─ page.tsx                # React component
  ├─ layout.tsx              # Next.js layout
  └─ global.css              # Tailwind + globals

components/                   # React components
  └─ ChatInterface.tsx       # React + Tailwind + lucide-react

scripts/                       # Data processing
  └─ loadDb-clean.ts        # puppeteer + langchain

Configuration Files:
  ├─ package.json            # All dependencies
  ├─ tsconfig.json           # TypeScript config
  ├─ next.config.ts          # Next.js config
  ├─ tailwind.config.js      # Tailwind config
  ├─ postcss.config.mjs      # PostCSS config
  ├─ eslint.config.mjs       # ESLint config
  └─ .env                    # API keys (not in repo)
```

---

## **TOOL USAGE SUMMARY TABLE**

| Tool | Type | Purpose | Cost | Where |
|------|------|---------|------|-------|
| Next.js | Framework | Web server & routing | FREE | `app/` |
| React | Frontend | UI components | FREE | `components/` |
| TypeScript | Language | Type safety | FREE | All `.ts/.tsx` |
| @xenova/transformers | ML | Generate embeddings | FREE | `lib/embeddings.ts` |
| @google/generative-ai | AI | Gemini LLM | Free tier | `lib/gemini.ts` |
| @google-cloud/text-to-speech | Voice | Text to audio | $0.016/char | `lib/textToSpeech.ts` |
| @datastax/astra-db-ts | Database | Vector DB | Free tier | `lib/vectorDb.ts` |
| langchain | Framework | Text processing | FREE | `scripts/loadDb-clean.ts` |
| puppeteer | Tool | Web scraping | FREE | `scripts/loadDb-clean.ts` |
| Tailwind CSS | Styling | UI design | FREE | `*.tsx`, `*.css` |
| lucide-react | Icons | SVG icons | FREE | `components/` |
| dotenv | Utility | Env variables | FREE | `lib/`, `scripts/` |
| ts-node | Runtime | TypeScript runner | FREE | `npm run seed:clean` |
| ESLint | Linter | Code quality | FREE | `npm run lint` |
| Web Speech API | Browser API | Voice input | FREE/Native | `components/` |
| Web Audio API | Browser API | Audio playback | FREE/Native | `components/` |
| Fetch API | Browser API | HTTP requests | FREE/Native | All |

---

## **COST BREAKDOWN**

```
💰 MONTHLY COSTS:

FREE ✅
├─ Next.js
├─ React
├─ TypeScript
├─ Tailwind CSS
├─ @xenova/transformers (local)
├─ langchain
├─ puppeteer
├─ lucide-react
├─ ESLint
└─ All browser APIs

FREEMIUM 🟢 (with limits)
├─ Google Gemini API
│  └─ Free tier available for development
├─ Astra DB
│  └─ Free tier: 25GB storage, decent query limits
└─ @google-cloud/text-to-speech
   └─ Free: 1M characters/month = ~$0.016/char overage

PAID 💳 (if exceeding free tier)
├─ Gemini API
│  └─ ~$0.075 per 1M input tokens + $0.30 per 1M output tokens
├─ Astra DB
│  └─ ~$0.25 per hour after free tier
└─ Google TTS
   └─ ~$16 per 1M characters

TYPICAL USAGE ESTIMATE:
├─ Text questions: FREE (within Astra DB + Gemini free tier)
├─ Voice responses: ~$0.002 per response (TTS)
├─ 100 daily voice queries: ~$6/month
├─ 1000 daily voice queries: ~$60/month
└─ For personal/small use: Always FREE tier sufficient ✅
```

---

## **KEY INTEGRATIONS**

```
┌─────────────────────────────────────────┐
│ Browser (Client-Side)                   │
├─────────────────────────────────────────┤
│ ✓ React 19                              │
│ ✓ Web Speech API (STT)                  │
│ ✓ Web Audio API (audio playback)        │
│ ✓ Fetch API (HTTP requests)             │
│ ✓ Tailwind CSS (styling)                │
│ ✓ lucide-react (icons)                  │
└─────────────────────────────────────────┘
           ↕ HTTPS/REST
┌─────────────────────────────────────────┐
│ Server (Backend)                        │
├─────────────────────────────────────────┤
│ ✓ Next.js 16 (server & routing)         │
│ ✓ TypeScript 5 (type safety)            │
│ ✓ @xenova/transformers (embeddings)     │
│ ✓ @datastax/astra-db-ts (vector DB)     │
│ ✓ @google/generative-ai (Gemini)        │
│ ✓ @google-cloud/text-to-speech (TTS)    │
│ ✓ langchain (text processing)           │
│ ✓ puppeteer (web scraping)              │
└─────────────────────────────────────────┘
       ↕ API Calls ↕
┌─────────────────────────────────────────┐
│ External Services                       │
├─────────────────────────────────────────┤
│ ✓ Google Gemini 2.0 Flash (AI)          │
│ ✓ Google Cloud TTS (voice)              │
│ ✓ DataStax Astra DB (vectors)           │
│ ✓ Wikipedia (data source)               │
└─────────────────────────────────────────┘
```

---

## **QUICK START FOR NEW DEVELOPERS**

1. **Install all tools**: `npm install`
2. **Start dev server**: `npm run dev`
3. **Load F1 data**: `npm run seed:clean`
4. **Check code**: `npm run lint`

**That's it!** All 24 tools are ready to use! 🚀

