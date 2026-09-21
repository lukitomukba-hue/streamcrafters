import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// 🔄 უსაფრთხო JSON პარსერი Markdown ტეგების გასუფთავებით
function cleanAndParseJson(text: string) {
  if (!text) return null;
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("JSON Parse Error:", err, "Raw text:", text);
    return null;
  }
}

// 🔄 ავტომატური Key Finder (დიდი და პატარა ასოების მიუხედავად)
function getApiKey() {
  // 1. კონკრეტული სახელების შემოწმება (შენი ვარიანტების ჩათვლით)
  const explicitKeys = [
    process.env.Gemini_API_Key,
    process.env.Gemini_API_Key_2,
    process.env.Gemini_API_Key_3,
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
  ];

  // 2. დინამიური ძებნა process.env-ში (ნებისმიერი ცვლადი, სადაც წერია "gemini" და "key")
  const dynamicKeys = Object.keys(process.env)
    .filter((k) => k.toLowerCase().includes("gemini") && k.toLowerCase().includes("key"))
    .map((k) => process.env[k]);

  // გაერთიანება და ვალიდაცია
  const validKeys = [...explicitKeys, ...dynamicKeys].filter((k): k is string => Boolean(k && k.trim().length > 0));

  // დუბლიკატების წაშლა
  const uniqueKeys = Array.from(new Set(validKeys));

  if (uniqueKeys.length === 0) return null;

  // შემთხვევითობით ირჩევს ერთ-ერთ გასაღებს (Load Balancing)
  return uniqueKeys[Math.floor(Math.random() * uniqueKeys.length)];
}

export async function POST(req: Request) {
  try {
    const { messages, mood } = await req.json();
    const selectedKey = getApiKey();

    // თუ API Key მაინც ვერ მოიძებნა
    if (!selectedKey) {
      return NextResponse.json({
        reply: "⚠️ Vercel-ში API Key ვერ მოიძებნა! შეამოწმეთ, რომ Vercel-ის Environment Variables-ში ნამდვილად დამატებულია გასაღები და გააკეთეთ Vercel Redeploy.",
        hasMovie: false,
        movie: null,
      });
    }

    const ai = new GoogleGenAI({ apiKey: selectedKey });
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

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text || "";
    const parsedData = cleanAndParseJson(rawText);

    if (!parsedData) {
      return NextResponse.json({
        reply: rawText || "პასუხი მომზადდა, თუმცა JSON-ის ფორმატირების ხარვეზია.",
        hasMovie: false,
        movie: null,
      });
    }

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("API Detail Error:", error);
    return NextResponse.json(
      {
        reply: `⚠️ AI შეცდომა: ${error?.message || "API კავშირი ჩაიშალა"}.`,
        hasMovie: false,
        movie: null,
      },
      { status: 500 }
    );
  }
}