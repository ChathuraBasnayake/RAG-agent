# Project Structure

## 📁 Directory Organization

```
call-center-training/
├── app/                              # Next.js App Router
│   ├── page.tsx                      # Homepage with upload/training tabs
│   ├── layout.tsx                    # Root layout (metadata, fonts)
│   ├── global.css                    # Global styles
│   ├── evaluation/                   # Evaluation results page
│   │   └── page.tsx                  # Display scores & feedback
│   └── api/                          # API Routes
│       ├── upload-training/          # CSV Upload
│       │   └── route.ts              # POST: Parse & store CSV
│       ├── training-session/         # Session Management
│       │   └── route.ts              # GET: Start, POST: Submit answer
│       └── evaluate-session/         # Evaluation Engine
│           └── route.ts              # POST: Score & generate feedback
│
├── components/                       # React Components
│   ├── CSVUpload.tsx                # CSV file upload UI
│   └── TrainingSession.tsx          # Training interface with voice
│
├── lib/                             # Core Business Logic
│   ├── vectorDb.ts                  # Astra DB operations
│   ├── embeddings.ts                # Vector generation (384D)
│   └── gemini.ts                    # Gemini AI client
│
├── scripts/                         # Utility Scripts
│   └── setup-db.ts                  # Initialize database collections
│
├── public/                          # Static Assets
│   └── sample_training_data.csv     # Example CSV template
│
├── .env                             # Environment variables (gitignored)
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore rules
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # TypeScript configuration
├── next.config.ts                   # Next.js configuration
├── tailwind.config.js               # Tailwind CSS configuration
└── README.md                        # Documentation
```

## 🔄 Data Flow

### 1. Upload Flow
```
User → CSVUpload.tsx → /api/upload-training
                     → Parse CSV (PapaParse)
                     → Generate embeddings (lib/embeddings.ts)
                     → Store in Astra DB (lib/vectorDb.ts)
```

### 2. Training Flow
```
User → TrainingSession.tsx → /api/training-session (GET: start)
                           → Display questions
    → Answer (voice/text) → /api/training-session (POST: submit)
                           → Generate answer embedding
                           → Store response in DB
```

### 3. Evaluation Flow
```
User → Complete session → /api/evaluate-session
                       → Fetch all responses
                       → Calculate scores (cosine similarity + keywords)
                       → Generate AI feedback (Gemini)
                       → Display results (evaluation/page.tsx)
```

## 📦 Module Responsibilities

### `lib/vectorDb.ts`
**Purpose**: Database abstraction layer  
**Exports**:
- `getDatabase()` - Get DB instance
- `getTrainingQuestions()` - Fetch all questions
- `getQuestionById()` - Fetch specific question
- `storeTraineeResponse()` - Save answer
- `getSessionResponses()` - Fetch session answers
- `updateResponseEvaluation()` - Save evaluation

**Types**:
- `TrainingQuestion` - Question structure
- `TraineeResponse` - Answer structure

### `lib/embeddings.ts`
**Purpose**: Vector embedding generation  
**Exports**:
- `generateEmbedding(text)` - Convert text to 384D vector
- `getEmbedder()` - Get/initialize model

**Model**: Xenova/all-MiniLM-L6-v2 (384 dimensions)

### `lib/gemini.ts`
**Purpose**: AI client for evaluation  
**Exports**:
- `generateResponse(prompt, config)` - Get AI response
- `getGeminiModel(config)` - Get configured model

**Model**: gemini-1.5-flash

### `components/CSVUpload.tsx`
**Purpose**: File upload interface  
**Features**:
- Drag & drop support
- Format validation
- Upload progress
- Success/error messages

### `components/TrainingSession.tsx`
**Purpose**: Training interface  
**Features**:
- Voice recognition (Web Speech API)
- Progress tracking
- Question display
- Answer submission
- Session management

### `app/api/upload-training/route.ts`
**Endpoint**: POST /api/upload-training  
**Purpose**: Process CSV uploads  
**Flow**:
1. Validate file
2. Parse CSV
3. Generate embeddings
4. Store in database
5. Return statistics

### `app/api/training-session/route.ts`
**Endpoints**:
- GET `?action=start` - Start session
- POST - Submit answer

**Flow**:
1. GET: Fetch questions, create session ID
2. POST: Generate embedding, store response

### `app/api/evaluate-session/route.ts`
**Endpoint**: POST /api/evaluate-session  
**Purpose**: Evaluate completed sessions  
**Flow**:
1. Fetch all responses
2. Calculate semantic similarity
3. Check keyword matching
4. Compute final scores
5. Generate AI feedback
6. Return detailed results

## 🔧 Configuration Files

### `tsconfig.json`
- TypeScript compiler options
- Path aliases (`@/` → root)
- Strict type checking

### `next.config.ts`
- Next.js configuration
- Build settings
- Environment variables

### `tailwind.config.js`
- Tailwind CSS customization
- Theme configuration
- Plugin settings

## 🗄️ Database Schema

### Collection: `training_questions`
```typescript
{
  _id: string,
  question_id: string,
  question: string,
  $vector: number[384],        // Question embedding
  correct_answer: string,
  answer_embedding: number[384], // Answer embedding
  keywords: string[],
  uploaded_at: string
}
```

### Collection: `trainee_responses`
```typescript
{
  _id: string,
  response_id: string,
  session_id: string,
  trainee_id: string,
  question_id: string,
  response_text: string,
  $vector: number[384],        // Response embedding
  timestamp: string,
  evaluation?: {
    semantic_similarity: number,
    keyword_score: number,
    final_score: number,
    feedback: string,
    keywords_found: string[],
    keywords_missing: string[]
  }
}
```

## 🎯 Design Principles

1. **Modular Architecture**: Each module has single responsibility
2. **Type Safety**: Full TypeScript coverage with strict types
3. **Error Handling**: Graceful degradation, user-friendly messages
4. **Performance**: Lazy loading, caching, efficient queries
5. **Maintainability**: Clear documentation, consistent naming
6. **Scalability**: Stateless API, vector database, modular components

## 🔐 Security Considerations

- Environment variables for secrets
- Input validation on CSV uploads
- Type-safe API endpoints
- No client-side secrets
- Sanitized error messages

## 📊 Performance Optimizations

- Model caching (embeddings loaded once)
- Vector database indexing
- Lazy component loading
- Efficient CSV parsing
- Minimal API calls

---

**Last Updated**: 2025-11-03  
**Version**: 1.0.0
