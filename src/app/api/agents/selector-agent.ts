import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { join } from "path";

function loadCatalog() {
  try {
    const catalogPath = join(process.cwd(), "data", "catalog.json");
    const data = readFileSync(catalogPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load catalog.json", error);
    return { categories: [] };
  }
}

const catalog = loadCatalog();

const client = new Anthropic();

interface CatalogItem {
  partNumber: string;
  name: string;
  detail?: string;
  throughput?: string;
  basePrice?: number;
  kind: string;
}

interface CatalogCategory {
  name: string;
  slug: string;
  items: CatalogItem[];
}

// Tools for the selector agent
const tools: Anthropic.Messages.Tool[] = [
  {
    name: "search_machines_by_capability",
    description: "Search for machines that can perform specific capabilities",
    input_schema: {
      type: "object" as const,
      properties: {
        capability: {
          type: "string",
          description:
            "The capability needed: 'printing', 'laser marking', 'laser drilling', or 'inspection'",
        },
      },
      required: ["capability"],
    },
  },
  {
    name: "search_machines_by_price_range",
    description: "Find machines within a specific price range",
    input_schema: {
      type: "object" as const,
      properties: {
        minPrice: {
          type: "number",
          description: "Minimum price in USD",
        },
        maxPrice: {
          type: "number",
          description: "Maximum price in USD",
        },
      },
      required: ["minPrice", "maxPrice"],
    },
  },
  {
    name: "search_machines_by_throughput",
    description:
      "Find machines with specific throughput/speed capabilities",
    input_schema: {
      type: "object" as const,
      properties: {
        minThroughput: {
          type: "number",
          description:
            "Minimum units per hour or desired speed in thousands",
        },
      },
      required: ["minThroughput"],
    },
  },
  {
    name: "get_all_machines",
    description: "Get a catalog of all available machines",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
];

function processToolCall(
  toolName: string,
  toolInput: Record<string, number | string>
): string {
  const categories = catalog.categories as CatalogCategory[];

  switch (toolName) {
    case "search_machines_by_capability": {
      const capability = (toolInput.capability as string).toLowerCase();
      const results: CatalogItem[] = [];

      categories.forEach((cat) => {
        cat.items.forEach((item) => {
          const categoryName = cat.name.toLowerCase();
          const detail = (item.detail || "").toLowerCase();
          const name = (item.name || "").toLowerCase();

          if (
            categoryName.includes(capability) ||
            detail.includes(capability) ||
            name.includes(capability)
          ) {
            results.push(item);
          }
        });
      });

      return JSON.stringify({
        capability: toolInput.capability,
        machineCount: results.length,
        machines: results.slice(0, 10).map((m) => ({
          name: m.name,
          partNumber: m.partNumber,
          price: m.basePrice,
          throughput: m.throughput,
          detail: m.detail,
        })),
      });
    }

    case "search_machines_by_price_range": {
      const minPrice = toolInput.minPrice as number;
      const maxPrice = toolInput.maxPrice as number;
      const results: CatalogItem[] = [];

      categories.forEach((cat) => {
        cat.items.forEach((item) => {
          if (item.basePrice && item.basePrice >= minPrice && item.basePrice <= maxPrice) {
            results.push(item);
          }
        });
      });

      return JSON.stringify({
        priceRange: { min: minPrice, max: maxPrice },
        machineCount: results.length,
        machines: results.slice(0, 10).map((m) => ({
          name: m.name,
          partNumber: m.partNumber,
          price: m.basePrice,
          throughput: m.throughput,
        })),
      });
    }

    case "search_machines_by_throughput": {
      const minThroughput = toolInput.minThroughput as number;
      const results: CatalogItem[] = [];

      categories.forEach((cat) => {
        cat.items.forEach((item) => {
          if (item.throughput) {
            const throughput = parseInt(item.throughput as string, 10);
            if (throughput >= minThroughput) {
              results.push(item);
            }
          }
        });
      });

      return JSON.stringify({
        minThroughput: minThroughput,
        machineCount: results.length,
        machines: results.slice(0, 10).map((m) => ({
          name: m.name,
          partNumber: m.partNumber,
          price: m.basePrice,
          throughput: m.throughput,
        })),
      });
    }

    case "get_all_machines": {
      const allMachines: CatalogItem[] = [];
      categories.forEach((cat) => {
        allMachines.push(...cat.items);
      });

      return JSON.stringify({
        totalMachines: allMachines.length,
        categories: categories.map((c) => ({
          name: c.name,
          count: c.items.length,
        })),
        sampledMachines: allMachines.slice(0, 20).map((m) => ({
          name: m.name,
          partNumber: m.partNumber,
          price: m.basePrice,
          throughput: m.throughput,
        })),
      });
    }

    default:
      return JSON.stringify({ error: "Unknown tool" });
  }
}

export async function runSelectorAgent(clientRequirements: string): Promise<string> {
  const messages: Anthropic.Messages.MessageParam[] = [
    {
      role: "user",
      content: clientRequirements,
    },
  ];

  const systemPrompt = `You are a machine selection specialist for Ackley-Hartnett.
You help clients find the perfect pharmaceutical printing, laser drilling, or laser marking machine based on their needs.

Your goal is to:
1. Understand the client's requirements (throughput/speed, budget, capabilities needed, product type)
2. Search the machine catalog using available tools
3. Compare options and recommend the best fit based on:
   - Price and budget constraints
   - Speed/throughput requirements
   - Required capabilities (printing, laser drilling, laser marking, inspection)
   - Product specifications and features

Always ask clarifying questions if requirements are unclear, and provide detailed recommendations
with reasoning about why each machine is a good fit.`;

  let response = await client.messages.create({
    model: "claude-opus-4-1",
    max_tokens: 2048,
    system: systemPrompt,
    tools: tools as Anthropic.Messages.Tool[],
    messages,
  });

  // Agentic loop
  while (response.stop_reason === "tool_use") {
    const assistantMessage = response.content;
    messages.push({
      role: "assistant",
      content: assistantMessage,
    });

    const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type === "tool_use") {
        const toolResult = processToolCall(
          block.name,
          block.input as Record<string, number | string>
        );
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: toolResult,
        });
      }
    }

    messages.push({
      role: "user",
      content: toolResults,
    });

    response = await client.messages.create({
      model: "claude-opus-4-1",
      max_tokens: 2048,
      system: systemPrompt,
      tools: tools as Anthropic.Messages.Tool[],
      messages,
    });
  }

  // Extract final text response
  let finalResponse = "";
  for (const block of response.content) {
    if (block.type === "text") {
      finalResponse += block.text;
    }
  }

  return finalResponse || "No recommendations generated";
}
