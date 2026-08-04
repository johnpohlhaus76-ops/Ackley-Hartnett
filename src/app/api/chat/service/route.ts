import { runServiceAgent } from "@/app/api/agents/service-agent";

const LANGUAGE_NAMES: Record<string, string> = {
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
  singaporean: "Singaporean English",
};

export async function POST(request: Request) {
  const { query, language = "english" } = await request.json();

  if (!query) {
    return Response.json(
      { error: "Missing query parameter" },
      { status: 400 }
    );
  }

  const languageName = LANGUAGE_NAMES[language] || "English";

  try {
    const response = await runServiceAgent(query, languageName);
    return Response.json({ response, language: languageName });
  } catch (error) {
    console.error("Service agent error:", error);
    return Response.json(
      { error: "Failed to process query" },
      { status: 500 }
    );
  }
}
