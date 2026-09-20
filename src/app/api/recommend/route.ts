import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { messages, mood } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // ბოლო შეტყობინება მომხმარებლისგან
    const lastUserMessage = messages[messages.length - 1]?.text || "";

    // თუ API Key ჯერ არ არის
    if (!apiKey) {
      return NextResponse.json({
        reply: `გამარჯობა! მე ვარ StreamCrafters-ის AI ასისტენტი. შენი განწყობაა: ${mood}.რით შემიძლია დაგეხმარო?`,
        hasMovie: true,
        movie: {
          title: "Interstellar",
          year: "2014",
          director: "Christopher Nolan",
          imdbRating: "8.7",
          matchScore: 98,
          aiReasoning: `შენი მოთხოვნის ("${lastUserMessage}") გათვალისწინებით, ეს ფილმი იდეალურად შეესაბამება შენს ${mood} განწყობას.`,
          streamingPlatforms: ["Cavea Plus", "HBO Max", "Apple TV"],
          soundtrack: "Hans Zimmer - Official Soundtrack",
          soundtrackUrl: "https://open.spotify.com",
          bookTitle: "The Science of Interstellar (Kip Thorne)",
        },
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // AI-სთვის ინსტრუქციის მომზადება
    const systemPrompt = `შენ ხარ StreamCrafters-ის AI კინო-ასისტენტი და მეგობარი. 
შენი მიზანია ესაუბრო მომხმარებელს მეგობრული, უშუალო და საინტერესო ტონით (ქართულად).
მიმდინარე მომხმარებლის განწყობაა: ${mood}.

წესი:
1. თუ მომხმარებელი უბრალოდ გესაუბრება, მოგესალმა ან ზოგად კითხვას გისვამს, უპასუხე მეგობრულად და "hasMovie" გახადე false.
2. თუ მომხმარებელი ითხოვს ფილმის/სერიალის რეკომენდაციას ან აღწერს რისი ყურება უნდა, უპასუხე ტექსტურად ("reply") და "hasMovie" გახადე true, ხოლო "movie" ობიექტში შეავსე ფილმის დეტალები.

დააბრუნე STRICTLY JSON ფორმატში:
{
  "reply": "შენი პასუხი მომხმარებელს ქართულად",
  "hasMovie": true/false,
  "movie": {
    "title": "ფილმის სახელი",
    "year": "წელი",
    "director": "რეჟისორი",
    "imdbRating": "8.5",
    "matchScore": 95,
    "aiReasoning": "მოკლე განმარტება რატომ ეს ფილმი",
    "streamingPlatforms": ["Cavea Plus", "Netflix"],
    "soundtrack": "საუნდტრეკი",
    "soundtrackUrl": "https://open.spotify.com",
    "bookTitle": "თუ ეფუძნება წიგნს (თორემ null)"
  }
}`;

    // საუბრის ისტორიის მომზადება AI-სთვის
    const conversationHistory = messages
      .map((m: { sender: string; text: string }) => `${m.sender === "user" ? "User" : "AI"}: ${m.text}`)
      .join("\n");

    const prompt = `${systemPrompt}\n\nსაუბრის ისტორია:\n${conversationHistory}\n\nპასუხი JSON ფორმატში:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const data = JSON.parse(response.text || "{}");
    return NextResponse.json(data);
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json(
      { reply: "შეცდომა მოხდა AI-სთან კავშირისას. გთხოვთ სცადოთ ხელახლა.", hasMovie: false, movie: null },
      { status: 500 }
    );
  }
}