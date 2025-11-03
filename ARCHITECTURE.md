# F1 GPT - Clean Architecture (Voice-Enabled)

## 📁 Project Structure

```
rag-f1/
├── lib/                      # Core business logic (clean, modular)
│   ├── embeddings.ts         # Embedding generation
│   ├── vectorDb.ts           # Vector database operations
│   ├── gemini.ts             # Gemini AI integration
│   ├── textToSpeech.ts       # 🎙️ Google Cloud TTS (NEW)
│   └── rag.ts                # RAG orchestration
├── app/
│   ├── api/
│   │   ├── chat/route.ts     # Text chat API endpoint
│   │   └── voice/route.ts    # 🎙️ Voice chat API endpoint (NEW)
│   ├── page.tsx              # UI component
│   ├── layout.tsx            # Layout component
│   └── global.css            # Styles
├── components/
│   └── ChatInterface.tsx     # 🎙️ Chat UI with voice features (UPDATED)
├── scripts/
│   └── loadDb-clean.ts       # Data loading script
└── .env                      # Environment variables
```

## 🧩 Module Breakdown

### 1. **`lib/embeddings.ts`** - Embedding Generation
**Purpose:** Generate 384-dimensional embeddings using all-MiniLM-L6-v2

**Functions:**
- `getEmbedder()` - Get or initialize the embedding model
- `generateEmbedding(text)` - Convert text to vector

**Example:**
```typescript
import { generateEmbedding } from "@/lib/embeddings";

const vector = await generateEmbedding("What is Formula 1?");
// Returns: number[] (384 dimensions)
```

---

### 2. **`lib/vectorDb.ts`** - Vector Database Operations
**Purpose:** Handle all Astra DB interactions

**Functions:**
- `searchSimilarDocuments(vector, limit)` - Find similar documents
- `insertDocument(text, vector)` - Insert a new document
- `getDatabase()` - Get database instance

**Example:**
```typescript
import { searchSimilarDocuments, insertDocument } from "@/lib/vectorDb";

// Search
const results = await searchSimilarDocuments(queryVector, 5);

// Insert
await insertDocument("Formula 1 is...", embedVector);
```

---

### 3. **`lib/gemini.ts`** - Gemini AI Integration
**Purpose:** Generate responses using Google Gemini

**Functions:**
- `getGeminiModel(config)` - Get configured Gemini model
- `generateStreamingResponse(prompt, config)` - Stream responses
- `generateResponse(prompt, config)` - Non-streaming responses

**Example:**
```typescript
import { generateStreamingResponse } from "@/lib/gemini";

const result = await generateStreamingResponse("Explain F1");

for await (const chunk of result.stream) {
  console.log(chunk.text());
}
```

---

### 4. **`lib/rag.ts`** - RAG Orchestration
**Purpose:** Coordinate the entire RAG workflow

**Functions:**
- `retrieveContext(question, limit)` - Get relevant context
- `buildRAGPrompt(question, context)` - Build prompt
- `generateRAGResponse(question, limit)` - Full RAG pipeline

**Example:**
```typescript
import { generateRAGResponse } from "@/lib/rag";

const { stream, sources } = await generateRAGResponse("What is F1?");

for await (const chunk of stream) {
  console.log(chunk.text());
}
console.log(`Used ${sources} sources`);
```

---

### 5. **`lib/textToSpeech.ts`** - 🎙️ Text-to-Speech (NEW)
**Purpose:** Convert AI responses to natural voice using Google Cloud TTS

**Functions:**
- `getTTSClient()` - Get or initialize Google TTS client
- `textToSpeech(text, config)` - Convert text to MP3 audio
- `getAvailableVoices(languageCode)` - List available voices

**Example:**
```typescript
import { textToSpeech } from "@/lib/textToSpeech";

const audioBase64 = await textToSpeech("Formula 1 is exciting!");
// Returns: base64-encoded MP3 audio

// Custom voice
const audio = await textToSpeech("Hello!", {
  voiceName: 'en-US-Neural2-F',
  speakingRate: 1.2,
  pitch: 2
});
```

**Configuration:**
- Language: en-US (default)
- Voice: Neural2-F (natural female voice)
- Format: MP3
- Speaking Rate: 0.25 - 4.0
- Pitch: -20 to +20

---

## 🔄 Data Flow

### **Text Chat Flow:**
```
User Question
    ↓
[generateRAGResponse] (lib/rag.ts)
    ↓
1. generateEmbedding() (lib/embeddings.ts)
    → Converts question to 384D vector
    ↓
2. searchSimilarDocuments() (lib/vectorDb.ts)
    → Finds top 5 relevant chunks
    ↓
3. buildRAGPrompt() (lib/rag.ts)
    → Combines context + question
    ↓
4. generateStreamingResponse() (lib/gemini.ts)
    → Streams Gemini's answer
    ↓
Response to User
```

