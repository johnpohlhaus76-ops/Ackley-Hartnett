import { runSalesIntelAgent } from "@/app/api/agents/sales-intel-agent";

export async function POST(request: Request) {
  const { question } = await request.json();

  if (!question) {
    return Response.json(
      { error: "Missing question parameter" },
      { status: 400 }
    );
  }

  try {
    const response = await runSalesIntelAgent(question);
    return Response.json({ response });
  } catch (error) {
    console.error("Sales intel agent error:", error);
    return Response.json(
      { error: "Failed to analyze market data" },
      { status: 500 }
    );
  }
}
