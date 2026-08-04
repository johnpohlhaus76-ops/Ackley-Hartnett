import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const LANGUAGES = {
  english: "English",
  chinese: "Simplified Chinese",
  indonesian: "Indonesian",
  thai: "Thai",
  vietnamese: "Vietnamese",
  japanese: "Japanese",
  korean: "Korean",
  arabic: "Arabic",
  bengali: "Bengali",
  hindi: "Hindi",
  french: "French",
  german: "German",
  spanish: "Spanish",
  portuguese: "Portuguese",
  greek: "Greek",
  italian: "Italian",
  "swiss-german": "Swiss German",
  "swiss-french": "Swiss French",
  singaporean: "Singaporean English (with Chinese/Malay)",
};

export async function POST(request: Request) {
  const { query, language, agentType } = await request.json();

  if (!query || !language || !agentType) {
    return Response.json(
      { error: "Missing query, language, or agentType" },
      { status: 400 }
    );
  }

  const targetLanguage = LANGUAGES[language as keyof typeof LANGUAGES];
  if (!targetLanguage) {
    return Response.json({ error: "Unsupported language" }, { status: 400 });
  }

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-1",
      max_tokens: 1024,
      system: `You are a language translator and responder.
The user's question is in ${targetLanguage}.
Translate it to English, then respond in ${targetLanguage}.
Format your response as:
ENGLISH: [English version of your response]
${targetLanguage.toUpperCase()}: [Response in ${targetLanguage}]`,
      messages: [
        {
          role: "user",
          content: `Question in ${targetLanguage}: ${query}`,
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === "text");
    const responseText =
      textContent && "text" in textContent ? textContent.text : "";

    return Response.json({
      originalQuery: query,
      language: targetLanguage,
      response: responseText,
    });
  } catch (error) {
    console.error("Translation error:", error);
    return Response.json({ error: "Translation failed" }, { status: 500 });
  }
}
