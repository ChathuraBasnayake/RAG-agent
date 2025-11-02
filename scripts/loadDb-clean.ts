import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import { config } from "dotenv";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { generateEmbedding } from "../lib/embeddings";
import { getDatabase, insertDocument } from "../lib/vectorDb";

type SimilarityMetric = "dot_product" | "cosine" | "euclidean";

config();

const { ASTRA_DB_COLLECTION } = process.env;

const data = [
  "https://en.wikipedia.org/wiki/Formula_One",
];

const db = getDatabase();

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

/**
 * Create or recreate the collection
 */
const createCollection = async (
  similarityMetric: SimilarityMetric = "dot_product"
) => {
  try {
    await db.dropCollection(ASTRA_DB_COLLECTION);
    console.log("Existing collection dropped");
  } catch (error) {
    // Collection doesn't exist, ignore
  }

  const res = await db.createCollection(ASTRA_DB_COLLECTION, {
    vector: {
      dimension: 384, // all-MiniLM-L6-v2 uses 384 dimensions
      metric: similarityMetric,
    },
  });
  console.log("Collection created:", res);
};

/**
 * Scrape and load data from URLs
 */
const loadData = async () => {
  console.log("Starting data loading process...");

  for await (const url of data) {
    console.log(`\nScraping ${url}...`);
    const content = await scrapePage(url);
    const chunks = await splitter.splitText(content);
    console.log(`Processing ${chunks.length} chunks...`);

    let count = 0;
    for await (const chunk of chunks) {
      const vector = await generateEmbedding(chunk);
      await insertDocument(chunk, vector);
      count++;
      if (count % 10 === 0) {
        console.log(`  Inserted ${count}/${chunks.length} chunks`);
      }
    }
    console.log(`✅ Completed: ${count} chunks inserted`);
  }

  console.log("\n🎉 Data loading complete!");
};

/**
 * Scrape a webpage and extract text content
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

// Run the script
createCollection().then(() => loadData());
