import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { join } from "path";
import {
  getCustomerByName,
  getCustomersByPriority,
  getCustomersByIndustry,
  getTopCustomers,
  getCustomerStats
} from "@/lib/machine-tracking";

const client = new Anthropic();

function loadMarketData() {
  try {
    const marketPath = join(process.cwd(), "data", "global-market-analysis.json");
    const data = readFileSync(marketPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load market data", error);
    return [];
  }
}

const marketData = loadMarketData();

const tools: Anthropic.Messages.Tool[] = [
  {
    name: "get_market_overview",
    description: "Get global business overview with revenue and pipeline metrics",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "get_top_markets",
    description: "Get top markets ranked by revenue or pipeline",
    input_schema: {
      type: "object" as const,
      properties: {
        metric: {
          type: "string",
          enum: ["revenue", "pipeline", "total_value"],
          description: "Ranking metric",
        },
        limit: {
          type: "number",
          description: "Number of markets to return (default: 10)",
        },
      },
      required: ["metric"],
    },
  },
  {
    name: "get_market_details",
    description: "Get detailed metrics for a specific country",
    input_schema: {
      type: "object" as const,
      properties: {
        country: {
          type: "string",
          description: "Country name (e.g., USA, India, Germany)",
        },
      },
      required: ["country"],
    },
  },
  {
    name: "get_growth_opportunities",
    description: "Identify markets with highest growth potential (quote pipeline vs current revenue)",
    input_schema: {
      type: "object" as const,
      properties: {
        limit: {
          type: "number",
          description: "Number of opportunities to show (default: 10)",
        },
      },
      required: [],
    },
  },
  {
    name: "get_market_by_customer_count",
    description: "Find markets by number of customers or quote customers",
    input_schema: {
      type: "object" as const,
      properties: {
        type: {
          type: "string",
          enum: ["existing", "quoted"],
          description: "Find by existing customers or quoted customers",
        },
      },
      required: ["type"],
    },
  },
  {
    name: "analyze_pipeline_forecast",
    description: "Analyze pipeline and forecast potential revenue impact",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "get_customer_profile",
    description: "Get detailed profile of a specific customer",
    input_schema: {
      type: "object" as const,
      properties: {
        customerName: {
          type: "string",
          description: "Customer company name",
        },
      },
      required: ["customerName"],
    },
  },
  {
    name: "get_critical_customers",
    description: "Get all critical/high-priority customers",
    input_schema: {
      type: "object" as const,
      properties: {
        level: {
          type: "string",
          enum: ["A - Critical", "B - High", "C - Medium", "D - Low"],
          description: "Priority level",
        },
      },
      required: ["level"],
    },
  },
  {
    name: "get_industry_analysis",
    description: "Analyze customers by industry",
    input_schema: {
      type: "object" as const,
      properties: {
        industry: {
          type: "string",
          description: "Industry (Pharmaceutical, Food/Beverage, etc.)",
        },
      },
      required: ["industry"],
    },
  },
  {
    name: "get_customer_summary",
    description: "Get complete customer database summary and statistics",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
];

function processToolCall(
  toolName: string,
  toolInput: Record<string, any>
): string {
  switch (toolName) {
    case "get_market_overview": {
      const totalRevenue = marketData.reduce(
        (sum: number, m: any) => sum + (m.Revenue || 0),
        0
      );
      const totalPipeline = marketData.reduce(
        (sum: number, m: any) => sum + (m.Quote_Value || 0),
        0
      );
      const totalValue = marketData.reduce(
        (sum: number, m: any) => sum + (m.Total_Value || 0),
        0
      );
      const totalCustomers = marketData.reduce(
        (sum: number, m: any) => sum + (m.Customers || 0),
        0
      );
      const totalOrders = marketData.reduce(
        (sum: number, m: any) => sum + (m.Orders || 0),
        0
      );
      const totalQuotes = marketData.reduce(
        (sum: number, m: any) => sum + (m.Quotes || 0),
        0
      );

      return JSON.stringify({
        overview: {
          totalRevenue: totalRevenue.toFixed(2),
          quotePipeline: totalPipeline.toFixed(2),
          totalValue: totalValue.toFixed(2),
          totalCustomers,
          totalOrders,
          pendingQuotes: totalQuotes,
          conversionRate: (
            (totalRevenue / (totalRevenue + totalPipeline)) *
            100
          ).toFixed(1),
          countries: marketData.length,
        },
      });
    }

    case "get_top_markets": {
      const metric = toolInput.metric as string;
      const limit = toolInput.limit || 10;
      const metricMap: Record<string, string> = {
        revenue: "Revenue",
        pipeline: "Quote_Value",
        total_value: "Total_Value",
      };
      const key = metricMap[metric];

      const sorted = [...marketData]
        .sort((a, b) => (b[key] || 0) - (a[key] || 0))
        .slice(0, limit);

      return JSON.stringify({
        metric,
        markets: sorted.map((m: any) => ({
          country: m.Country,
          revenue: m.Revenue?.toFixed(0),
          pipeline: m.Quote_Value?.toFixed(0),
          totalValue: m.Total_Value?.toFixed(0),
          customers: m.Customers,
          orders: m.Orders,
          quoteCustomers: m.Quote_Customers,
        })),
      });
    }

    case "get_market_details": {
      const country = (toolInput.country as string).toLowerCase();
      const market = marketData.find(
        (m: any) => m.Country.toLowerCase() === country
      );

      if (!market) {
        return JSON.stringify({ error: `Country ${toolInput.country} not found` });
      }

      const conversion = (
        (market.Revenue / (market.Revenue + market.Quote_Value)) *
        100
      ).toFixed(1);
      const avgOrderValue = (market.Revenue / market.Orders).toFixed(0);
      const avgQuoteValue = (market.Quote_Value / market.Quotes).toFixed(0);

      return JSON.stringify({
        country: market.Country,
        metrics: {
          revenue: market.Revenue?.toFixed(0),
          customers: market.Customers,
          orders: market.Orders,
          avgOrderValue: avgOrderValue,
          quotePipeline: market.Quote_Value?.toFixed(0),
          quoteCustomers: market.Quote_Customers,
          pendingQuotes: market.Quotes,
          avgQuoteValue: avgQuoteValue,
          totalValue: market.Total_Value?.toFixed(0),
          conversionRate: conversion,
        },
      });
    }

    case "get_growth_opportunities": {
      const limit = toolInput.limit || 10;
      const withGrowth = marketData
        .map((m: any) => ({
          country: m.Country,
          revenue: m.Revenue || 0,
          pipeline: m.Quote_Value || 0,
          growthRatio:
            m.Quote_Value / (m.Revenue || 1),
          customers: m.Customers,
          quoteCustomers: m.Quote_Customers,
        }))
        .filter((m: any) => m.growthRatio > 0)
        .sort((a: any, b: any) => b.growthRatio - a.growthRatio)
        .slice(0, limit);

      return JSON.stringify({
        opportunities: withGrowth.map((m: any) => ({
          country: m.country,
          currentRevenue: m.revenue.toFixed(0),
          quotePipeline: m.pipeline.toFixed(0),
          growthPotential: (m.growthRatio * 100).toFixed(1) + "%",
          existingCustomers: m.customers,
          newQuoteCustomers: m.quoteCustomers,
          recommendedAction: `Focus on closing ${m.quoteCustomers} quoted customers to unlock $${m.pipeline.toFixed(0)} in new revenue`,
        })),
      });
    }

    case "get_market_by_customer_count": {
      const type = toolInput.type as string;
      const key = type === "existing" ? "Customers" : "Quote_Customers";
      const sorted = [...marketData]
        .sort((a, b) => (b[key] || 0) - (a[key] || 0))
        .slice(0, 10);

      return JSON.stringify({
        type: type === "existing" ? "Existing Customers" : "Quoted Customers",
        markets: sorted.map((m: any) => ({
          country: m.Country,
          count: m[key],
          revenue: m.Revenue?.toFixed(0),
          pipeline: m.Quote_Value?.toFixed(0),
        })),
      });
    }

    case "analyze_pipeline_forecast": {
      const totalRevenue = marketData.reduce(
        (sum: number, m: any) => sum + (m.Revenue || 0),
        0
      );
      const totalPipeline = marketData.reduce(
        (sum: number, m: any) => sum + (m.Quote_Value || 0),
        0
      );
      const avgConversionRate = totalRevenue / (totalRevenue + totalPipeline);

      const scenarios = {
        conservative: (totalPipeline * 0.5 * avgConversionRate).toFixed(0),
        moderate: (totalPipeline * 0.75 * avgConversionRate).toFixed(0),
        optimistic: (totalPipeline * 1.0 * avgConversionRate).toFixed(0),
      };

      return JSON.stringify({
        currentRevenue: totalRevenue.toFixed(0),
        pendingPipeline: totalPipeline.toFixed(0),
        projectedRevenue: {
          conservative: `$${scenarios.conservative} (50% conversion)`,
          moderate: `$${scenarios.moderate} (75% conversion)`,
          optimistic: `$${scenarios.optimistic} (100% conversion)`,
        },
        totalPotential: (totalRevenue + totalPipeline).toFixed(0),
      });
    }

    case "get_customer_profile": {
      const customer = getCustomerByName(toolInput.customerName);

      if (!customer) {
        return JSON.stringify({
          error: `Customer '${toolInput.customerName}' not found`,
        });
      }

      return JSON.stringify({
        customer: {
          name: customer.Company,
          industry: customer.Industry,
          country: customer.Country,
          state: customer.State,
          city: customer.City,
          region: customer.Region,
          priority: customer.Priority_Level,
          priorityScore: customer.Priority_Score,
          customerType: customer.Customer_Type,
          activityCount: customer.Activity_Count,
          lastActivity: customer.Last_Activity_Date,
          activityValue: customer.Activity_Value?.toFixed(0),
          salesRep: customer.Sales_Rep,
        },
      });
    }

    case "get_critical_customers": {
      const level = toolInput.level as string;
      const customers = getCustomersByPriority(level);

      return JSON.stringify({
        priorityLevel: level,
        customerCount: customers.length,
        customers: customers
          .sort((a: any, b: any) => (b.Activity_Value || 0) - (a.Activity_Value || 0))
          .slice(0, 10)
          .map((c: any) => ({
            name: c.Company,
            industry: c.Industry,
            country: c.Country,
            activityValue: c.Activity_Value?.toFixed(0),
            salesRep: c.Sales_Rep,
          })),
      });
    }

    case "get_industry_analysis": {
      const industry = toolInput.industry as string;
      const customers = getCustomersByIndustry(industry);
      const totalValue = customers.reduce(
        (sum: number, c: any) => sum + (c.Activity_Value || 0),
        0
      );

      return JSON.stringify({
        industry,
        totalCustomers: customers.length,
        totalActivityValue: totalValue.toFixed(0),
        topCustomers: customers
          .sort((a: any, b: any) => (b.Activity_Value || 0) - (a.Activity_Value || 0))
          .slice(0, 5)
          .map((c: any) => ({
            name: c.Company,
            country: c.Country,
            activityValue: c.Activity_Value?.toFixed(0),
            priority: c.Priority_Level,
          })),
      });
    }

    case "get_customer_summary": {
      const stats = getCustomerStats();
      const topCustomers = getTopCustomers(5);

      return JSON.stringify({
        summary: {
          totalCustomers: stats.totalCustomers,
          totalActivityValue: stats.totalActivityValue.toFixed(0),
          avgActivityPerCustomer: (stats.totalActivityValue / stats.totalCustomers).toFixed(0),
        },
        byPriority: stats.byPriority,
        byIndustry: stats.byIndustry,
        topCustomers: topCustomers.map((c: any) => ({
          name: c.Company,
          industry: c.Industry,
          country: c.Country,
          activityValue: c.Activity_Value?.toFixed(0),
          priority: c.Priority_Level,
        })),
      });
    }

    default:
      return JSON.stringify({ error: "Unknown tool" });
  }
}

export async function runSalesIntelAgent(question: string): Promise<string> {
  const messages: Anthropic.Messages.MessageParam[] = [
    {
      role: "user",
      content: question,
    },
  ];

  const systemPrompt = `You are a sales intelligence expert for Ackley-Hartnett pharmaceutical printing machinery.
Your role is to analyze global market data, identify growth opportunities, and provide strategic insights
to drive hundreds of billions in sales.

You have access to comprehensive market data including:
- Revenue by country (current business)
- Quote pipeline by country (future potential)
- Customer counts and order history
- Regional growth opportunities

Provide actionable insights, identify strategic priorities, and help forecast revenue potential.
Always be specific with numbers and highlight high-impact opportunities.`;

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
          block.input as Record<string, any>
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

  // Extract final response
  let finalResponse = "";
  for (const block of response.content) {
    if (block.type === "text") {
      finalResponse += block.text;
    }
  }

  return finalResponse || "No response generated";
}
