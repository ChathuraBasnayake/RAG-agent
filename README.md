# F1 GPT 🏎️

A professional Formula 1 AI chatbot powered by **RAG (Retrieval-Augmented Generation)** technology. Ask anything about Formula 1 and get accurate, context-aware responses backed by a vector database.

## 🚀 Features

- **Free & Local Embeddings**: Uses `sentence-transformers/all-MiniLM-L6-v2` (384 dimensions)
- **Google Gemini AI**: Fast, streaming responses with Gemini 2.0 Flash
- **Vector Database**: DataStax Astra DB for semantic search
- **Modern UI**: ChatGPT-style interface with Tailwind CSS v4
- **Fully Modular**: Clean architecture with separated concerns
- **Real-time Streaming**: See responses as they're generated

## 🏗️ Architecture

```
lib/
  ├── embeddings.ts    # Local embedding generation (all-MiniLM-L6-v2)
  ├── vectorDb.ts      # Astra DB operations (search, insert)
  ├── gemini.ts        # Gemini AI integration (streaming, non-streaming)
  └── rag.ts           # RAG orchestration (retrieve → generate)

app/
  ├── api/chat/        # Streaming chat API endpoint
  ├── page.tsx         # Main chat interface
  ├── layout.tsx       # Root layout
  └── global.css       # Tailwind styles

components/
  └── ChatInterface.tsx # Reusable chat UI component

scripts/
  └── loadDb-clean.ts  # Data loading pipeline
```

## 📦 Tech Stack

- **Framework**: Next.js 16 with React 19
- **Language**: TypeScript 5
- **AI/ML**:
  - Embeddings: `@xenova/transformers` (Xenova/all-MiniLM-L6-v2)
  - LLM: `@google/generative-ai` (Gemini 2.0 Flash Exp)
- **Database**: DataStax Astra DB (`@datastax/astra-db-ts`)
- **Styling**: Tailwind CSS v4 with `@tailwindcss/postcss`
- **Icons**: `lucide-react`
- **Data Loading**:
  - `puppeteer` for web scraping
  - `langchain` for text splitting

## 🔧 Setup

### 1. Clone and Install

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```env
# Astra DB (https://astra.datastax.com)
ASTRA_DB_NAMESPACE=default_keyspace
ASTRA_DB_COLLECTION=f1gpt
ASTRA_DB_API_ENDPOINT=https://your-database-id.apps.astra.datastax.com
ASTRA_DB_APPLICATION_TOKEN=AstraCS:your-token-here

# Google Gemini API (https://aistudio.google.com/app/apikey)
GOOGLE_API_KEY=your-google-api-key-here
```

### 3. Set Up Astra DB

1. Create a free account at [astra.datastax.com](https://astra.datastax.com)
2. Create a new **Serverless (Vector)** database
3. Create a namespace called `default_keyspace`
4. Generate an Application Token
5. Copy your API Endpoint and Token to `.env`

### 4. Get Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file

### 5. Load F1 Knowledge Base

```bash
npm run seed:clean
```

This will:
- Scrape Formula 1 Wikipedia page
- Split content into 512-character chunks
- Generate embeddings for each chunk
- Store in Astra DB for vector search

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start chatting!

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run seed:clean` - Load F1 data into Astra DB
- `npm run lint` - Run ESLint

## 🎯 How It Works

### RAG Pipeline

1. **User Question** → Generate embedding (384D vector)
2. **Vector Search** → Find top 5 similar chunks in Astra DB
3. **Context Building** → Combine retrieved chunks into context
4. **Prompt Engineering** → Build prompt with context + question
5. **Gemini Streaming** → Generate response with real-time streaming
6. **UI Update** → Display response word-by-word

### Example Flow

```typescript
// User asks: "What is DRS in F1?"

// 1. Generate embedding for the question
const queryVector = await generateEmbedding("What is DRS in F1?");

// 2. Search for similar content
const docs = await searchSimilarDocuments(queryVector, 5);

// 3. Build prompt with retrieved context
const prompt = buildRAGPrompt(question, docs);

// 4. Stream response from Gemini
const { stream } = await generateStreamingResponse(prompt);

// 5. Display in UI as it arrives
for await (const chunk of stream) {
  displayChunk(chunk.text());
}
```

## 🧩 Modular Design

Each module has a single responsibility:

- **embeddings.ts**: Text → Vector (384D)
- **vectorDb.ts**: Vector Search & Storage
- **gemini.ts**: AI Response Generation
- **rag.ts**: Orchestrates the full RAG workflow
- **ChatInterface.tsx**: Reusable UI component

All modules export clean, documented functions with TypeScript types.

## 🎨 Customization

### Add More Data Sources

Edit `scripts/loadDb-clean.ts`:

```typescript
const data = [
  "https://en.wikipedia.org/wiki/Formula_One",
  "https://en.wikipedia.org/wiki/Formula_One_regulations",
  // Add more URLs...
];
```

### Change Branding

In `app/page.tsx`:

```typescript
<ChatInterface
  title="Your Title"
  brandColor="from-blue-500 to-purple-500"
  suggestedQuestions={[...]}
/>
```

### Adjust AI Parameters

In `lib/gemini.ts`:

```typescript
const defaultConfig = {
  temperature: 0.7,    // Lower = more focused, Higher = more creative
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 2048,
};
```

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Astra DB Docs](https://docs.datastax.com/en/astra-db-serverless/)
- [Google Gemini API](https://ai.google.dev/gemini-api/docs)
- [Transformers.js](https://huggingface.co/docs/transformers.js)

## 📄 License

MIT

## 🙏 Acknowledgments

- Formula 1 data from Wikipedia
- Embeddings: `sentence-transformers/all-MiniLM-L6-v2`
- LLM: Google Gemini 2.0 Flash Exp
- Vector DB: DataStax Astra DB

