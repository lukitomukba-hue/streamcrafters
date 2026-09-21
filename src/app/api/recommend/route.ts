import { NextResponse } from "next/server";

function cleanAndParseJson(text: string) {
  if (!text) return null;
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("JSON Parse Error:", err);
    return null;
  }
}

function getAllApiKeys(): string[] {
  const rawKeys = [
    process.env.GEMINI_API_KEY_VIDEO,
    process.env.GEMINI_API_KEY_AUDIO,
    process.env.GEMINI_API_KEY_PDF,
    process.env.GEMINI_API_KEY,
  ];

  const dynamicKeys = Object.keys(process.env)
    .filter((k) => k.toLowerCase().includes("gemini"))
    .map((k) => process.env[k]);

  const validKeys = [...rawKeys, ...dynamicKeys]
    .filter((k): k is string => Boolean(k && typeof k === "string"))
    .map((k) => k.trim().replace(/[\r\n"']/g, ""))
    .filter((k) => k.length > 0);

  return Array.from(new Set(validKeys));
}

export async function POST(req: Request) {
  try {
    const { messages, mood } = await req.json();
    const apiKeys = getAllApiKeys();

    if (apiKeys.length === 0) {
      return NextResponse.json({
        reply: "⚠️ API გასაღებები ვერ მოიძებნა! შეამოწმეთ .env.local ან Vercel Environment Variables.",
        hasMovie: false,
        movie: null,
      });
    }

    const lastUserMsg = messages && messages.length > 0 ? messages[messages.length - 1].text : "";

    const systemPrompt = `შენ ხარ StreamCrafters-ის AI კინო-ასისტენტი და მედია-ინტეგრატორი.
მომხმარებლის მიმდინარე განწყობა: ${mood || "neutral"}.

დავალება:
1. გააანალიზე მომხმარებლის ბოლო შეტყობინება: "${lastUserMsg}".
2. თუ მომხმარებელი უბრალოდ გესაუბრება, მოგესალმა ან ზოგად კითხვას გისვამს:
   - "reply": გაეცი სიღრმისეული, ლოგიკური და მეგობრული პასუხი ქართულად.
   - "hasMovie": false
   - "movie": null
3. თუ მომხმარებელი ითხოვს ფილმის/სერიალის რეკომენდაციას ან იყენებს სწრაფ იდეებს:
   - "reply": დაწერე საინტერესო დასაბუთება ქართულად, თუ რატომ შეურჩიე ეს ფილმი.
   - "hasMovie": true
   - "movie": შეავსე ზუსტი მეტამონაცემებით.

დააბრუნე STRICTLY მხოლოდ JSON ფორმატში:
{
  "reply": "შენი პასუხი ქართულად",
  "hasMovie": true/false,
  "movie": {
    "title": "ფილმის ორიგინალური დასახელება",
    "year": "გამოშვების წელი",
    "director": "რეჟისორი",
    "imdbRating": "8.5",
    "matchScore": 98,
    "aiReasoning": "მოკლე დასაბუთება",
    "streamingPlatforms": ["Cavea Plus", "Netflix", "HBO Max"],
    "soundtrack": "საუნდტრეკი / შემსრულებელი",
    "soundtrackUrl": "https://open.spotify.com",
    "bookTitle": "თუ ეფუძნება წიგნს (თორემ null)"
  }
}`;

    const formattedHistory = messages
      ? messages.map((m: { sender: string; text: string }) => `${m.sender === "user" ? "User" : "AI"}: ${m.text}`).join("\n")
      : `User: ${lastUserMsg}`;

    const fullPrompt = `${systemPrompt}\n\nსაუბრის ისტორია:\n${formattedHistory}\n\nდააბრუნე მხოლოდ JSON:`;

    const models = ["gemini-1.5-flash", "gemini-1.5-pro"];
    let errorLogs: string[] = [];

    for (const key of apiKeys) {
      for (const model of models) {
        try {
          const cleanKey = encodeURIComponent(key.trim());
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;
          
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: fullPrompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
              },
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
            const parsedData = cleanAndParseJson(rawText);

            if (parsedData) {
              return NextResponse.json(parsedData);
            }
          } else {
            errorLogs.push(`[${model}]: ${response.status}`);
          }
        } catch (err: any) {
          errorLogs.push(`[${model}]: ${err?.message || String(err)}`);
        }
      }
    }

    return NextResponse.json({
      reply: `⚠️ API მოთხოვნა ვერ შესრულდა. შეცდომის სტატუსები: ${errorLogs.join(", ")}`,
      hasMovie: false,
      movie: null,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        reply: `⚠️ სერვერის შეცდომა: ${error?.message || "Internal Error"}.`,
        hasMovie: false,
        movie: null,
      },
      { status: 500 }
    );
  }
}