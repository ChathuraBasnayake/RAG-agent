# 🎙️ Complete F1 GPT Voice Assistant - End-to-End Walkthrough

## 📊 The Complete Flow (Step-by-Step)

---

## **PHASE 1: DATA LOADING (One-Time Setup)**

### What Happens When You Run: `npm run seed:clean`

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA LOADING PIPELINE                     │
└─────────────────────────────────────────────────────────────┘
```

#### **Step 1: Data Sources**
```
scripts/loadDb-clean.ts
  ↓
Defines URLs to scrape:
  - Wikipedia Formula 1 page
  - F1 regulations page
  - etc.
```

#### **Step 2: Web Scraping**
```
puppeteer library
  ↓
Opens browser automatically
  ↓
Downloads HTML from URLs
  ↓
Extracts text content
  
Example output:
"Formula One is the highest class of single-seater auto racing..."
```

#### **Step 3: Text Chunking**
```
langchain.RecursiveCharacterTextSplitter
  ↓
Splits large text into 512-character chunks
  ↓
Creates overlap (50 characters) between chunks
  ↓
Adds metadata (source URL, chunk ID)

Example chunk:
{
  text: "Formula One teams design, build, and maintain cars...",
  metadata: { source: "wikipedia", chunkId: 1 }
}
```

#### **Step 4: Generate Embeddings**
```
For EACH chunk:
  ├─ Input: chunk text
  ├─ Process: "all-MiniLM-L6-v2" model
  │   (runs locally using @xenova/transformers)
  │   (converts text to 384-dimensional vector)
  └─ Output: Float32Array with 384 numbers
  
Example vector:
[0.234, -0.123, 0.456, ..., -0.089]  // 384 dimensions total
```

#### **Step 5: Store in Astra DB**
```
For EACH chunk + embedding:
  ├─ Send to Astra DB via API
  ├─ Database stores:
  │   ├─ Original text
  │   ├─ 384D vector
  │   └─ Metadata
  └─ Create vector index for search

Total: ~200-500 chunks in database
```

**Result**: Your knowledge base is ready! 🎉

---

## **PHASE 2: USER INTERACTION (Real-Time)**

### Scenario: User Clicks Mic and Says "What is Formula 1?"

---

## **STEP 1️⃣: VOICE INPUT (Browser Side)**

```
┌──────────────────────────────────────┐
│ User clicks microphone button 🎤     │
│ (in ChatInterface component)          │
└──────────────────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ toggleListening() function triggered │
│ (ChatInterface.tsx line ~177)         │
└──────────────────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ Web Speech API starts recording      │
│ (browser native - no server needed)   │
│                                       │
│ recognitionRef.current.start()        │
└──────────────────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ User speaks:                          │
│ "What is Formula 1?"                 │
│                                       │
│ Browser recognizes speech via        │
│ Google's speech recognition          │
└──────────────────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ onResult event fires                 │
│ (ChatInterface.tsx line ~26-30)      │
│                                       │
│ Extracted transcript:                 │
│ "What is Formula 1?"                 │
│                                       │
│ setInput(transcript)                 │
│ setIsListening(false)                │
└──────────────────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ setTimeout(() =>                      │
│   handleVoiceSend(transcript)         │
│ , 100)                               │
└──────────────────────────────────────┘
```

**What user sees:**
- Mic button turns red with "Stop" icon
- "Listening..." text appears
- After speaking, button returns to normal

---

## **STEP 2️⃣: SEND TRANSCRIPT TO BACKEND**

```
┌────────────────────────────────────────────┐
│ handleVoiceSend() called                   │
│ (ChatInterface.tsx line ~134)              │
└────────────────────────────────────────────┘
           ↓
┌────────────────────────────────────────────┐
│ 1. Create user message object              │
│                                            │
│ userMessage = {                            │
│   role: "user",                            │
│   content: "What is Formula 1?"            │
│ }                                          │
│                                            │
│ 2. Add to messages state                   │
│    setMessages([...messages, userMessage]) │
│                                            │
│ 3. Show user's question in chat            │
└────────────────────────────────────────────┘
           ↓
┌────────────────────────────────────────────┐
│ 4. Fetch to /api/voice endpoint            │
│                                            │
│ fetch("/api/voice", {                      │
│   method: "POST",                          │
│   headers: { "Content-Type":               │
│              "application/json" },         │
│   body: JSON.stringify({                   │
│     text: "What is Formula 1?",            │
│     previousMessages: [...]                │
│   })                                       │
│ })                                         │
│                                            │
│ setIsLoading(true)  ← Show loading        │
└────────────────────────────────────────────┘
           ↓
