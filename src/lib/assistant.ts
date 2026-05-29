import { CATEGORIES, PRODUCTS, GMP_PILLARS } from "./marketing";
import fs from "fs";
import path from "path";

/**
 * Reads all markdown files from a knowledge directory.
 * Returns empty string if the directory doesn't exist (build-safe).
 */
function loadKnowledgeDir(dirName: string): string {
  const knowledgePath = path.join(process.cwd(), "data", "knowledge", dirName);
  if (!fs.existsSync(knowledgePath)) return "";

  const files = fs.readdirSync(knowledgePath)
    .filter((f) => f.endsWith(".md"))
    .sort();

  return files
    .map((fname) => {
      const content = fs.readFileSync(path.join(knowledgePath, fname), "utf-8");
      return content.trim();
    })
    .join("\n\n---\n\n");
}

/**
 * Shared knowledge base — product catalog + GMP pillars.
 * Kept stable (no timestamps / per-request data) so it can be prompt-cached.
 */
export function buildKnowledgeBase(): string {
  const categories = CATEGORIES.map(
    (c) => `- ${c.name} (${c.tagline}): ${c.description}`,
  ).join("\n");

  const products = PRODUCTS.map((p) => {
    const cat = CATEGORIES.find((c) => c.slug === p.category)?.name ?? p.category;
    return [
      `### ${p.name} — ${p.tagline}`,
      `Category: ${cat}`,
      `Throughput: ${p.throughput}`,
      `Technology: ${p.technology}`,
      `Sides: ${p.sides}`,
      `Feed system: ${p.feed}`,
      `Summary: ${p.blurb}`,
      `Highlights: ${p.highlights.join("; ")}`,
      `Datasheet: ${p.datasheet ?? "available on request"}`,
      `Page: /machines/${p.slug}`,
    ].join("\n");
  }).join("\n\n");

  const pillars = GMP_PILLARS.map((p) => `- ${p.title}: ${p.text}`).join("\n");

  // Load datasheet knowledge files
  const kyleDatasheets = loadKnowledgeDir("kyle");

  return `# Ackley Hartnett — Company & Product Knowledge Base

Ackley Hartnett designs and builds pharmaceutical tablet and capsule identification systems:
edible-ink rotogravure printing, CO2 and UV laser marking, precision laser drilling, and inline
vision/depth inspection. Equipment serves pharmaceutical, confectionery, and battery & energy
manufacturers worldwide, and is engineered for GMP environments.

Contact: phone 215-969-9190 · email info@ackleyhartnett.com · locations Langhorne & Moorestown, USA.

## Why it matters (safety, efficacy, cleanliness, GMP)
${pillars}

## Capabilities
${categories}

## Validation & compliance (standard with machines)
- IQ/OQ documentation for servo, PLC, and ancillary equipment
- Design Qualification (DQ) and Functional Specification (FS) documents
- OPC-UA data gateway with documented tag list for MES/historian integration
- 21 CFR Part 11-ready electronic records and audit trails
- Laser power-sensor recalibration (with certificate) and CO2 gas reconditioning
- Worldwide commissioning, field service, and remote engineering support

## Machine Catalog (summary)
${products}

## Full Datasheet Specifications
${kyleDatasheets}`;
}

/**
 * TIM-specific knowledge: maintenance, troubleshooting, calibration.
 * Loaded separately so TIM gets the maintenance-relevant datasheets.
 */
export function buildTimKnowledgeBase(): string {
  const timDocs = loadKnowledgeDir("tim");
  const sharedDocs = loadKnowledgeDir("shared");

  const base = buildKnowledgeBase();

  const extra = [timDocs, sharedDocs].filter(Boolean).join("\n\n---\n\n");
  if (!extra) return base;

  return base + "\n\n## TIM Maintenance Reference\n\n" + extra;
}

export const SYSTEM_PROMPT = `You are "Ask AH", the AI assistant for Ackley Hartnett pharmaceutical marking systems.`;
