import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, mood } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_2 || process.env.GEMINI_API_KEY_3;

    if (!apiKey) {
      return NextResponse.json({
        reply: "API გასაღები ვერ მოიძებნა Vercel/Environment Variables-ში.",
        hasMovie: false
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const lastUserMessage = messages && messages.length > 0
      ? messages[messages.length - 1].text
      : "მირჩიე კარგი ფილმი";

    const prompt = `
შენ ხარ StreamCrafters-ის AI კინო-ასისტენტი.
მომხმარებლის მიმდინარე განწყობაა (mood): "${mood || 'moody'}".
მომხმარებლის შეტყობინება: "${lastUserMessage}"

დააბრუნე პასუხი STRICT JSON ფორმატში ამ სტრუქტურით:
{
  "reply": "შენი მეგობრული პასუხი ქართულად",
  "hasMovie": true,
  "movie": {
    "title": "ფილმის ორიგინალი სახელი",
    "year": "2010",
    "director": "რეჟისორის სახელი",
    "imdbRating": "8.8",
    "matchScore": 95,
    "aiReasoning": "მოკლე ქართული ანალიზი",
    "streamingPlatforms": ["Netflix"],
    "soundtrack": "მთავარი საუნდტრეკი",
    "soundtrackUrl": "https://www.youtube.com",
    "bookTitle": null
  }
}
`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = result.text ?? '';
    if (!rawText) {
      throw new Error('Gemini returned an empty response.');
    }

    const parsedData = JSON.parse(rawText);

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({
      reply: "შეცდომა Gemini API-სთან: " + (error.message || "Internal Error"),
      hasMovie: false
    });
  }
}