┌────────────────────────────────────────────┐
│ Sending to Server...                       │
│ Request body contains: transcript text     │
└────────────────────────────────────────────┘
```

**What user sees:**
- Their question appears as a chat message
- Typing indicator appears below (3 bouncing dots)
- "Processing..." state

---

## **STEP 3️⃣: BACKEND PROCESSING (/api/voice/route.ts)**

```
┌─────────────────────────────────────┐
│ Server receives POST /api/voice      │
│                                      │
│ Request: {                           │
│   text: "What is Formula 1?"         │
│ }                                    │
└─────────────────────────────────────┘
           ↓

╔═════════════════════════════════════════════════════════════╗
║           STEP 3A: EMBEDDING THE QUESTION                  ║
╚═════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────┐
│ generateRAGResponse(text, limit)     │
│ (lib/rag.ts)                         │
│                                      │
│ Called with:                         │
│ - text: "What is Formula 1?"         │
│ - limit: 5 (top 5 results)           │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ retrieveContext(question, limit)     │
│ (lib/rag.ts line ~30)                │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ generateEmbedding(question)          │
│ (lib/embeddings.ts)                  │
│                                      │
│ Input: "What is Formula 1?"          │
│         ↓                            │
│ Load model:                          │
│ "Xenova/all-MiniLM-L6-v2"            │
│         ↓                            │
│ Process text through neural network  │
│         ↓                            │
│ Output: [0.234, -0.123, ..., ...]   │
│         (384 dimensions)             │
└─────────────────────────────────────┘

╔═════════════════════════════════════════════════════════════╗
║           STEP 3B: VECTOR SEARCH IN DATABASE               ║
╚═════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────┐
│ searchSimilarDocuments(queryVector)   │
│ (lib/vectorDb.ts)                    │
│                                      │
│ Send to Astra DB:                    │
│ {                                    │
│   vector: [0.234, -0.123, ...],     │
│   limit: 5,                          │
│   similarityThreshold: 0.5            │
│ }                                    │
└──────────────────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ Astra DB calculates similarity       │
│ for all stored chunks:               │
│                                      │
│ Compare query vector against         │
│ all 500 chunk vectors using          │
│ cosine similarity                    │
│                                      │
│ Returns top 5 matches:               │
│ 1. "Formula One is a motorsport..."  │
│ 2. "F1 teams consist of..."          │
│ 3. "Each season has 24 races..."     │
│ 4. "DRS allows greater speed..."     │
│ 5. "Points are awarded as..."        │
└──────────────────────────────────────┘

╔═════════════════════════════════════════════════════════════╗
║        STEP 3C: BUILD PROMPT WITH CONTEXT                  ║
╚═════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────┐
│ buildRAGPrompt(question, context)    │
│ (lib/rag.ts line ~45)                │
│                                      │
│ Creates prompt:                      │
│                                      │
│ "You are a Formula 1 expert.         │
│                                      │
│  Context from knowledge base:        │
│  - Formula One is a motorsport...    │
│  - F1 teams consist of...            │
│  - Each season has 24 races...       │
│  - DRS allows greater speed...       │
│  - Points are awarded as...          │
│                                      │
│  Question: What is Formula 1?        │
│                                      │
│  Answer:"                            │
└──────────────────────────────────────┘

╔═════════════════════════════════════════════════════════════╗
║       STEP 3D: GENERATE RESPONSE WITH GEMINI               ║
╚═════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────┐
│ generateStreamingResponse(prompt)     │
│ (lib/gemini.ts)                      │
│                                      │
│ Send to Google Gemini API:           │
│ - Model: gemini-2.0-flash-exp        │
│ - Temperature: 0.7                   │
│ - Stream: true                       │
│ - maxOutputTokens: 2048              │
└──────────────────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ Gemini AI processes:                 │
│                                      │
│ 1. Read prompt                       │
│ 2. Analyze context                   │
│ 3. Generate response word-by-word    │
│ 4. Stream back in real-time          │
│                                      │
│ Response starts coming back as:       │
│ "Formula One is the highest..."      │
│ "Formula One is the highest class..." │
│ "Formula One is the highest class    │
│  of single-seater..."                │
│ ... (more tokens arrive)             │
└──────────────────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ Full response received:              │
│                                      │
│ "Formula One is the highest class    │
│  of single-seater auto racing...     │
│  Teams design and build cars that    │
│  race on various circuits. It's      │
│  governed by FIA and known for       │
│  speed, technology, and competition."│
└──────────────────────────────────────┘

