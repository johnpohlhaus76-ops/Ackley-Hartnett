import Anthropic from "@anthropic-ai/sdk";
import {
  getDrugsByLocation,
  getMachinesByDrug,
  getMachinesByCapability,
  getAllMachineInstallations,
  getQuotesByCustomer,
  getQuotesByStatus,
  getRecentQuotes,
  getMachinesByDrugName,
  getDrugsByCountry,
  getSerialsByCustomer,
  getAllUniqueDrugs,
  getAllCountries,
  getPrintersByProduct,
  getPrintersByCustomer,
  getTopPrinterCustomers,
  getTopPrinterProducts
} from "@/lib/machine-tracking";

const client = new Anthropic();

// Tools for the service agent
const tools: Anthropic.Messages.Tool[] = [
  {
    name: "get_drugs_by_location",
    description:
      "Get all drugs processed at a specific location/account",
    input_schema: {
      type: "object" as const,
      properties: {
        locationId: {
          type: "string",
          description: "The location/account ID (e.g., rieckermann-beijing-saike)",
        },
      },
      required: ["locationId"],
    },
  },
  {
    name: "get_machines_by_drug",
    description:
      "Get all machines at all locations that have processed a specific drug",
    input_schema: {
      type: "object" as const,
      properties: {
        drugName: {
          type: "string",
          description: "The name of the drug (e.g., Aspirin, Paracetamol)",
        },
      },
      required: ["drugName"],
    },
  },
  {
    name: "get_machines_by_capability",
    description:
      "Get machines that can perform a specific capability (print, laser drill, or laser mark)",
    input_schema: {
      type: "object" as const,
      properties: {
        capability: {
          type: "string",
          enum: ["print", "laserDrill", "laserMark"],
          description: "The machine capability needed",
        },
      },
      required: ["capability"],
    },
  },
  {
    name: "get_drug_processing_history",
    description: "Get the complete drug processing history across all locations",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "get_machines_by_drug_name",
    description: "Get all machines that have processed a specific pharmaceutical product",
    input_schema: {
      type: "object" as const,
      properties: {
        drugName: {
          type: "string",
          description: "The pharmaceutical product name (e.g., Tylenol, Advil, Tagamet)",
        },
      },
      required: ["drugName"],
    },
  },
  {
    name: "get_drugs_by_country",
    description: "Get all drugs that have been processed in a specific country",
    input_schema: {
      type: "object" as const,
      properties: {
        country: {
          type: "string",
          description: "The country name (e.g., USA, China, India)",
        },
      },
      required: ["country"],
    },
  },
  {
    name: "get_serials_by_customer",
    description: "Get all serial numbers and drug processing history for a specific customer",
    input_schema: {
      type: "object" as const,
      properties: {
        customerName: {
          type: "string",
          description: "The customer name (e.g., Smith Kline, Lilly)",
        },
      },
      required: ["customerName"],
    },
  },
  {
    name: "get_all_drugs",
    description: "Get a list of all unique pharmaceutical products in the system",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "get_all_countries",
    description: "Get a list of all countries where machines are installed",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "get_printers_by_product",
    description: "Get all printers that have been configured for a specific product",
    input_schema: {
      type: "object" as const,
      properties: {
        product: {
          type: "string",
          description: "Product name (e.g., Tylenol, M&M, Advil)",
        },
      },
      required: ["product"],
    },
  },
  {
    name: "get_printers_by_customer",
    description: "Get all printers installed at a specific customer",
    input_schema: {
      type: "object" as const,
      properties: {
        customer: {
          type: "string",
          description: "Customer name (e.g., Eli Lilly, M&M Mars, McNeil)",
        },
      },
      required: ["customer"],
    },
  },
  {
    name: "get_top_printer_customers",
    description: "Get the top customers by number of printers installed",
    input_schema: {
      type: "object" as const,
      properties: {
        limit: {
          type: "number",
          description: "Number of top customers to return (default: 10)",
        },
      },
      required: [],
    },
  },
  {
    name: "get_top_printer_products",
    description: "Get the most common products processed by printers",
    input_schema: {
      type: "object" as const,
      properties: {
        limit: {
          type: "number",
          description: "Number of top products to return (default: 20)",
        },
      },
      required: [],
    },
  },
];

