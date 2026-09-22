import { NextResponse } from "next/server";
function cleanAndParseJson(text: string) {
  if (!text) return null;
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    return null;
  }
}
function getSanitizedApiKeys(): string[] {
  const rawKeys = [
    process.env.GEMINI_API_KEY_PDF,
    process.env.GEMINI_API_KEY_AUDIO,
    process.env.GEMINI_API_KEY_VIDEO,
    process.env.GEMINI_API_KEY,
  ];
  return rawKeys
    .filter((k): k is string => Boolean(k && k.trim().length > 0))
    .map((k) => k.trim().replace(/^["']|["']$/g, ""))
    .filter((k) => k.startsWith("AIza") || k.startsWith("AQ.")); // Allow both legacy AIza and new AQ. keys
}
export async function POST(req: Request) {
  try {
    const { messages, mood } = await req.json();
    const apiKeys = getSanitizedApiKeys();
    if (apiKeys.length === 0) {
      return NextResponse.json({
        reply: "⚠️ API Key ვერ მოიძებნა. გთხოვთ შეამოწმოთ Vercel Environment Variables.",
        hasMovie: false,
        movie: null,
      });
    }
    const lastUserMsg = messages && messages.length > 0 ? messages[messages.length - 1].text : "";
    const systemPrompt = `შენ ხარ StreamCrafters-ის AI კინო-ასისტენტი.
მომხმარებლის განწყობა: ${mood || "neutral"}.
დავალება:
- თუ უბრალოდ გესაუბრება: "reply" - სიღრმისეული პასუხი ქართულად, "hasMovie": false, "movie": null.
- თუ ითხოვს ფილმს: "reply" - დასაბუთება ქართულად, "hasMovie": true, "movie" - მეტამონაცემები.
დააბრუნე მხოლოდ ვალიდური JSON:
{
  "reply": "ტექსტი ქართულად",
  "hasMovie": true/false,
  "movie": {
    "title": "Movie Title",
    "year": "2024",
    "director": "Director Name",
    "imdbRating": "8.0",
    "matchScore": 95,
    "aiReasoning": "მოკლე დასაბუთება",
    "streamingPlatforms": ["Netflix", "Cavea Plus"],
    "soundtrack": "Track - Artist",
    "soundtrackUrl": "https://open.spotify.com",
    "bookTitle": null
  }
}`;
    const formattedHistory = messages
      ? messages.map((m: { sender: string; text: string }) => `${m.sender === "user" ? "User" : "AI"}: ${m.text}`).join("\n")
      : `User: ${lastUserMsg}`;
    const fullPrompt = `${systemPrompt}\n\n[ისტორია]\n${formattedHistory}\n\nდააბრუნე მხოლოდ JSON:`;
    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    let lastErrorDetails = "";
    for (const key of apiKeys) {
      for (const model of models) {
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": key,
              },
              body: JSON.stringify({
                contents: [{ parts: [{ text: fullPrompt }] }],
                generationConfig: { responseMimeType: "application/json" },
              }),
            }
          );
          if (res.ok) {
            const data = await res.json();
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
            const parsed = cleanAndParseJson(rawText);
            if (parsed) return NextResponse.json(parsed);
          } else {
            const errBody = await res.text();
            console.error(`Gemini Error (${model}):`, res.status, errBody);
            lastErrorDetails = `[${model} Status ${res.status}]: ${errBody.slice(0, 150)}`;
          }
        } catch (err: any) {
          console.error("Fetch Exception:", err);
        }
      }
    }
    return NextResponse.json({
      reply: `⚠️ API შეცდომა: ${lastErrorDetails || "გთხოვთ შეამოწმოთ API Key Vercel-ში."}`,
      hasMovie: false,
      movie: null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { reply: `⚠️ სერვერის შეცდომა: ${error?.message}`, hasMovie: false, movie: null },
      { status: 500 }
    );
  }
}
