import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY || "ef0838a2358429fd3341fdf34a13276d";

const REAL_MOVIES_DB: Record<string, any> = {
  "ჯარისკაცის მამა": {
    title: "ჯარისკაცის მამა (Father of a Soldier)",
    year: "1964",
    director: "რეზო ჩხეიძე",
    imdbRating: "8.5",
    matchScore: 99,
    aiReasoning: "ქართული კინემატოგრაფიის უდიდესი შედევრი. სერგო ზაქარიაძის გენიალური თამაში და ომის დრამა, რომელიც ოჯახურ სიყვარულს უსვამს ხაზს.",
    streamingPlatforms: ["YouTube", "Cavea Plus", "ქართული კინოარქივი"],
    soundtrack: "რევაზ ლაღიძე - ჯარისკაცის მამა",
    soundtrackUrl: "https://www.youtube.com/results?search_query=ჯარისკაცის+მამა+მუსიკა",
    bookTitle: "სულიკო ჟღენტი (ორიგინალური სცენარი)",
    youtubeId: "4CJFF-ALAqs",
    fullMovieUrl: "https://www.youtube.com/embed/4CJFF-ALAqs",
    servers: {
      server1: "https://www.youtube.com/embed/4CJFF-ALAqs",
      server2: "https://www.youtube.com/embed/4CJFF-ALAqs",
      trailer: "https://www.youtube.com/embed/4CJFF-ALAqs"
    }
  }
};

function extractMovieTitle(text: string): string {
  return text
    .replace(/(მინდა|ვუყურო|ვუყუროთ|ყურება|გთხოვ|მირჩიე|ფილმი|კინო|ნახვა|ჩამირთე|გვიჩვენე|მაჩვენე|რომელიმე|კარგი)/gi, "")
    .trim();
}

async function fetchFromTMDB(rawQuery: string) {
  if (!TMDB_API_KEY) return null;
  
  const cleanTitle = extractMovieTitle(rawQuery) || rawQuery;
  const queriesToTry = [cleanTitle, rawQuery];

  for (const q of queriesToTry) {
    if (!q || q.length < 2) continue;
    try {
      const searchRes = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(q)}&include_adult=false`
      );
      const searchData = await searchRes.json();
      const movie = searchData.results?.[0];

      if (movie) {
        const videoRes = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}`
        );
        const videoData = await videoRes.json();
        const trailer = videoData.results?.find(
          (v: any) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
        ) || videoData.results?.[0];

        const server1 = `https://vidsrc.me/embed/movie?tmdb=${movie.id}`;
        const server2 = `https://vidsrc.pro/embed/movie/${movie.id}`;
        const server3 = `https://2embed.cc/embed/movie/${movie.id}`;
        const trailerUrl = `https://www.youtube.com/embed/${trailer?.key || 'YoHD9XEInc0'}`;

        return {
          title: movie.title || movie.original_title,
          year: movie.release_date ? movie.release_date.split("-")[0] : "N/A",
          director: "TMDB Cinema Index",
          imdbRating: movie.vote_average ? movie.vote_average.toFixed(1) : "8.1",
          matchScore: Math.round((movie.vote_average || 8.5) * 10),
          aiReasoning: movie.overview || "მსოფლიო კინემატოგრაფიის აღიარებული სურათი.",
          streamingPlatforms: ["Full Movie Stream", "Netflix", "Cavea Plus"],
          soundtrack: `${movie.title} Original Soundtrack`,
          soundtrackUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + " soundtrack")}`,
          bookTitle: null,
          youtubeId: trailer?.key || "YoHD9XEInc0",
          fullMovieUrl: server1,
          servers: {
            server1: server1,
            server2: server2,
            server3: server3,
            trailer: trailerUrl
          },
          tmdbId: movie.id
        };
      }
    } catch (e) {
      console.error("TMDB Fetch Error:", e);
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, mood } = body;

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GEMINI_API_KEY_2 ||
      process.env.GEMINI_API_KEY_3;

    const lastUserMessage =
      messages && Array.isArray(messages) && messages.length > 0
        ? messages[messages.length - 1]?.text ?? 'გამარჯობა'
        : 'გამარჯობა';

    const lowerText = lastUserMessage.toLowerCase().trim();

    if (lowerText.includes("ჯარისკაცი") || lowerText.includes("მამა") || lowerText.includes("ჯარისკაცის")) {
      return NextResponse.json({
        reply: "რა თქმა უნდა! ეს ქართული კინემატოგრაფიის ოქროს ფონდის შედევრია. აი დეტალური ინფორმაცია და სრული ფილმი:",
        hasMovie: true,
        movie: REAL_MOVIES_DB["ჯარისკაცის მამა"]
      });
    }

    if (lowerText.includes("მადლობა") || lowerText.includes("გმადლობ") || lowerText.includes("მადლობ")) {
      return NextResponse.json({
        reply: "არაფრის, ჩემი სიამოვნებაა! 🍿✨ სასიამოვნო ყურებას გისურვებთ. თუ კიდევ რამე დაგჭირდებათ, აქ ვარ!",
        hasMovie: false
      });
    }

    if (
      (lowerText === "გამარჯობა" || lowerText === "სალამი" || lowerText.includes("როგორ ხარ") || lowerText.includes("ვინ ხარ")) &&
      !lowerText.includes("ვუყურო") && !lowerText.includes("ფილმი")
    ) {
      let chatReply = "გამარჯობა! მოგესალმებით StreamCrafters VIP Lounge-ში. რით შემიძლია დღეს გემსახუროთ?";
      if (lowerText.includes("როგორ ხარ")) chatReply = "დიდი მადლობა, მშვენივრად ვარ! თქვენ როგორ ბრძანდებით?";
      return NextResponse.json({ reply: chatReply, hasMovie: false });
    }

    const tmdbMovie = await fetchFromTMDB(lastUserMessage);
    if (tmdbMovie) {
      return NextResponse.json({
        reply: `რა თქმა უნდა! იპოვა ფილმი "${tmdbMovie.title}". აი სრული ფილმის პლეერი და მონაცემები:`,
        hasMovie: true,
        movie: tmdbMovie
      });
    }

    const conversationHistory = Array.isArray(messages)
      ? messages.map((m: any) => `${m.sender === 'user' ? 'User' : 'AI'}: ${m.text}`).join('\n')
      : `User: ${lastUserMessage}`;

    const prompt = `
