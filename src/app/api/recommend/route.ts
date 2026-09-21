import { NextResponse } from "next/server";

// 🔄 JSON-ის უსაფრთხო პარსერი
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

// 🔄 API Key-ს მოძებნა (ყველა შესაძლო სახელის შემოწმება)
function getApiKey() {
  const keys = [
    process.env.Gemini_API_Key,
    process.env.Gemini_API_Key_2,
    process.env.Gemini_API_Key_3,
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
  ];

  const dynamicKeys = Object.keys(process.env)
    .filter((k) => k.toLowerCase().includes("gemini"))
    .map((k) => process.env[k]);

  const validKeys = [...keys, ...dynamicKeys].filter((k): k is string => Boolean(k && k.trim().length > 0));
  const uniqueKeys = Array.from(new Set(validKeys));

  if (uniqueKeys.length === 0) return null;
  return uniqueKeys[Math.floor(Math.random() * uniqueKeys.length)];
}

export async function POST(req: Request) {
  try {
    const { messages, mood } = await req.json();
    const apiKey = getApiKey();

    if (!apiKey) {
      return NextResponse.json({
        reply: "⚠️ Vercel-ის Environment Variables-ში API Key ვერ მოიძებნა! შეამოწმეთ Vercel-ის პარამეტრები და გააკეთეთ Redeploy.",
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

    // 🚀 პირდაპირი HTTP მოთხოვნა Gemini 1.5 Flash-ის REST API-ზე
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API Error Response:", errText);
      return NextResponse.json({
        reply: `⚠️ Google API შეცდომა (${response.status}): შეამოწმეთ API Key-ს ვალიდურობა Google AI Studio-ში.`,
        hasMovie: false,
        movie: null,
      });
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const parsedData = cleanAndParseJson(rawText);

    if (!parsedData) {
      return NextResponse.json({
        reply: rawText || "პასუხი მომზადდა, თუმცა ფორმატირების ხარვეზია.",
        hasMovie: false,
        movie: null,
      });
    }

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("API Route Catch Error:", error);
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