╔═════════════════════════════════════════════════════════════╗
║      STEP 3E: CONVERT RESPONSE TO SPEECH                   ║
╚═════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────┐
│ textToSpeech(fullResponse, config)    │
│ (lib/textToSpeech.ts)                │
│                                      │
│ Input: Full response text            │
│ Config:                              │
│   - Language: en-US                  │
│   - Voice: Neural2-F (female)        │
│   - Speed: 1.0x                      │
└──────────────────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ Call Google Cloud TTS API            │
│ (or fallback to browser TTS)         │
│                                      │
│ Option 1: Google Cloud (natural)     │
│   ↓ Send text                        │
│   ↓ API synthesizes MP3              │
│   ↓ Returns base64 MP3               │
│                                      │
│ Option 2: Browser (if API disabled)  │
│   ↓ Return flag: "USE_BROWSER_TTS:..." │
│   ↓ Client handles with Web API      │
└──────────────────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ Response object created:             │
│                                      │
│ {                                    │
│   success: true,                     │
│   text: "Formula One is...",         │
│   audio: "SUQzBAAAI..." (base64),   │
│   sources: 5,                        │
│   mimeType: "audio/mp3"              │
│ }                                    │
└──────────────────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ Send response back to client         │
│ as JSON                              │
└──────────────────────────────────────┘
```

---

## **STEP 4️⃣: DISPLAY RESPONSE ON FRONTEND**

```
┌──────────────────────────────────────┐
│ Client receives response from server  │
│                                      │
│ response.json() = {                  │
│   text: "Formula One is...",         │
│   audio: "base64mp3data..."          │
│ }                                    │
└──────────────────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ 1. Display text response              │
│                                      │
│ setMessages([...prev,                │
│   {                                  │
│     role: "assistant",               │
│     content: "Formula One is..."     │
│   }                                  │
│ ])                                   │
│                                      │
│ ✅ Shows AI response in chat window   │
└──────────────────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ 2. Play audio response                │
│                                      │
│ if (data.audio) {                    │
│   const audioBlob =                  │
│     "data:audio/mp3;base64," +      │
│     data.audio                       │
│                                      │
│   const audio = new Audio(audioBlob) │
│   audio.play()                       │
│ }                                    │
│                                      │
│ 🔊 AI's voice plays through speakers │
└──────────────────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ UI Updates:                          │
│                                      │
│ ✅ Loading indicator disappears      │
│ ✅ AI response visible in chat       │
│ ✅ Audio playing indicator shows     │
│ ✅ Speaker icon visible              │
│ ✅ Stop audio button available       │
└──────────────────────────────────────┘
```

**What user sees:**
- AI's response appears in chat (left-aligned with purple avatar)
- Speaker icon shows "Speaking..." with blue indicator
- Audio plays through browser speakers
- Can click speaker icon to stop

---

## **TEXT CHAT FLOW (Similar but Direct)**

If user types instead of using voice:

```
User types: "Who won F1 2024?"
         ↓
Click Send button
         ↓
handleSend() → fetch("/api/chat")
         ↓
SAME RAG PIPELINE
         ↓
Response streams back
         ↓
Display in chat
         ↓
✅ No voice output, just text
```

---

## **DATA STRUCTURES (What Flows Through System)**

### **Message Object**
```typescript
interface Message {
  role: "user" | "assistant";
  content: string;
}

// Example:
{
  role: "user",
  content: "What is Formula 1?"
}
```

### **Embedding Vector**
```typescript
// 384-dimensional vector from all-MiniLM-L6-v2
Float32Array(384) [
  0.234,  // dimension 1
  -0.123, // dimension 2
  0.456,  // dimension 3
  ...
  -0.089  // dimension 384
]
```

### **Context Chunk**
```typescript
interface Chunk {
  text: string;
  metadata: {
    source: string;
    chunkId: number;
    url?: string;
  };
  vector: number[]; // 384D
}
```

### **Voice API Request**
```json
POST /api/voice
{
  "text": "What is Formula 1?",
  "previousMessages": []
}
```

### **Voice API Response**
```json
{
  "success": true,
  "text": "Formula One is the highest class...",
  "audio": "SUQzBAAAI1Ilmv8AAAA...", // base64 MP3
  "sources": 5,
  "mimeType": "audio/mp3"
}
```

---

## **FILES & THEIR ROLES**

```
┌─ lib/
│  ├─ embeddings.ts
│  │  └─ Takes text → Returns 384D vector
│  │
│  ├─ vectorDb.ts
│  │  └─ Searches database for similar chunks
│  │
│  ├─ gemini.ts
│  │  └─ Sends prompt → Returns AI response
│  │
│  ├─ textToSpeech.ts
│  │  └─ Converts text → Returns MP3 audio (base64)
│  │
│  └─ rag.ts
│     └─ Orchestrates all above (embedding → search → prompt → response)
│
├─ app/api/
│  ├─ chat/route.ts
│  │  └─ Receives text query → Returns streaming text response
│  │
│  └─ voice/route.ts
│     └─ Receives text query → Returns text + audio response
│
├─ components/
│  └─ ChatInterface.tsx
│     └─ UI with text input, mic button, voice controls
│
├─ app/
│  ├─ page.tsx
│     └─ Main page - uses ChatInterface
│  ├─ layout.tsx
│  └─ global.css
│
└─ scripts/
   └─ loadDb-clean.ts
      └─ Scrapes URLs → Chunks → Embeds → Stores in DB
