import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { join } from "path";

const client = new Anthropic();

function loadStrategy() {
  try {
    const path = join(process.cwd(), "data", "competitive-strategy.json");
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch (error) {
    return {};
  }
}

const strategy = loadStrategy();

const tools: Anthropic.Messages.Tool[] = [
  {
    name: "get_competitor_profile",
    description: "Get detailed competitive intelligence on a specific competitor",
    input_schema: {
      type: "object" as const,
      properties: {
        competitorName: {
          type: "string",
          description: "Competitor name (e.g., RW Hartnett, IMA, Videojet)",
        },
      },
      required: ["competitorName"],
    },
  },
  {
    name: "find_objection_response",
    description: "Find proven responses to common customer objections",
    input_schema: {
      type: "object" as const,
      properties: {
        objection: {
          type: "string",
          description:
            "Customer objection (e.g., 'price too high', 'FDA validation', 'parts availability')",
        },
      },
      required: ["objection"],
    },
  },
  {
    name: "get_segment_strategy",
    description: "Get competitive positioning strategy for a customer segment",
    input_schema: {
      type: "object" as const,
      properties: {
        segment: {
          type: "string",
          enum: ["largePharma", "genericManufacturers", "cdmos", "confectionery", "emergingMarkets"],
          description: "Customer segment type",
        },
      },
      required: ["segment"],
    },
  },
  {
    name: "get_key_differentiators",
    description: "Get Ackley Hartnett's competitive differentiators",
    input_schema: {
      type: "object" as const,
      properties: {
        category: {
          type: "string",
          enum: [
            "technicalSuperiority",
            "regulatoryExpertise",
            "serviceExcellence",
            "provenTrackRecord",
          ],
          description: "Differentiator category",
        },
      },
      required: ["category"],
    },
  },
  {
    name: "compare_competitors",
    description:
      "Compare Ackley Hartnett against multiple competitors for a segment",
    input_schema: {
      type: "object" as const,
      properties: {
        segment: {
          type: "string",
          description: "Customer segment to focus on",
        },
      },
      required: ["segment"],
    },
  },
];

function processToolCall(toolName: string, toolInput: Record<string, any>): string {
  switch (toolName) {
    case "get_competitor_profile": {
      const competitor = strategy.competitors?.find(
        (c: any) => c.name.toLowerCase().includes((toolInput.competitorName as string).toLowerCase())
      );

      if (!competitor) {
        return JSON.stringify({
          error: `Competitor ${toolInput.competitorName} not found`,
        });
      }

      return JSON.stringify({
        competitor: {
          name: competitor.name,
          type: competitor.type,
          strengths: competitor.strengths,
          weaknesses: competitor.weaknesses,
          howToWin: competitor.winStrategy,
        },
      });
    }

    case "find_objection_response": {
      const objectionKey = (toolInput.objection as string).toLowerCase();
      const objectionData = strategy.objections?.find(
        (o: any) => o.objection.toLowerCase().includes(objectionKey)
      );

      if (!objectionData) {
        return JSON.stringify({
          notFound: `No specific response found. Recommend: emphasize quality, service, FDA compliance, and TCO analysis.`,
        });
      }

      return JSON.stringify({
        objection: objectionData.objection,
        response: objectionData.response,
        proof: objectionData.proof,
        talkingPoints: [
          "ROI and TCO analysis",
          "US-based support advantage",
          "FDA expertise and validation",
          "Proven customer success stories",
        ],
      });
    }

    case "get_segment_strategy": {
      const segment = strategy.customerSegments?.[toolInput.segment as string];

      if (!segment) {
        return JSON.stringify({ error: "Segment not found" });
      }

      return JSON.stringify({
        segment: toolInput.segment,
        strategy: {
          targetAccounts: segment.examples,
          buyingFactors: segment.buyingFactors,
          competeAgainst: segment.competeAgainst,
          keyMessage: segment.keyMessage,
        },
      });
    }

    case "get_key_differentiators": {
      const category = strategy.differentiators?.[toolInput.category as string];

      if (!category) {
        return JSON.stringify({ error: "Category not found" });
      }

      return JSON.stringify({
        category: toolInput.category,
        differentiators: category,
        pitch: `Ackley Hartnett stands out through ${toolInput.category.replace(/([A-Z])/g, " $1").toLowerCase()} - these are our competitive advantages.`,
      });
    }

    case "compare_competitors": {
      const segment = strategy.customerSegments?.[toolInput.segment as string];
      const competitors = strategy.competitors?.filter(
        (c: any) => segment?.competeAgainst?.includes(c.name) || segment?.competeAgainst?.includes(c.type)
      );

      return JSON.stringify({
        segment: toolInput.segment,
        competitors: (competitors || []).map((c: any) => ({
          name: c.name,
          type: c.type,
          weaknesses: c.weaknesses,
          howToWin: c.winStrategy,
        })),
        actiokeyMessage: segment?.keyMessage,
      });
    }

    default:
      return JSON.stringify({ error: "Unknown tool" });
  }
}

export async function runCompetitiveStrategyAgent(query: string): Promise<string> {
  const messages: Anthropic.Messages.MessageParam[] = [
    {
      role: "user",
      content: query,
    },
  ];

  const systemPrompt = `You are a competitive strategy expert for Ackley Hartnett.
You provide sales teams with competitive intelligence, objection responses, and positioning strategies.
You know our differentiators, competitor weaknesses, and how to win deals.
Your goal is to help close deals by positioning Ackley Hartnett against competitors.`;

  let response = await client.messages.create({
    model: "claude-opus-4-1",
    max_tokens: 2048,
    system: systemPrompt,
    tools: tools as Anthropic.Messages.Tool[],
    messages,
  });

  while (response.stop_reason === "tool_use") {
    const assistantMessage = response.content;
    messages.push({
      role: "assistant",
      content: assistantMessage,
    });

    const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type === "tool_use") {
        const toolResult = processToolCall(block.name, block.input as Record<string, any>);
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

  let finalResponse = "";
  for (const block of response.content) {
    if (block.type === "text") {
      finalResponse += block.text;
    }
  }

  return finalResponse || "No response generated";
}
