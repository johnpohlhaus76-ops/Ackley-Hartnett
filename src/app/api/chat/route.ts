import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, buildKnowledgeBase } from "@/lib/assistant";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-opus-4-7";
const MAX_TURNS = 20;
const MAX_CHARS = 4000;

type ChatMessage = { role: "user" | "assistant"; content: string };

function sanitize(body: unknown): ChatMessage[] | null {
  if (typeof body !== "object" || body === null) return null;
  const raw = (body as { messages?: unknown }).messages;
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
      "The assistant isn't configured yet. Please reach our team at 215-969-9190 or info@ackleyhartnett.com, or use the Request a Quote form.",
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

  const client = new Anthropic({ apiKey });
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const llm = client.messages.stream({
          model: MODEL,
          max_tokens: 1500,
          output_config: { effort: "medium" },
          system: [
            { type: "text", text: SYSTEM_PROMPT },
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
            ? "The assistant is briefly unavailable. Please try again, or contact info@ackleyhartnett.com."
            : "Something went wrong. Please try again.";
        try {
          controller.enqueue(encoder.encode(msg));
        } catch {
          /* stream already closed */
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
