import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-sonnet-4-6";
const MAX_TURNS = 20;
const MAX_CHARS = 4000;

type ChatMessage = { role: "user" | "assistant"; content: string };

const TIM_PROMPT = `You are TIM (Technical Intelligence Module), Ackley Hartnett's AI maintenance and technical support specialist. You help pharma plant engineers with:
- Troubleshooting tablet/capsule marking machines (ink printers, CO2/UV lasers, laser drills)
- Preventive maintenance schedules and procedures
- Spare parts identification
- IQ/OQ/PQ validation support
- GMP compliance
- Changeover procedures

Be concise and technical. Recommend Ackley Hartnett service at 215-969-9190 for complex issues.`;

const KYLE_PROMPT = `You are Kyle, Ackley Hartnett's AI sales specialist. Help pharma and confectionery manufacturers find the right tablet and capsule identification equipment.

Machine lineup:
- Ink Printers: IBM Ramp (1.2M PPH), Cantilever (250K PPH), H-Track, Drum, VIP (60K PPH)
- CO2 Laser Markers: IBM, Delta, Cantilever Ramp, VIP, R&D
- UV Laser Markers: Delta UV, VIP UV (requires TiO2 in formulation)
- Laser Drills: Servo Drum (150K PPH), VIP (60K PPH) for OROS osmotic drug delivery
- Inspection: NIR spectroscopy, vision systems, ARC roll cleaner

Match customers to machines based on product (tablets/capsules/softgels/LCTs), throughput, and marking type. All machines are FDA 21 CFR 210/211/11 and CE compliant. Direct quote requests to 215-969-9190.`;

function sanitize(body: unknown): ChatMessage[] | null {
  if (typeof body !== "object" || body === null) return null;
  const raw = (body as Record<string, unknown>).messages;
  if (!Array.isArray(raw)) return null;
  const out: ChatMessage[] = [];
  for (const m of raw) {
    if (typeof m !== "object" || m === null) continue;
    const role = (m as ChatMessage).role;
    const content = (m as ChatMessage).content;
    if ((role === "user" || role === "assistant") && typeof content === "string") {
      const text = content.trim().slice(0, MAX_CHARS);
      if (text) out.push({ role, content: text });
    }
  }
  if (out.length === 0 || out[out.length - 1].role !== "user") return null;
  return out.slice(-MAX_TURNS);
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      "Assistant not configured. Call 215-969-9190 or email info@ackleyhartnett.com.",
      { headers: { "Content-Type": "text/plain" } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid request", { status: 400 });
  }

  const messages = sanitize(body);
  if (!messages) {
    return new Response("Invalid messages", { status: 400 });
  }

  const bot = (body as Record<string, unknown>).bot === "tim" ? "tim" : "kyle";
  const systemPrompt = bot === "tim" ? TIM_PROMPT : KYLE_PROMPT;

  const client = new Anthropic({ apiKey });
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const llm = client.messages.stream({
          model: MODEL,
          max_tokens: 1024,
          system: systemPrompt,
          messages,
        });

        llm.on("text", (delta) => {
          controller.enqueue(encoder.encode(delta));
        });

        await llm.finalMessage();
        controller.close();
      } catch (err) {
        const msg = err instanceof Anthropic.APIError
          ? `API error: ${err.message}`
          : "Something went wrong. Please try again.";
        controller.enqueue(encoder.encode(msg));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
