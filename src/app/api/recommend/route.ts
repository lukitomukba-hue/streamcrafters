import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, mood } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    // ბოლო მომხმარებლის შეტყობინება
    const lastUserMsg = messages && messages.length > 0 
      ? messages[messages.length - 1].text 
      : "";

    // 1. თუ API Key არ არის კონფიგურირებული, ვაბრუნებთ სტაბილურ სატესტო პასუხს
    if (!apiKey) {
      console.warn("⚠️ GEMINI_API_KEY არ არის მითითებული .env.local ან Vercel-ში. გამოიყენება Fallback რეჟიმი.");
      
      const isMovieRequest = lastUserMsg.toLowerCase().includes("ფილმ") || 
                             lastUserMsg.toLowerCase().includes("რჩე") || 
                             lastUserMsg.toLowerCase().includes("ყურებ") ||
                             lastUserMsg.toLowerCase().includes("კინო");

      return NextResponse.json({
        reply: `გამარჯობა! მე ვარ StreamCrafters-ის AI ასისტენტი. შენი განწყობაა ${mood || "ზოგადი"}. რით შემიძლია დაგეხმარო?`,
        hasMovie: isMovieRequest,
        movie: isMovieRequest ? {
          title: "Interstellar",
          year: "2014",
          director: "Christopher Nolan",
          imdbRating: "8.7",
          matchScore: 98,
          aiReasoning: `შენი მოთხოვნის ("${lastUserMsg}") გათვალისწინებით, ეს ფილმი იდეალურად შეესაბამება შენს ${mood} განწყობას.`,
          streamingPlatforms: ["Cavea Plus", "HBO Max", "Apple TV"],
          soundtrack: "Hans Zimmer - Official Soundtrack",
          soundtrackUrl: "https://open.spotify.com",
          bookTitle: "The Science of Interstellar (Kip Thorne)"
        } : null
      });
    }

    // 2. Google GenAI ინიციალიზაცია
    const ai = new GoogleGenAI({ apiKey });

    // 3. სისტემური ინსტრუქციის მომზადება
    const systemInstruction = `შენ ხარ StreamCrafters-ის AI კინო-ასისტენტი და მეგობარი.
შენი მიზანია ესაუბრო მომხმარებელს მეგობრული, უშუალო და ენერგიული ტონით (ქართულ ენაზე).
მიმდინარე მომხმარებლის არჩეული განწყობაა: ${mood || "neutral"}.

წესები:
1. თუ მომხმარებელი გესაუბრება, სვამს ზოგად კითხვებს ან მოგესალმა, უპასუხე ბუნებრივად და "hasMovie" ველში მიუთითე false.
2. თუ მომხმარებელი ითხოვს ფილმის, სერიალის ან კინოს რეკომენდაციას (ან აღწერს სიუჟეტს/ხასიათს), უპასუხე ტექსტურად ("reply") და "hasMovie" გახადე true, ხოლო "movie" ობიექტში შეავსე დეტალური მონაცემები.

აუცილებელია პასუხი დააბრუნო STRICTLY ვალიდურ JSON ფორმატში, ყოველგვარი დამატებითი ტექსტის გარეშე:
{
  "reply": "შენი ტექსტური პასუხი მომხმარებელს ქართულად",
  "hasMovie": true/false,
  "movie": {
    "title": "ფილმის სახელი",
    "year": "გამოშვების წელი",
    "director": "რეჟისორი",
    "imdbRating": "8.5",
    "matchScore": 95,
    "aiReasoning": "მოკლე განმარტება რატომ შეურჩიე ეს ფილმი",
    "streamingPlatforms": ["Cavea Plus", "Netflix"],
    "soundtrack": "საუნდტრეკის დასახელება/ავტორი",
    "soundtrackUrl": "https://open.spotify.com",
    "bookTitle": "თუ ეფუძნება წიგნს (თორემ null)"
  }
}`;

    // საუბრის ისტორიის სტრუქტურირება
    const historyText = messages
      ? messages.map((m: { sender: string; text: string }) => `${m.sender === "user" ? "User" : "AI"}: ${m.text}`).join("\n")
      : `User: ${lastUserMsg}`;

    const fullPrompt = `${systemInstruction}\n\nსაუბრის ისტორია:\n${historyText}\n\nდააბრუნე მხოლოდ JSON:`;

    // 4. API გამოძახება
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    let rawText = response.text || "";

    // Markdown ტეგების გასუფთავება JSON-ის უსაფრთხო პარსინგისთვის
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch (parseError) {
      console.error("❌ JSON Parse Error. Raw Output was:", rawText);
      // უსაფრთხო პასუხი JSON-ის დაზიანების შემთხვევაში
      parsedData = {
        reply: rawText.length > 0 && !rawText.startsWith("{") ? rawText : "მოვამზადე პასუხი, თუმცა მონაცემთა ფორმატის ხარვეზია. რით შემიძლია კიდევ დაგეხმარო?",
        hasMovie: false,
        movie: null
      };
    }

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("❌ AI Route Error:", error?.message || error);
    return NextResponse.json(
      {
        reply: "სერვერთან კავშირის შეცდომაა. გთხოვთ შეამოწმოთ API Key ან სცადოთ მოგვიანებით.",
        hasMovie: false,
        movie: null
      },
      { status: 500 }
    );
  }
}