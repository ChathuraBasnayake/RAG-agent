# Call Center Agent Training System# Call Center Agent Training System# F1 GPT 🏎️ 🎙️



AI-powered training platform for call center agents with CSV-based scenario upload, voice/text responses, and intelligent evaluation.



## 🌟 FeaturesAn AI-powered training platform for call center agents. Upload training scenarios via CSV, practice responding to customer situations, and receive detailed AI-driven feedback on your performance.A professional Formula 1 AI chatbot powered by **RAG (Retrieval-Augmented Generation)** technology with **voice assistance**. Ask anything about Formula 1 via text or voice and get accurate, context-aware responses backed by a vector database.



- **📤 CSV Upload**: Easy training scenario management

- **🎤 Voice Input**: Web Speech API for natural responses  

- **🤖 AI Evaluation**: Semantic similarity + keyword matching## Features## 🚀 Features

- **📊 Detailed Feedback**: Gemini-powered performance analysis

- **⚡ Real-time Progress**: Track training session completion

- **🎯 Pass/Fail Scoring**: 70% threshold with comprehensive reporting

- 📤 **CSV Upload**: Easily upload training scenarios with questions, expected answers, and keywords- **🎙️ Voice-Enabled**: Speak your questions and hear AI responses

## 🏗️ Architecture

- 🎤 **Voice Input**: Use voice or text to respond to training scenarios- **Free & Local Embeddings**: Uses `sentence-transformers/all-MiniLM-L6-v2` (384 dimensions)

```

call-center-training/- 🤖 **AI Evaluation**: Get detailed feedback powered by Google Gemini 2.0- **Google Gemini AI**: Fast, streaming responses with Gemini 2.0 Flash

├── app/                    # Next.js application

│   ├── page.tsx           # Main training interface- 📊 **Performance Analytics**: View comprehensive scores and improvement suggestions- **Vector Database**: DataStax Astra DB for semantic search

│   ├── evaluation/        # Results & feedback page

│   └── api/               # API routes- 🎯 **Smart Scoring**: Combined semantic similarity (60%) and keyword matching (40%)- **Modern UI**: ChatGPT-style interface with Tailwind CSS v4

│       ├── upload-training/

│       ├── training-session/- **Fully Modular**: Clean architecture with separated concerns

│       └── evaluate-session/

├── components/            # React components## Tech Stack- **Real-time Streaming**: See responses as they're generated

│   ├── CSVUpload.tsx

│   └── TrainingSession.tsx- **Natural Voice**: Google Cloud Text-to-Speech with neural voices

├── lib/                   # Core modules

│   ├── vectorDb.ts       # Database operations- **Framework**: Next.js 16 with React 19 & TypeScript

│   ├── embeddings.ts     # Vector generation

│   └── gemini.ts         # AI client- **Database**: DataStax Astra DB (Vector Database)## 🏗️ Architecture

└── scripts/

    └── setup-db.ts       # Database initialization- **AI Models**: 

```

  - Google Gemini 2.0 Flash (Evaluation & Feedback)```

## 🚀 Quick Start

  - Xenova Transformers (Local Embeddings)lib/

### Prerequisites

- Node.js 18+- **Voice**: Web Speech API  ├── embeddings.ts    # Local embedding generation (all-MiniLM-L6-v2)

- DataStax Astra DB account

- Google Gemini API key- **CSV Parsing**: PapaParse  ├── vectorDb.ts      # Astra DB operations (search, insert)



### Installation  ├── gemini.ts        # Gemini AI integration (streaming, non-streaming)



```bash## Getting Started  ├── textToSpeech.ts  # 🎙️ Google Cloud TTS (voice output)

npm install

cp .env.example .env  └── rag.ts           # RAG orchestration (retrieve → generate)

# Edit .env with your credentials

npm run setup-db### Prerequisites

npm run dev

```app/



### Environment Variables- Node.js 18+  ├── api/



```env- DataStax Astra DB account  │   ├── chat/        # Streaming text chat API endpoint

ASTRA_DB_NAMESPACE=default_keyspace

ASTRA_DB_API_ENDPOINT=https://your-db-id.apps.astra.datastax.com- Google Gemini API key  │   └── voice/       # 🎙️ Voice chat API endpoint (NEW)

ASTRA_DB_APPLICATION_TOKEN=AstraCS:your-token

GOOGLE_GENERATIVE_AI_API_KEY=your-api-key  ├── page.tsx         # Main chat interface

```

### Environment Variables  ├── layout.tsx       # Root layout

## 📝 CSV Format

  └── global.css       # Tailwind styles

```csv

question_id,question,correct_answer,keywordsCreate a `.env.local` file:

1,"How do you handle an angry customer?","I remain calm...","calm, listen, empathize"

```components/



**Required Columns:**```env  └── ChatInterface.tsx # 🎙️ Reusable chat UI with voice features

- `question_id`: Unique identifier

- `question`: Scenario or questionASTRA_DB_APPLICATION_TOKEN=your_token

- `correct_answer`: Expected response

- `keywords`: Important terms (comma-separated)ASTRA_DB_API_ENDPOINT=your_endpointscripts/



## 🔬 EvaluationGOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key  └── loadDb-clean.ts  # Data loading pipeline



**Scoring:** `(Semantic Similarity × 60%) + (Keyword Match × 40%)```````



- Semantic Similarity: Vector embedding comparison

- Keyword Match: Critical terminology presence

- AI Feedback: Personalized improvement tips### Installation## 📦 Tech Stack

