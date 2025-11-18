# Web-Powered RAG Chat System

This project is a Retrieval-Augmented Generation (RAG) chat application that converts any web URL into a searchable knowledge base. The system scrapes web content, generates embeddings, stores them for fast retrieval, and answers user queries using a large language model (LLM) grounded in real web data.

---

## Features

- **Web Scraping:** Uses Puppeteer to extract content dynamically from any given URL.
- **Embedding Generation:** Creates vector embeddings of the content using `@xenova/transformers`.
- **Vector Storage:** Stores embeddings in AstraDB for efficient similarity search.
- **RAG Pipeline:** Retrieves relevant content chunks and feeds them to Google Gemini LLM for accurate responses.
- **Text-to-Speech:** Integrates Google Cloud Text-to-Speech for voice responses.
- **Modern Tech Stack:** Built on Next.js with LangChain, TailwindCSS, and TypeScript.

---

## Tech Stack

| Technology                  | Purpose                                  |
|----------------------------|------------------------------------------|
| Next.js 16                 | Full-stack React framework               |
| Puppeteer                  | Headless browser for web scraping       |
| @xenova/transformers       | Local embedding generation               |
| AstraDB                    | Vector database for storing embeddings  |
| Google Generative AI (Gemini) | Language model for response generation  |
| LangChain                  | Orchestrates RAG workflows                |
| TailwindCSS 4              | Styling and UI design                     |
| Google Cloud Text-to-Speech| Optional voice output for answers        |
| TypeScript                 | Strongly typed JavaScript                 |

---

## How It Works

1. **User Input:** Provide a URL to be added as a knowledge source.
2. **Scraping:** Puppeteer visits the URL and extracts the webpage’s textual content.
3. **Chunking:** The extracted content is divided into manageable chunks.
4. **Embedding:** Each chunk is converted to a vector embedding using `@xenova/transformers`.
5. **Storage:** Embeddings are stored in AstraDB for quick similarity search.
6. **Query:** When a user asks a question, relevant chunks are retrieved based on embedding similarity.
7. **Answering:** Retrieved context is sent to Google Gemini, which generates a grounded and accurate answer.
8. **(Optional) TTS:** The answer can be converted to speech using Google Cloud TTS.

---

## Getting Started

### Prerequisites

- Node.js 18+  
- Google Cloud account with Generative AI and Text-to-Speech API enabled  
- AstraDB account and key for vector storage  
- Environment variables set in `.env` file

### Installation

```bash
git clone https://github.com/yourusername/rag-f1.git
cd rag-f1
npm install
