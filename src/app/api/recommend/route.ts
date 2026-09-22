import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, mood } = body;

    const apiKeys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3,
    ].filter(Boolean);

    if (apiKeys.length === 0) {
      return NextResponse.json({
        reply: "API გასაღები ვერ მოიძებნა Vercel/Environment Variables-ში.",
        hasMovie: false
      });
    }

    const randomKey = apiKeys[Math.floor(Math.random() * apiKeys.length)] as string;
    const genAI = new GoogleGenerativeAI(randomKey);

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

    // მოდელების სია: თუ რომელიმე გადატვირთულია (503), კოდი ავტომატურად გადავა შემდეგზე
    const candidateModels = [
      'gemini-1.5-flash',
      'gemini-2.0-flash',
      'gemini-2.5-flash',
      'gemini-3.6-flash',
      'gemini-1.5-pro'
    ];

    let responseText = '';
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
          },
        });

        const result = await model.generateContent(prompt);
        responseText = result.response.text();
        if (responseText) break;
      } catch (err: any) {
        console.warn(`Model ${modelName} unavailable, retrying next...`, err?.message);
        lastError = err;
      }
    }

    if (!responseText) {
      throw lastError || new Error("ყველა მოდელი დროებით მიუწვდომელია.");
    }

    const parsedData = JSON.parse(responseText);
    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({
      reply: "სერვერი დროებით გადატვირთულია. გთხოვთ სცადოთ ხელახლა 2-3 წამში.",
      hasMovie: false
    });
  }
}
