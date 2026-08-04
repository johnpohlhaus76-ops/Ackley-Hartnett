import { runCompetitiveStrategyAgent } from "@/app/api/agents/competitive-strategy-agent";

export async function POST(request: Request) {
  const { query } = await request.json();

  if (!query) {
    return Response.json({ error: "Missing query" }, { status: 400 });
  }

  try {
    const response = await runCompetitiveStrategyAgent(query);
    return Response.json({ response });
  } catch (error) {
    console.error("Strategy agent error:", error);
    return Response.json({ error: "Failed to process" }, { status: 500 });
  }
}
