import Anthropic from "@anthropic-ai/sdk";
import { buildKnowledgeBase } from "@/lib/assistant";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-sonnet-4-5";
const MAX_TURNS = 20;
const MAX_CHARS = 4000;

type ChatMessage = { role: "user" | "assistant"; content: string };

const TIM_PROMPT = `You are TIM — the Technical Intelligence Module for Ackley Hartnett pharmaceutical machinery.

Your role: maintenance, troubleshooting, calibration, validation, and technical support for Ackley Hartnett machines.

You help customers and operators with:
- Troubleshooting machine issues (print quality, laser alignment, ink system problems, inspection failures)
- Routine and preventive maintenance procedures
- Calibration of print rolls, laser optics, vision systems
- IQ/OQ/PQ validation documentation questions
- 21 CFR Part 11 compliance questions
- Machine changeover and cleaning procedures
- Spare parts identification
- Safety interlocks and fume control systems
- OPC-UA data integration and historian setup

Tone: precise, technical, calm. You are a senior field service engineer with 20+ years on AH equipment.
Always recommend contacting Ackley Hartnett at 215-969-9190 or service@ackleyhartnett.com for on-site issues or parts orders.
Never discuss pricing. Keep answers focused and actionable.`;

const KYLE_PROMPT = `You are Kyle — the machine selection specialist for Ackley Hartnett pharmaceutical and confectionery marking systems.

Your role: help customers find the right machine for their application, product, and throughput.

You help customers with:
- Choosing between ink printing (rotogravure), CO2 laser marking, UV laser marking, and laser drilling
- Selecting the right model based on throughput requirements (pieces per hour)
- One-sided vs two-sided marking options
- Tablet vs capsule vs softgel vs LCT applications
- Inline vision and inspection integration
- Lab/R&D systems vs production systems
- Confectionery and candy coating applications
- Comparing machines head-to-head (specs, throughput, technology)
- Understanding what makes each platform unique

Tone: consultative, knowledgeable, enthusiastic. You help customers make the right investment.
Always offer to connect them with the sales team for a formal quote: 215-969-9190 or quotes@ackleyhartnett.com.
Never discuss final pricing — direct all pricing to the Request a Quote form.`;

function sanitize(body: unknown): { messages: ChatMessage[]; bot: string } | null {
  if (typeof body !== "object" || body === null) return null;
  const raw = (body as { messages?: unknown; bot?: unknown }).messages;
  const bot = (body as { bot?: unknown }).bot;
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
  return { messages: out.slice(-MAX_TURNS), bot: typeof bot === "string" ? bot : "kyle" };
}

function textStream(text: string): Response {
  return new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(text));
        controller.close();
      },
    }),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return textStream(
      "The assistant isn't configured yet. Please reach our team at 215-969-9190 or info@ackleyhartnett.com.",
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid request", { status: 400 });
  }

  const parsed = sanitize(body);
  if (!parsed) return new Response("Invalid messages", { status: 400 });

  const { messages, bot } = parsed;
  const systemPrompt = bot === "tim" ? TIM_PROMPT : KYLE_PROMPT;

  const client = new Anthropic({ apiKey });
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const llm = client.messages.stream({
          model: MODEL,
          max_tokens: 1500,
          system: [
            { type: "text", text: systemPrompt },
            {
              type: "text",
              text: buildKnowledgeBase(),
              cache_control: { type: "ephemeral" },
            },
          ],
          messages,
        });

        llm.on("text", (delta) => {
          controller.enqueue(encoder.encode(delta));
        });

        await llm.finalMessage();
        controller.close();
      } catch (err) {
        const msg =
          err instanceof Anthropic.APIError
            ? "The assistant is briefly unavailable. Please try again or contact info@ackleyhartnett.com."
            : "Something went wrong. Please try again.";
        try { controller.enqueue(encoder.encode(msg)); } catch { /* closed */ }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
