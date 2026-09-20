"use client";

import { useState } from "react";
import { Sparkles, Music, Tv, Search, Mic, MicOff, Loader2, BookOpen, Play, X } from "lucide-react";

type Mood = "moody" | "happy" | "chill";

interface MovieResult {
  title: string;
  year: string;
  director: string;
  imdbRating: string;
  matchScore: number;
  aiReasoning: string;
  streamingPlatforms: string[];
  soundtrack: string;
  soundtrackUrl?: string;
  bookTitle?: string | null;
}

export default function Home() {
  const [mood, setMood] = useState<Mood>("moody");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState<MovieResult | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);

  const themeStyles = {
    moody: "bg-slate-950 text-slate-100 border-slate-800",
    happy: "bg-amber-950 text-amber-50 border-amber-800",
    chill: "bg-emerald-950 text-emerald-50 border-emerald-800",
  };

  const accentColors = {
    moody: "from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500",
    happy: "from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400",
    chill: "from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500",
  };

  // 🎙️ ხმოვანი ძებნის (Web Speech API) ლოგიკა
  const handleVoiceInput = () => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("თქვენს ბრაუზერს ხმოვანი ძებნის მხარდაჭერა არ აქვს. გამოიყენეთ Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ka-GE"; // ქართული ენის მხარდაჭერა
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
    };

    recognition.start();
  };

  // 🔍 AI მოთხოვნის გაგზავნა
  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    setShowTrailer(false);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, query }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`min-h-screen transition-colors duration-500 ${themeStyles[mood]} p-6 md:p-12 relative overflow-x-hidden`}>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
            <h1 className="text-2xl font-bold tracking-tight">StreamCrafters</h1>
          </div>
          <span className="text-xs uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 border border-white/10">
            {mood} Mode
          </span>
        </header>

        {/* Mood Selector */}
        <section className="space-y-3">
          <label className="text-sm font-medium text-slate-400">აირჩიე შენი განწყობა (Mood):</label>
          <div className="flex gap-3">
            {(["moody", "happy", "chill"] as Mood[]).map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`px-5 py-2.5 rounded-xl font-medium capitalize transition-all border ${
                  mood === m
                    ? "bg-white text-black border-white shadow-lg scale-105"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                {m === "moody" && "🌙 Moody"}
                {m === "happy" && "☀️ Happy"}
                {m === "chill" && "🌿 Chill"}
              </button>
            ))}
          </div>
        </section>

        {/* Search Input (Voice + Text) */}
        <section className="relative">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="აღწერე სიუჟეტი ან ილაპარაკე მიკროფონით..."
              className="w-full pl-12 pr-14 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-white/30 text-lg placeholder:text-slate-500"
            />
            
            {/* 🎙️ Voice Input Button */}
            <button
              onClick={handleVoiceInput}
              title="ხმოვანი ძებნა"
              className={`absolute right-3 p-2.5 rounded-xl transition ${
                isListening
                  ? "bg-red-500 text-white animate-bounce"
                  : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>
          {isListening && (
            <p className="text-xs text-red-400 mt-2 animate-pulse text-center">
              🎙️ გისმენთ... თქვით საძიებო ფრაზა...
            </p>
          )}
        </section>

        {/* Generate Button */}
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className={`w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r ${accentColors[mood]} shadow-xl transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> AI აანალიზებს მედიას...
            </>
          ) : (
            "მოძებნე მედია AI-ს მეშვეობით"
          )}
        </button>

        {/* Result Card */}
        {result && (
          <section className="border border-white/10 bg-white/5 rounded-3xl p-6 md:p-8 space-y-6 backdrop-blur-md animate-in fade-in duration-500 relative">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-3xl font-black">{result.title} ({result.year})</h2>
                <p className="text-slate-400 text-sm mt-1">
                  რეჟისორი: {result.director} | IMDb: {result.imdbRating}
                </p>
              </div>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-sm font-semibold">
                {result.matchScore}% Match
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed">
              <strong className="text-white">რატომ შეგირჩია AI-მ:</strong> {result.aiReasoning}
            </p>

            {/* 🎬 Trailer Button */}
            <button
              onClick={() => setShowTrailer(true)}
              className="w-full py-3 bg-red-600 hover:bg-red-500 font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-lg"
            >
              <Play className="w-5 h-5 fill-white" /> თრეილერის ყურება (YouTube)
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-black/30 rounded-2xl border border-white/5 flex items-center gap-3">
                <Tv className="w-6 h-6 text-indigo-400" />
                <div>
                  <p className="text-xs text-slate-400">სტრიმინგის პლატფორმები</p>
                  <p className="font-semibold text-sm">{result.streamingPlatforms?.join(", ")}</p>
                </div>
              </div>

              <div className="p-4 bg-black/30 rounded-2xl border border-white/5 flex items-center gap-3">
                <Music className="w-6 h-6 text-emerald-400" />
                <div>
                  <p className="text-xs text-slate-400">საუნდტრეკი (OST)</p>
                  <a
                    href={result.soundtrackUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-sm hover:underline text-emerald-300"
                  >
                    {result.soundtrack}
                  </a>
                </div>
              </div>

              {result.bookTitle && (
                <div className="p-4 bg-black/30 rounded-2xl border border-white/5 flex items-center gap-3 md:col-span-2">
                  <BookOpen className="w-6 h-6 text-amber-400" />
                  <div>
                    <p className="text-xs text-slate-400">დაკავშირებული წიგნი / ლიტერატურა</p>
                    <p className="font-semibold text-sm">{result.bookTitle}</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 🍿 YouTube Trailer Modal Pop-up */}
        {showTrailer && result && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/20 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-bold text-lg">{result.title} — Official Trailer</h3>
                <button
                  onClick={() => setShowTrailer(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="relative aspect-video w-full">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(
                    result.title + " " + result.year + " official trailer"
                  )}`}
                  title="Trailer"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}