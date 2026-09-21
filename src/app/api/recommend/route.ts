import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// 🔄 უსაფრთხო JSON პარსერი (Markdown ტეგების გასუფთავებით)
function cleanAndParseJson(text: string) {
  if (!text) return null;
  const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("JSON Parsing Error. Raw output was:", text);
    return null;
  }
}

// 🔄 Multi-Key Rotator (დატვირთვის გადანაწილება)
function getGeminiClient() {
  const keys = [
    process.env.Gemini_API_Key || process.env.Gemini_API_Key,
    process.env.Gemini_API_Key_2,
    process.env.Gemini_API_Key_3,
  ].filter(Boolean);

  if (keys.length === 0) return null;
  const selectedKey = keys[Math.floor(Math.random() * keys.length)];
  return new GoogleGenAI({ apiKey: selectedKey as string });
}

export async function POST(req: Request) {
  try {
    const { messages, mood } = await req.json();
    const ai = getGeminiClient();

    if (!ai) {
      return NextResponse.json({
        reply: "⚠️ API Key არ არის კონფიგურირებული Vercel-ის Environment Variables-ში.",
        hasMovie: false,
        movie: null,
      });
    }

    const lastUserMsg = messages && messages.length > 0 ? messages[messages.length - 1].text : "";

    // 🧠 გაერთიანებული სისტემური პრომპტი
    const systemPrompt = `შენ ხარ StreamCrafters-ის AI კინო-ასისტენტი და მედია-ინტეგრატორი.
მომხმარებლის მიმდინარე განწყობა: ${mood || "neutral"}.

შენი დავალება:
1. გააანალიზე მომხმარებლის ბოლო შეტყობინება: "${lastUserMsg}".
2. თუ მომხმარებელი უბრალოდ გესაუბრება, მოგესალმა ან ზოგად კითხვას გისვამს:
   - "reply": გაეცი სიღრმისეული, ლოგიკური და მეგობრული პასუხი ქართულად.
   - "hasMovie": false
   - "movie": null
3. თუ მომხმარებელი ითხოვს ფილმის/სერიალის რეკომენდაციას ან იყენებს სწრაფ იდეებს (მაგ: "${lastUserMsg}"):
   - "reply": დაწერე საინტერესო, არგუმენტირებული დასაბუთება ქართულად, თუ რატომ შეურჩიე ეს ფილმი.
   - "hasMovie": true
   - "movie": შეავსე ზუსტი მეტამონაცემებით.

დააბრუნე STRICTLY მხოლოდ JSON ფორმატი:
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
      .map((m: { sender: string; text: string }) => `${m.sender === "user" ? "User" : "AI"}: ${m.text}`)
      .join("\n");

    const fullPrompt = `${systemPrompt}\n\nსაუბრის ისტორია:\n${formattedHistory}\n\nდააბრუნე მხოლოდ JSON:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsedData = cleanAndParseJson(response.text || "");

    if (!parsedData) {
      return NextResponse.json({
        reply: "პასუხი მომზადდა, თუმცა მონაცემების ფორმატირებისას მოხდა მცირე ხარვეზი. გთხოვთ სცადოთ ხელახლა.",
        hasMovie: false,
        movie: null,
      });
    }

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("AI Route Error:", error?.message || error);
    return NextResponse.json(
      {
        reply: "შეცდომა მოხდა AI-სთან კავშირისას. გთხოვთ შეამოწმოთ API Key Vercel-ში.",
        hasMovie: false,
        movie: null,
      },
      { status: 500 }
    );
  }
}