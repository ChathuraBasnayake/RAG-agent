# F1 GPT - Clean Architecture

## 📁 Project Structure

```
rag-f1/
├── lib/                      # Core business logic (clean, modular)
│   ├── embeddings.ts         # Embedding generation
│   ├── vectorDb.ts           # Vector database operations
│   ├── gemini.ts             # Gemini AI integration
│   └── rag.ts                # RAG orchestration
├── app/
│   ├── api/chat/route.ts     # API endpoint (thin layer)
│   ├── page.tsx              # UI component
│   ├── layout.tsx            # Layout component
│   └── global.css            # Styles
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

## 🔄 Data Flow

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

---

## 🚀 Usage

### API Route (`app/api/chat/route.ts`)
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

---

## 🎯 Next Steps

1. **Add more data sources** - Edit `data` array in `loadDb-clean.ts`
2. **Customize prompts** - Modify `buildRAGPrompt()` in `lib/rag.ts`
3. **Adjust parameters** - Change config in `lib/gemini.ts`
4. **Add features** - Use clean modules in new routes/pages

Happy coding! 🏎️
