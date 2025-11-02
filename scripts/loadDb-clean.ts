import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import { config } from "dotenv";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { generateEmbedding } from "../lib/embeddings";
import { getDatabase, insertDocument } from "../lib/vectorDb";

type SimilarityMetric = "dot_product" | "cosine" | "euclidean";

config();

const { ASTRA_DB_COLLECTION } = process.env;

// URLs to scrape for F1 knowledge
const data = [
  "https://en.wikipedia.org/wiki/Formula_One",
];

const db = getDatabase();

// Split text into manageable chunks for embedding
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

/**
 * Create or recreate the Astra DB collection
 * Drops existing collection and creates a new one with vector search capability
 * 
 * @param similarityMetric - The metric to use for vector similarity (default: dot_product)
 */
const createCollection = async (
  similarityMetric: SimilarityMetric = "dot_product"
) => {
  try {
    await db.dropCollection(ASTRA_DB_COLLECTION);
    console.log("✓ Existing collection dropped");
  } catch (error) {
    // Collection doesn't exist, ignore
  }

  const res = await db.createCollection(ASTRA_DB_COLLECTION, {
    vector: {
      dimension: 384, // all-MiniLM-L6-v2 uses 384 dimensions
      metric: similarityMetric,
    },
  });
  console.log("✓ Collection created:", res);
};

/**
 * Scrape URLs, chunk content, generate embeddings, and load into database
 * This is the main data loading pipeline
 */
const loadData = async () => {
  console.log("🚀 Starting data loading process...\n");

  for await (const url of data) {
    console.log(`📄 Scraping ${url}...`);
    const content = await scrapePage(url);
    const chunks = await splitter.splitText(content);
    console.log(`  ➜ Split into ${chunks.length} chunks\n`);

    let count = 0;
    for await (const chunk of chunks) {
      const vector = await generateEmbedding(chunk);
      await insertDocument(chunk, vector);
      count++;
      if (count % 10 === 0) {
        console.log(`  ⏳ Inserted ${count}/${chunks.length} chunks`);
      }
    }
    console.log(`  ✅ Completed: ${count} chunks inserted\n`);
  }

  console.log("🎉 Data loading complete! Your F1 knowledge base is ready.\n");
};

/**
 * Scrape a webpage and extract text content
 * Uses Puppeteer to load the page and extract HTML
 * 
 * @param url - The URL to scrape
 * @returns Cleaned text content from the page
 */
const scrapePage = async (url: string) => {
  const loader = new PuppeteerWebBaseLoader(url, {
    launchOptions: { headless: true },
    gotoOptions: { waitUntil: "domcontentloaded" },
    evaluate: async (page) => {
      const result = await page.evaluate(() => {
        return document.body.innerHTML;
      });
      return result;
    },
  });
  return (await loader.scrape())?.replace(/\s+/g, " ") || "";
};

// Execute the script: create collection then load data
createCollection().then(() => loadData());
