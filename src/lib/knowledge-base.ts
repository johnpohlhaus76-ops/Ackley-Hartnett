import fs from 'fs';
import path from 'path';
import { Anthropic } from '@anthropic-ai/sdk';

const KB_DATA_PATH = path.join(process.cwd(), 'data', 'knowledge-base.json');
const client = new Anthropic();

export interface Document {
  id: string;
  title: string;
  type: 'pdf' | 'video';
  url: string;
  uploadedAt: string;
  content?: string;
  transcript?: string;
  embeddings?: number[];
  summary?: string;
}

export interface KnowledgeBaseData {
  documents: Document[];
  lastUpdated: string;
}

function ensureKbFile() {
  const dir = path.dirname(KB_DATA_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(KB_DATA_PATH)) {
    fs.writeFileSync(KB_DATA_PATH, JSON.stringify({ documents: [], lastUpdated: new Date().toISOString() }));
  }
}

export function getKnowledgeBase(): KnowledgeBaseData {
  ensureKbFile();
  return JSON.parse(fs.readFileSync(KB_DATA_PATH, 'utf-8'));
}

export function saveKnowledgeBase(data: KnowledgeBaseData) {
  ensureKbFile();
  fs.writeFileSync(KB_DATA_PATH, JSON.stringify(data, null, 2));
}


export async function createEmbedding(text: string): Promise<number[]> {
  try {
    // For now, we'll use a simple hash-based embedding as Claude API doesn't have embeddings
    // In production, use a dedicated embeddings service
    const chunks = text.substring(0, 1000).split('');
    const embedding = new Array(384).fill(0);
    chunks.forEach((char, i) => {
      const code = char.charCodeAt(0);
      embedding[i % 384] += code / 256;
    });
    return embedding.map(v => v / chunks.length);
  } catch (error) {
    console.error('Embedding error:', error);
    return new Array(384).fill(0);
  }
}

export async function addDocument(
  title: string,
  type: 'pdf' | 'video',
  url: string,
  content?: string,
  transcript?: string
): Promise<Document> {
  const kb = getKnowledgeBase();

  const textContent = content || transcript || '';
  const embedding = await createEmbedding(textContent);

  // Create a summary using Claude
  let summary = '';
  try {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `Summarize this document in 2-3 sentences:\n\n${textContent.substring(0, 2000)}`,
        },
      ],
    });
    summary = response.content[0].type === 'text' ? response.content[0].text : '';
  } catch (error) {
    console.error('Summary generation error:', error);
  }

  const doc: Document = {
    id: `doc_${Date.now()}`,
    title,
    type,
    url,
    uploadedAt: new Date().toISOString(),
    content,
    transcript,
    embeddings: embedding,
    summary,
  };

  kb.documents.push(doc);
  kb.lastUpdated = new Date().toISOString();
  saveKnowledgeBase(kb);

  return doc;
}

export function getDocuments(): Document[] {
  return getKnowledgeBase().documents;
}

export function getDocument(id: string): Document | undefined {
  return getKnowledgeBase().documents.find(d => d.id === id);
}

export function searchDocuments(query: string, limit = 5): Document[] {
  const kb = getKnowledgeBase();
  const lowerQuery = query.toLowerCase();

  return kb.documents
    .filter(doc => {
      const text = (doc.content || doc.transcript || doc.title).toLowerCase();
      return text.includes(lowerQuery);
    })
    .slice(0, limit);
}

export async function answerQuestion(question: string): Promise<string> {
  const documents = searchDocuments(question, 5);

  if (documents.length === 0) {
    return 'No relevant documents found in the knowledge base.';
  }

  const context = documents
    .map(doc => `[${doc.title}]\n${(doc.content || doc.transcript || doc.summary || '').substring(0, 1000)}`)
    .join('\n\n');

  try {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Based on these documents:\n\n${context}\n\nAnswer this question: ${question}`,
        },
      ],
    });
    return response.content[0].type === 'text' ? response.content[0].text : 'Unable to generate answer';
  } catch (error) {
    console.error('QA error:', error);
    return 'Error generating answer';
  }
}