შენ ხარ StreamCrafters-ის VIP AI კინო-ასისტენტი. საუბრობ ექსკლუზიურად ქართულად VIP ტონით.
მომხმარებლის შეტყობინება: "${lastUserMessage}"

ინსტრუქცია:
თუ მომხმარებელი ითხოვს/ახსენებს ფილმს, შეურჩიე ცნობილი ფილმი ამ JSON ფორმატში:
{
  "reply": "მოკლე შესავალი ქართულად",
  "hasMovie": true,
  "movie": {
    "title": "ფილმის სახელი",
    "year": "YYYY",
    "director": "რეჟისორი",
    "imdbRating": "X.X",
    "matchScore": 95,
    "aiReasoning": "მოკლე ქართული ანალიზი",
    "streamingPlatforms": ["Full Movie Stream"],
    "soundtrack": "საუნდტრეკი",
    "soundtrackUrl": "https://www.youtube.com",
    "bookTitle": null,
    "youtubeId": "YoHD9XEInc0",
    "fullMovieUrl": "https://vidsrc.me/embed/movie?tmdb=27205",
    "servers": {
      "server1": "https://vidsrc.me/embed/movie?tmdb=27205",
      "server2": "https://vidsrc.pro/embed/movie/27205",
      "trailer": "https://www.youtube.com/embed/YoHD9XEInc0"
    }
  }
}
`;

    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];

      for (const modelName of modelsToTry) {
        try {
          const result = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: { responseMimeType: 'application/json' },
          });
          const responseText = result.text ?? '';
          if (responseText) {
            return NextResponse.json(JSON.parse(responseText));
          }
        } catch (err) {
          console.warn(`Model ${modelName} busy...`);
        }
      }
    }

    return NextResponse.json({
      reply: "მოგესალმებით StreamCrafters VIP Lounge-ში! რით შემიძლია გემსახუროთ?",
      hasMovie: false,
    });

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({
      reply: 'მოგესალმებით StreamCrafters VIP Lounge-ში! რით შემიძლია გემსახუროთ?',
      hasMovie: false,
    });
  }
}