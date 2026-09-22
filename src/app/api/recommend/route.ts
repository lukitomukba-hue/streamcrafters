import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, mood } = body;

    // API გასაღებების წამოღება
    const apiKeys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3,
    ].filter(Boolean);

    if (apiKeys.length === 0) {
      return NextResponse.json({
        reply: 'API გასაღები ვერ მოიძებნა. გთხოვთ შეამოწმოთ Vercel-ის Environment Variables.',
        hasMovie: false,
      });
    }

    // შემთხვევითი გასაღების შერჩევა (Load balancing)
    const randomKey = apiKeys[Math.floor(Math.random() * apiKeys.length)] as string;
    const ai = new GoogleGenAI({ apiKey: randomKey });

    // ბოლო შეტყობინების წამოღება
    const lastUserMessage = messages && messages.length > 0
      ? messages[messages.length - 1].text
      : 'მირჩიე კარგი ფილმი';

    const prompt = `
შენ ხარ StreamCrafters-ის AI კინო-ასისტენტი.
მომხმარებლის მიმდინარე განწყობაა (mood): "${mood || 'moody'}".
მომხმარებლის შეტყობინება: "${lastUserMessage}"

დააბრუნე პასუხი STRICT JSON ფორმატში ამ სტრუქტურით:
{
  "reply": "შენი მეგობრული პასუხი ქართულად (ტექსტური ნაწილი)",
  "hasMovie": true,
  "movie": {
    "title": "ფილმის ორიგინალი სახელი",
    "year": "წელი (მაგ: 2010)",
    "director": "რეჟისორის სახელი",
    "imdbRating": "8.8",
    "matchScore": 95,
    "aiReasoning": "მოკლე ქართული ანალიზი, თუ რატომ შევარჩიეთ ეს ფილმი",
    "streamingPlatforms": ["Netflix", "Amazon Prime"],
    "soundtrack": "მთავარი საუნდტრეკის დასახელება",
    "soundtrackUrl": "https://www.youtube.com/results?search_query=soundtrack",
    "bookTitle": "წიგნის სახელი (თუ ფილმი წიგნზეა დაფუძნებული, სხვა შემთხვევაში null)"
  }
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text;

    if (!responseText) {
      throw new Error('Gemini response was empty.');
    }

    const parsedData = JSON.parse(responseText);

    return NextResponse.json(parsedData);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Error';
    console.error('Gemini API Error:', error);

    return NextResponse.json({
      reply: 'შეცდომა მოხდა Gemini-სთან დაკავშირებისას: ' + message,
      hasMovie: false,
    });
  }
}