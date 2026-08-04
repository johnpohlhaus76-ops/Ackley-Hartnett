import { runSelectorAgent } from "@/app/api/agents/selector-agent";

export async function POST(request: Request) {
  const { requirements } = await request.json();

  if (!requirements) {
    return Response.json(
      { error: "Missing requirements parameter" },
      { status: 400 }
    );
  }

  try {
    const response = await runSelectorAgent(requirements);
    return Response.json({ response });
  } catch (error) {
    console.error("Selector agent error:", error);
    return Response.json(
      { error: "Failed to process requirements" },
      { status: 500 }
    );
  }
}
