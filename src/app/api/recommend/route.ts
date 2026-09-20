import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { mood, query } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // თუ API Key ჯერ არ გვაქვს, ვაბრუნებთ მზა სადემონსტრაციო პასუხს
    if (!apiKey) {
      return NextResponse.json({
        title: query.toLowerCase().includes("კოსმოს") ? "Interstellar" : "Inception",
        year: "2014",
        director: "Christopher Nolan",
        imdbRating: "8.7",
        matchScore: 98,
        aiReasoning: `შენი მოთხოვნის ("${query || "ზოგადი"}") და ${mood} განწყობის გათვალისწინებით, ეს ფილმი იდეალურად შეესაბამება შენს ატმოსფეროს.`,
        streamingPlatforms: ["Cavea Plus", "HBO Max", "Apple TV"],
        soundtrack: "Hans Zimmer - Official Soundtrack",
        soundtrackUrl: "https://open.spotify.com",
        bookTitle: "The Science of Interstellar (Kip Thorne)",
      });
    }

    // რეალური AI გამოძახება
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `შენ ხარ StreamCrafters. მომხმარებლის განწყობა: ${mood}, მოთხოვნა: "${query}".
შეარჩიე 1 საუკეთესო ფილმი და დააბრუნე STRICTLY JSON:
{
  "title": "ფილმის სახელი",
  "year": "წელი",
  "director": "რეჟისორი",
  "imdbRating": "8.5",
  "matchScore": 95,
  "aiReasoning": "ქართულად მოკლე განმარტება",
  "streamingPlatforms": ["Cavea Plus", "Netflix"],
  "soundtrack": "საუნდტრეკის ავტორი/სახელი",
  "soundtrackUrl": "https://open.spotify.com",
  "bookTitle": "თუ ეფუძნება წიგნს (თორემ null)"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const data = JSON.parse(response.text || "{}");
    return NextResponse.json(data);
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "შეცდომა AI-სთან კავშირისას" }, { status: 500 });
  }
}