- Pass Threshold: 70%



## 🛠️ Scripts

```bash- **Framework**: Next.js 16 with React 19

```bash

npm run dev       # Development servernpm install- **Language**: TypeScript 5

npm run build     # Production build

npm run setup-db  # Initialize databasenpm run dev- **AI/ML**:

```

```  - Embeddings: `@xenova/transformers` (Xenova/all-MiniLM-L6-v2)

## 📚 Tech Stack

  - LLM: `@google/generative-ai` (Gemini 2.0 Flash Exp)

- **Framework**: Next.js 16 + React 19

- **Database**: Astra DB (vector storage)Open [http://localhost:3000](http://localhost:3000)  - 🎙️ TTS: `@google-cloud/text-to-speech` (Neural voices)

- **AI**: Google Gemini 1.5 Flash

- **Embeddings**: Xenova Transformers (384D)- **Database**: DataStax Astra DB (`@datastax/astra-db-ts`)

- **Voice**: Web Speech API

## Usage- **Styling**: Tailwind CSS v4 with `@tailwindcss/postcss`

## 🐛 Troubleshooting

- **Icons**: `lucide-react`

**Rate Limit (429)**: Wait 5-10 minutes or use gemini-1.5-flash  

**Collection Not Found**: Run `npm run setup-db`  ### 1. Upload Training Data- **Voice**: Web Speech API (STT, browser-native)

**Model Loading**: First run downloads ~50MB (one-time)

- **Data Loading**:

## 📄 License

Create a CSV file with the following format:  - `puppeteer` for web scraping

MIT

  - `langchain` for text splitting

---

```csv

**Built for call center training excellence** ✨

question_id,question,correct_answer,keywords## 🔧 Setup

1,"What is the process for handling a delayed order?","First, I apologize...","apologize, empathize, verify"

```### 1. Clone and Install



**Required Columns:**```bash

- `question_id`: Unique identifiernpm install

- `question`: Scenario/question for the trainee```

- `correct_answer`: Expected response

- `keywords`: Important keywords (comma-separated)### 2. Environment Variables



Download the [sample template](./sample_training_data.csv) to get started.Copy `.env.example` to `.env` and fill in your credentials:



### 2. Start Training```env

# Astra DB (https://astra.datastax.com)

1. Click "Start Training" tabASTRA_DB_NAMESPACE=default_keyspace

2. Begin your training sessionASTRA_DB_COLLECTION=f1gpt

3. Answer each scenario using voice or textASTRA_DB_API_ENDPOINT=https://your-database-id.apps.astra.datastax.com

4. Complete all questionsASTRA_DB_APPLICATION_TOKEN=AstraCS:your-token-here



### 3. View Results# Google Gemini API (https://aistudio.google.com/app/apikey)

GOOGLE_API_KEY=your-google-api-key-here

After completing the session, view:```

- Overall score and pass/fail status (70% threshold)

- AI-generated performance summary### 3. Set Up Astra DB

- Question-by-question breakdown

- Detailed feedback and improvement tips1. Create a free account at [astra.datastax.com](https://astra.datastax.com)

- Keywords found/missing analysis2. Create a new **Serverless (Vector)** database

3. Create a namespace called `default_keyspace`

## Scoring System4. Generate an Application Token

5. Copy your API Endpoint and Token to `.env`

**Formula**: `(Semantic Similarity × 0.6) + (Keyword Match × 0.4) = Final Score`

### 4. Get Google Gemini API Key

- **Semantic Similarity (60%)**: Measures meaning alignment using vector embeddings

- **Keyword Matching (40%)**: Checks for presence of critical keywords1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)

- **Pass Threshold**: 70% overall score2. Create a new API key

3. Add it to your `.env` file

## Project Structure

### 5. Load F1 Knowledge Base

```

├── app/```bash

│   ├── page.tsx                    # Main training interfacenpm run seed:clean

│   ├── evaluation/page.tsx         # Results & feedback page```

│   └── api/

│       ├── upload-training/        # CSV upload endpointThis will:

│       ├── training-session/       # Session management- Scrape Formula 1 Wikipedia page

│       └── evaluate-session/       # Evaluation engine- Split content into 512-character chunks

├── components/- Generate embeddings for each chunk

│   ├── CSVUpload.tsx              # CSV upload UI- Store in Astra DB for vector search

│   └── TrainingSession.tsx        # Training interface

├── lib/### 6. Run Development Server

│   ├── vectorDb.ts                # Database operations

│   ├── embeddings.ts              # Embedding generation```bash

│   └── gemini.ts                  # Gemini AI clientnpm run dev

└── sample_training_data.csv       # Example training data```

```

Open [http://localhost:3000](http://localhost:3000) and start chatting!

## Database Collections

**🎙️ For voice features:** See [VOICE_SETUP.md](./VOICE_SETUP.md) for detailed voice setup guide.

- `training_questions`: Stores training scenarios with embeddings

- `trainee_responses`: Records trainee answers during sessions## 🎙️ Using Voice Features

- `session_evaluations`: Stores evaluation results and feedback

1. **Click the microphone icon** 🎤 in the chat input

## License2. **Allow microphone access** (first time only)

3. **Speak your question** - You'll see "Listening..."

MIT4. **AI processes and responds** with both text and voice

5. **Click speaker icon** to stop audio playback

**Voice Technologies:**
- **STT**: Web Speech API (free, browser-native)
- **TTS**: Google Cloud TTS (free tier: 1M chars/month)

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