function processToolCall(
  toolName: string,
  toolInput: Record<string, string>
): string {
  switch (toolName) {
    case "get_drugs_by_location": {
      const drugs = getDrugsByLocation(toolInput.locationId);
      return JSON.stringify({
        location: toolInput.locationId,
        drugs,
        count: drugs.length,
      });
    }
    case "get_machines_by_drug": {
      const machines = getMachinesByDrug(toolInput.drugName);
      return JSON.stringify({
        drug: toolInput.drugName,
        machines: machines.map((m) => ({
          machineName: m.machineName,
          location: m.locationName,
          country: m.country,
          city: m.city,
          capabilities: m.capabilities,
          installedDate: m.installedDate,
          drugs: m.drugs,
        })),
        count: machines.length,
      });
    }
    case "get_machines_by_capability": {
      const machines = getMachinesByCapability(
        toolInput.capability as "print" | "laserDrill" | "laserMark"
      );
      return JSON.stringify({
        capability: toolInput.capability,
        machines: machines.map((m) => ({
          machineName: m.machineName,
          location: m.locationName,
          country: m.country,
          city: m.city,
          drugs: m.drugs,
          capabilities: m.capabilities,
        })),
        count: machines.length,
      });
    }
    case "get_drug_processing_history": {
      const allInstalls = getAllMachineInstallations();
      return JSON.stringify({
        totalInstallations: allInstalls.length,
        summary: {
          totalLocations: new Set(allInstalls.map((i) => i.locationId)).size,
          totalDrugs: new Set(
            allInstalls.flatMap((i) => i.drugs)
          ).size,
        },
        data: allInstalls.slice(0, 20),
      });
    }
    case "get_machines_by_drug_name": {
      const machines = getMachinesByDrugName(toolInput.drugName);
      return JSON.stringify({
        drug: toolInput.drugName,
        machineCount: machines.length,
        machines: machines.slice(0, 10).map((m) => ({
          serialNumber: m.SN,
          customer: m.Customer,
          country: m.Country,
          product: m.Product,
          shipped: m.Shipped,
        })),
      });
    }
    case "get_drugs_by_country": {
      const drugs = getDrugsByCountry(toolInput.country);
      return JSON.stringify({
        country: toolInput.country,
        recordCount: drugs.length,
        uniqueDrugs: new Set(drugs.map((d) => d.Product)).size,
        samples: drugs.slice(0, 10).map((d) => ({
          drug: d.Product,
          customer: d.Customer,
          serialNumber: d.SN,
        })),
      });
    }
    case "get_serials_by_customer": {
      const serials = getSerialsByCustomer(toolInput.customerName);
      return JSON.stringify({
        customer: toolInput.customerName,
        totalMachines: serials.length,
        machines: serials.map((s) => ({
          serialNumber: s.SN,
          product: s.Product,
          country: s.Country,
          shipped: s.Shipped,
        })),
      });
    }
    case "get_all_drugs": {
      const drugs = getAllUniqueDrugs();
      return JSON.stringify({
        totalUniqueDrugs: drugs.length,
        drugs: drugs.slice(0, 50),
        moreAvailable: drugs.length > 50,
      });
    }
    case "get_all_countries": {
      const countries = getAllCountries();
      return JSON.stringify({
        totalCountries: countries.length,
        countries,
      });
    }
    case "get_printers_by_product": {
      const printers = getPrintersByProduct(toolInput.product);
      return JSON.stringify({
        product: toolInput.product,
        printerCount: printers.length,
        printers: printers.slice(0, 15).map((p: any) => ({
          serialNumber: p.SN,
          customer: p.Customer,
          shipped: p.Shipped,
          description: p.Description,
        })),
      });
    }
    case "get_printers_by_customer": {
      const printers = getPrintersByCustomer(toolInput.customer);
      return JSON.stringify({
        customer: toolInput.customer,
        totalPrinters: printers.length,
        printers: printers.map((p: any) => ({
          serialNumber: p.SN,
          product: p.Product,
          shipped: p.Shipped,
          customerPO: p["Customer PO"],
        })),
      });
    }
    case "get_top_printer_customers": {
      const limit = toolInput.limit ? parseInt(toolInput.limit as string) : 10;
      const topCustomers = getTopPrinterCustomers(limit);
      return JSON.stringify({
        topCustomerCount: limit,
        customers: topCustomers,
      });
    }
    case "get_top_printer_products": {
      const limit = toolInput.limit ? parseInt(toolInput.limit as string) : 20;
      const topProducts = getTopPrinterProducts(limit);
      return JSON.stringify({
        topProductCount: limit,
        products: topProducts,
      });
    }
    default:
      return JSON.stringify({ error: "Unknown tool" });
  }
}

export async function runServiceAgent(userQuery: string, language: string = "English"): Promise<string> {
  const messages: Anthropic.Messages.MessageParam[] = [
    {
      role: "user",
      content: userQuery,
    },
  ];

  const systemPrompt = `You are a helpful assistant for Ackley-Hartnett machine manufacturing.
You help answer questions about pharmaceutical printing, laser drilling, and laser marking machines.
You have access to information about which machines are at which locations, what drugs they've processed,
and what capabilities they have (printing, laser drilling, laser marking).

IMPORTANT: The user is asking in ${language}. Please respond entirely in ${language}.

Always be helpful, accurate, and provide specific details from the database when available.
When users ask about drug processing, machine locations, or capabilities, use the available tools to
look up the most current information.`;

  let response = await client.messages.create({
    model: "claude-opus-4-1",
    max_tokens: 2048,
    system: systemPrompt,
    tools: tools as Anthropic.Messages.Tool[],
    messages,
  });

  // Agentic loop - keep going until no more tool calls
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
          block.input as Record<string, string>
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

  return finalResponse || "No response generated";
}
