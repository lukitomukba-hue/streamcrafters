import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// 🔄 Multi-Key Rotator (დატვირთვის გადანაწილება 3 გასაღებს შორის)
function getGeminiClient() {
  const keys = [
    process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
  ].filter(Boolean);

  if (keys.length === 0) return null;
  
  // ირჩევს ერთ-ერთ გასაღებს შემთხვევითობის პრინციპით
  const selectedKey = keys[Math.floor(Math.random() * keys.length)];
  return new GoogleGenAI({ apiKey: selectedKey as string });
}

export async function POST(req: Request) {
  try {
    const { messages, mood } = await req.json();
    const ai = getGeminiClient();

    if (!ai) {
      return NextResponse.json({
        reply: "⚠️ API Key არ არის კონფიგურირებული Vercel-ში.",
        hasMovie: false,
        movie: null,
      });
    }

    const lastUserMsg = messages && messages.length > 0 ? messages[messages.length - 1].text : "";

    // 🧠 Agent 1: Intent Classifier & General Conversation
    const intentPrompt = `შენ ხარ StreamCrafters-ის AI კლასიფიკატორი.
გააანალიზე მომხმარებლის შეტყობინება: "${lastUserMsg}".
განსაზღვრე, ითხოვს თუ არა მომხმარებელი ფილმის/სერიალის/კინოს რეკომენდაციას ან აღწერს თუ არა სიუჟეტს.

დააბრუნე მხოლოდ JSON: { "isMovieRequest": true/false }`;

    const intentResponse = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: intentPrompt,
      config: { responseMimeType: "application/json" },
    });

    const intentData = JSON.parse(intentResponse.text || '{"isMovieRequest": false}');

    // თუ უბრალო ჩატია:
    if (!intentData.isMovieRequest) {
      const chatPrompt = `შენ ხარ StreamCrafters AI — ინტელექტუალური და მეგობრული კინო-ასისტენტი.
მომხმარებლის განწყობა: ${mood}.
გაეცი ლოგიკური, სიღრმისეული და ბუნებრივი პასუხი ქართულად:

საუბრის ისტორია:
${messages.map((m: any) => `${m.sender}:${m.text}`).join("\n")}

დააბრუნე მხოლოდ JSON:
{ "reply": "შენი პასუხი ქართულად", "hasMovie": false, "movie": null }`;

      const chatResponse = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: chatPrompt,
        config: { responseMimeType: "application/json" },
      });

      return NextResponse.json(JSON.parse(chatResponse.text || "{}"));
    }

    // 🎬 Agent 2 & 3: Cinema Expert + Media Enrichment
    const movieExpertPrompt = `შენ ხარ StreamCrafters-ის მთავარი კინო-ექსპერტი და მედია-ინტეგრატორი.
მომხმარებლის მოთხოვნა: "${lastUserMsg}". განწყობა: ${mood}.

შეარჩიე იდეალური ფილმი და დააკავშირე შესაბამის მედიასთან (საუნდტრეკი, წიგნი).

დააბრუნე STRICTLY JSON:
{
  "reply": "სიღრმისეული და ლოგიკური განმარტება ქართულად, თუ რატომ შეურჩიე ეს ფილმი",
  "hasMovie": true,
  "movie": {
    "title": "ფილმის ორიგინალური სახელი",
    "year": "გამოშვების წელი",
    "director": "რეჟისორი",
    "imdbRating": "8.5",
    "matchScore": 98,
    "aiReasoning": "მოკლე დასაბუთება",
    "streamingPlatforms": ["Cavea Plus", "Netflix", "HBO Max"],
    "soundtrack": "საუნდტრეკის დასახელება/ავტორი",
    "soundtrackUrl": "https://open.spotify.com",
    "bookTitle": "თუ ეფუძნება წიგნს (თორემ null)"
  }
}`;

    const movieResponse = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: movieExpertPrompt,
      config: { responseMimeType: "application/json" },
    });

    let rawText = movieResponse.text || "";
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    return NextResponse.json(JSON.parse(rawText));

  } catch (error) {
    console.error("Multi-Agent Pipeline Error:", error);
    return NextResponse.json({
      reply: "შეცდომა მოხდა აგენტებს შორის კომუნიკაციისას. გთხოვთ სცადოთ ხელახლა.",
      hasMovie: false,
      movie: null,
    }, { status: 500 });
  }
}