```

---

## **KEY PERFORMANCE METRICS**

```
⏱️ TIMING:
├─ Voice transcription: 1-2 seconds (browser)
├─ Embedding generation: 50-100ms (local)
├─ Vector search: 100-200ms (Astra DB)
├─ Gemini response: 2-5 seconds (streaming)
├─ TTS conversion: 1-3 seconds (Google API)
└─ TOTAL: ~5-12 seconds start to finish

💾 DATA:
├─ One chunk: ~512 characters
├─ One embedding: ~1.5 KB
├─ One response: ~200-500 words
├─ One MP3 audio: ~50-200 KB
└─ Total knowledge base: ~1-5 MB

🔄 API CALLS:
├─ 1 × Embedding API call (local)
├─ 1 × Vector search (Astra DB)
├─ 1 × Gemini API call
├─ 1 × TTS API call
└─ TOTAL: 4 API calls per question
```

---

## **ERROR HANDLING FLOW**

```
ERROR SCENARIO 1: Microphone Denied
  ↓
isListening remains false
  ↓
Display: "Microphone not available"
  ↓
User can still type normally

ERROR SCENARIO 2: API Timeout
  ↓
fetch() rejects
  ↓
catch block triggered
  ↓
setIsLoading(false)
  ↓
Display: "Sorry, something went wrong..."
  ↓
User can retry

ERROR SCENARIO 3: TTS API Disabled
  ↓
textToSpeech() returns "USE_BROWSER_TTS:..."
  ↓
Client uses browser speech synthesis
  ↓
Audio plays (robotic but works)
  ↓
No user-facing error

ERROR SCENARIO 4: No Vector Match
  ↓
searchSimilarDocuments() returns empty
  ↓
buildRAGPrompt() creates prompt with minimal context
  ↓
Gemini responds based on general knowledge
  ↓
Still works, but less accurate
```

---

## **COMPLETE EXAMPLE WALKTHROUGH**

### **User says: "How many wheels does an F1 car have?"**

```
1. BROWSER - Web Speech API
   ┗─ Transcribes to: "How many wheels does an F1 car have?"

2. BROWSER - Send to /api/voice
   ┗─ Fetch with text

3. SERVER - lib/embeddings.ts
   ┗─ "How many wheels does an F1 car have?" 
     → [0.123, -0.456, ..., 0.789] (384D)

4. SERVER - lib/vectorDb.ts
   ┗─ Search similar chunks in Astra DB
     → Returns top 5 chunks about F1 car specifications

5. SERVER - lib/rag.ts
   ┗─ Build prompt with context:
     "You know: F1 cars have specific regulations...
      Context: [5 relevant chunks]
      Question: How many wheels does an F1 car have?
      Answer:"

6. SERVER - lib/gemini.ts
   ┗─ Gemini responds:
     "Formula 1 cars have 4 wheels, following 
      international motorsport regulations..."

7. SERVER - lib/textToSpeech.ts
   ┗─ Convert to voice:
     "Formula One cars have 4 wheels..." 
     → MP3 base64 string

8. SERVER - app/api/voice/route.ts
   ┗─ Return JSON:
     {
       text: "Formula 1 cars have 4 wheels...",
       audio: "base64mp3...",
       sources: 5
     }

9. BROWSER - ChatInterface.tsx
   ┗─ Receive response
   ┗─ Display text in chat
   ┗─ Play audio through speakers

10. USER
    ✅ Sees: "Formula 1 cars have 4 wheels..."
    ✅ Hears: AI voice saying the response
    ✅ Can click stop button if needed
```

---

## **SUMMARY IN ONE SENTENCE**

**User speaks → Browser converts to text → Server searches knowledge base → AI generates answer → Convert to voice → Play for user**

🎙️ **That's it!** Your voice assistant is complete!