### **🎙️ Voice Chat Flow (NEW):**
```
User clicks Mic
    ↓
[Web Speech API] (Browser)
    → Records audio & transcribes to text
    ↓
Client sends transcript to /api/voice
    ↓
[generateRAGResponse] (lib/rag.ts)
    → Same RAG pipeline as text chat
    ↓
Server collects full response text
    ↓
[textToSpeech] (lib/textToSpeech.ts)
    → Converts text to MP3 audio (base64)
    ↓
Client receives: { text, audio, sources }
    ↓
Browser plays audio + displays text
```

---

## 🚀 Usage

### API Route - Text Chat (`app/api/chat/route.ts`)
**Clean, minimal code - just 60 lines!**

```typescript
import { generateRAGResponse } from "@/lib/rag";

export async function POST(req: Request) {
  const { messages } = await req.json();
  const question = messages[messages.length - 1]?.content;
  
  const { stream, sources } = await generateRAGResponse(question, 5);
  
  // Stream response...
}
```

### 🎙️ API Route - Voice Chat (`app/api/voice/route.ts`) (NEW)
**Voice-enabled endpoint - just 45 lines!**

```typescript
import { generateRAGResponse } from "@/lib/rag";
import { textToSpeech } from "@/lib/textToSpeech";

export async function POST(req: Request) {
  const { text } = await req.json();
  
  // Get RAG response
  const { stream, sources } = await generateRAGResponse(text, 5);
  
  // Collect full response
  let fullResponse = "";
  for await (const chunk of stream) {
    fullResponse += chunk.text();
  }
  
  // Convert to speech
  const audioBase64 = await textToSpeech(fullResponse);
  
  return NextResponse.json({
    text: fullResponse,
    audio: audioBase64,
    sources
  });
}
```

### Data Loading (`scripts/loadDb-clean.ts`)
```typescript
import { generateEmbedding } from "../lib/embeddings";
import { insertDocument } from "../lib/vectorDb";

for (const chunk of chunks) {
  const vector = await generateEmbedding(chunk);
  await insertDocument(chunk, vector);
}
```

---

## ✅ Benefits of Clean Architecture

### Before (Coupled):
- ❌ 100+ lines in route.ts
- ❌ All logic in one file
- ❌ Hard to test
- ❌ Hard to reuse
- ❌ Difficult to maintain

### After (Clean):
- ✅ **Separation of Concerns** - Each module has one responsibility
- ✅ **Reusability** - Use functions anywhere
- ✅ **Testability** - Easy to unit test each module
- ✅ **Maintainability** - Change one module without breaking others
- ✅ **Readability** - Clear, documented functions

---

## 🔧 Configuration

### Environment Variables (`.env`)
```env
ASTRA_DB_NAMESPACE=default_keyspace
ASTRA_DB_COLLECTION=f1gpt
ASTRA_DB_API_ENDPOINT=https://...
ASTRA_DB_APPLICATION_TOKEN=AstraCS:...
GOOGLE_API_KEY=AIza...
```

### Gemini Configuration (`lib/gemini.ts`)
```typescript
const config = {
  temperature: 0.7,      // Creativity (0-1)
  topP: 0.95,            // Nucleus sampling
  topK: 40,              // Top-K sampling
  maxOutputTokens: 2048  // Max response length
};
```

---

## 📦 Tech Stack

- **Embeddings:** sentence-transformers/all-MiniLM-L6-v2 (384D)
- **LLM:** Google Gemini 2.0 Flash
- **Vector DB:** DataStax Astra DB
- **Framework:** Next.js 16 + TypeScript
- **UI:** React + Tailwind CSS
- **🎙️ Voice Input:** Web Speech API (browser-native, free)
- **🎙️ Voice Output:** Google Cloud Text-to-Speech (natural voices)

---

## 🎙️ Voice Features

### **How to Use Voice:**
1. **Click the microphone button** in the chat input
2. **Speak your question** (browser will show "Listening...")
3. **AI processes via RAG** (same pipeline as text)
4. **Response is spoken** and displayed as text
5. **Click speaker icon** to stop audio playback

### **Voice Technologies:**
- **STT (Speech-to-Text):** Web Speech API
  - ✅ Free, unlimited
  - ✅ Browser-native (Chrome, Edge, Safari)
  - ✅ Real-time transcription
  - ⚠️ Requires microphone permission

- **TTS (Text-to-Speech):** Google Cloud TTS
  - ✅ Natural-sounding voices
  - ✅ Free tier: 1M characters/month (~200-300 responses)
  - ✅ High quality MP3 output
  - ✅ Multiple languages & voices

### **Browser Compatibility:**
- ✅ Chrome/Edge: Full support
- ✅ Safari: Full support
- ⚠️ Firefox: Limited Web Speech API support
- 💡 Always shows text fallback

---

## 🎯 Next Steps

1. **Add more data sources** - Edit `data` array in `loadDb-clean.ts`
2. **Customize prompts** - Modify `buildRAGPrompt()` in `lib/rag.ts`
3. **Adjust parameters** - Change config in `lib/gemini.ts`
4. **Add features** - Use clean modules in new routes/pages
5. **🎙️ Customize voice** - Change TTS voice/settings in `lib/textToSpeech.ts`
6. **🎙️ Add more languages** - Update `languageCode` for multi-language support

Happy coding! 🏎️ 🎙️
