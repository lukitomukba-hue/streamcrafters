import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// რეალური ფილმების ბაზა (ტესტირებისთვის და ოფლაინ რეჟიმისთვის)
const REAL_MOVIES_DB: Record<string, any> = {
  "ჯარისკაცის მამა": {
    title: "ჯარისკაცის მამა (Father of a Soldier)",
    year: "1964",
    director: "რეზო ჩხეიძე",
    imdbRating: "8.5",
    matchScore: 99,
    aiReasoning: "ქართული კინემატოგრაფიის უდიდესი შედევრი. სერგო ზაქარიაძის (გიორგი მახარაშვილი) გენიალური თამაში და ომის დრამა, რომელიც ოჯახურ სიყვარულს, მამობრივ თავდადებასა და გმირობას უსვამს ხაზს.",
    streamingPlatforms: ["YouTube", "Cavea Plus", "ქართული კინოარქივი"],
    soundtrack: "რევაზ ლაღიძე - ჯარისკაცის მამა (ორიგინალური მუსიკა)",
    soundtrackUrl: "https://www.youtube.com/results?search_query=ჯარისკაცის+მამა+მუსიკა",
    bookTitle: "სულიკო ჟღენტი (ორიგინალური სცენარი)"
  }
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages || [];
    const lastUserMessage = messages.filter((m: any) => m.sender === "user").pop()?.text || "";
    const lowerText = lastUserMessage.toLowerCase();

    // 1. თუ მომხმარებელი ითხოვს "ჯარისკაცის მამას" ან ქართულ კლასიკას
    if (lowerText.includes("ჯარისკაცი") || lowerText.includes("მამა") || lowerText.includes("ქართული")) {
      return NextResponse.json({
        reply: `რა თქმა უნდა! "ჯარისკაცის მამა" ქართული კინემატოგრაფიის ოქროს ფონდის შედევრია. აი დეტალური ინფორმაცია, საუნდტრეკი და თრეილერი:`,
        hasMovie: true,
        movie: REAL_MOVIES_DB["ჯარისკაცის მამა"]
      });
    }

    // 2. თუ Gemini API Key არსებობს, რეალურ დროში დააგენერიროს ნამდვილი ფილმი
    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `You are StreamCrafters VIP AI Cinema Concierge. User asked: "${lastUserMessage}".
Respond in Georgian language in a luxury VIP tone.
Provide a real, existing movie recommendation.
At the end of your response, strictly output JSON wrapped in \`\`\`json ... \`\`\` block:
{
  "title": "Real Movie Title",
  "year": "YYYY",
  "director": "Real Director Name",
  "imdbRating": "X.X",
  "matchScore": 98,
  "aiReasoning": "Real explanation in Georgian",
  "streamingPlatforms": ["Platform1", "Platform2"],
  "soundtrack": "Real Track / Composer",
  "soundtrackUrl": "https://www.youtube.com/results?search_query=...",
  "bookTitle": "Related Book / Author or null"
}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/\{[\s\S]*"title"[\s\S]*\}/);

      let parsedMovie = null;
      let replyText = responseText;

      if (jsonMatch) {
        try {
          parsedMovie = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          replyText = responseText.replace(/```json\n[\s\S]*?\n```/, "").trim();
        } catch (e) {
          console.error("JSON Parse Error", e);
        }
      }

      return NextResponse.json({
        reply: replyText || "აი ჩემი ექსკლუზიური რეკომენდაცია:",
        hasMovie: !!parsedMovie,
        movie: parsedMovie || REAL_MOVIES_DB["ჯარისკაცის მამა"]
      });
    }

    // Default Fallback
    return NextResponse.json({
      reply: `აი რეალური ქართული შედევრი თქვენი მოთხოვნის მიხედვით:`,
      hasMovie: true,
      movie: REAL_MOVIES_DB["ჯარისკაცის მამა"]
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({
      reply: "მონაცემების დამუშავებისას დაფიქსირდა ხარვეზი, თუმცა აი ჩვენი რეკომენდაცია:",
      hasMovie: true,
      movie: REAL_MOVIES_DB["ჯარისკაცის მამა"]
    });
  }
}