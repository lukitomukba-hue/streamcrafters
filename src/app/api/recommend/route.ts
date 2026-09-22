import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = typeof body?.prompt === 'string' ? body.prompt : '';

    if (!prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKeys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3,
    ].filter((key): key is string => Boolean(key));

    if (apiKeys.length === 0) {
      throw new Error('API keys are missing');
    }

    const randomKeyIndex = Math.floor(Math.random() * apiKeys.length);
    const selectedApiKey = apiKeys[randomKeyIndex];

    const ai = new GoogleGenAI({ apiKey: selectedApiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}