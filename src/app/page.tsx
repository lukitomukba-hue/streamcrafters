"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Music, Tv, Send, Mic, MicOff, Loader2, BookOpen, Play, X, Bot, User } from "lucide-react";

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

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  movie?: MovieResult | null;
}

export default function Home() {
  const [mood, setMood] = useState<Mood>("moody");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedTrailerMovie, setSelectedTrailerMovie] = useState<MovieResult | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: "გამარჯობა! 👋 მე ვარ StreamCrafters AI. მზად ვარ, გესაუბრო კინემატოგრაფიაზე, განვიხილოთ სიუჟეტები, ან შეგირჩიო იდეალური მედია-პაკეტი შენი განწყობის მიხედვით. რაზე ვისაუბროთ?",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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

  // 🎙️ ხმოვანი ძებნა
  const handleVoiceInput = () => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("ხმოვანი ძებნისთვის გამოიყენეთ Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ka-GE";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    recognition.onresult = (event: any) => {
      setInput(event.results[0][0].transcript);
    };

    recognition.start();
  };

  // 💬 მესიჯის გაგზავნა
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: input.trim(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, mood }),
      });

      const data = await res.json();

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: data.reply || "პასუხი ვერ მომზადდა.",
        movie: data.hasMovie ? data.movie : null,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "ai",
          text: "კავშირის შეცდომა. გთხოვთ სცადოთ ხელახლა.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`min-h-screen transition-colors duration-500 ${themeStyles[mood]} flex flex-col p-4 md:p-8 relative`}>
      <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col space-y-4">
        
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-indigo-400 animate-pulse" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">StreamCrafters AI</h1>
          </div>
          
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
            {(["moody", "happy", "chill"] as Mood[]).map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                  mood === m ? "bg-white text-black shadow-md" : "text-slate-400 hover:text-white"
                }`}
              >
                {m === "moody" && "🌙 Moody"}
                {m === "happy" && "☀️ Happy"}
                {m === "chill" && "🌿 Chill"}
              </button>
            ))}
          </div>
        </header>

        {/* 💬 Chat Container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 max-h-[68vh] min-h-[50vh]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "ai" && (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}

              <div className="max-w-[85%] md:max-w-[75%] space-y-3">
                <div
                  className={`p-4 rounded-2xl text-sm md:text-base leading-relaxed whitespace-pre-wrap ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-br-none ml-auto"
                      : "bg-white/10 backdrop-blur-md border border-white/10 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>

                {/* Movie Card */}
                {msg.movie && (
                  <div className="border border-white/15 bg-black/40 rounded-2xl p-5 space-y-4 backdrop-blur-lg shadow-2xl animate-in fade-in duration-300">
                    <div className="flex items-start justify-between border-b border-white/10 pb-3">
                      <div>
                        <h3 className="text-xl font-black text-white">{msg.movie.title} ({msg.movie.year})</h3>
                        <p className="text-slate-400 text-xs mt-0.5">
                          რეჟისორი: {msg.movie.director} | IMDb: ⭐ {msg.movie.imdbRating}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold">
                        {msg.movie.matchScore}% Match
                      </span>
                    </div>

                    <p className="text-slate-300 text-xs md:text-sm">
                      <strong className="text-white">AI დასაბუთება:</strong> {msg.movie.aiReasoning}
                    </p>

                    <button
                      onClick={() => setSelectedTrailerMovie(msg.movie!)}
                      className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs md:text-sm rounded-xl flex items-center justify-center gap-2 transition shadow-md"
                    >
                      <Play className="w-4 h-4 fill-white" /> თრეილერის ყურება
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                      <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 flex items-center gap-2">
                        <Tv className="w-4 h-4 text-indigo-400" />
                        <span className="truncate">{msg.movie.streamingPlatforms?.join(", ")}</span>
                      </div>
                      <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 flex items-center gap-2">
                        <Music className="w-4 h-4 text-emerald-400" />
                        <a
                          href={msg.movie.soundtrackUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="truncate hover:underline text-emerald-300 font-medium"
                        >
                          {msg.movie.soundtrack}
                        </a>
                      </div>
                      {msg.movie.bookTitle && (
                        <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 flex items-center gap-2 md:col-span-2">
                          <BookOpen className="w-4 h-4 text-amber-400" />
                          <span className="truncate">{msg.movie.bookTitle}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {msg.sender === "user" && (
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-5 h-5 text-slate-300" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-slate-400 text-sm animate-pulse">
              <div className="w-8 h-8 rounded-full bg-indigo-600/50 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <Loader2 className="w-4 h-4 animate-spin" /> StreamCrafters აზროვნებს...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="relative pt-2">
          {isListening && (
            <p className="text-xs text-red-400 mb-2 animate-pulse text-center">
              🎙️ გისმენთ... ილაპარაკეთ...
            </p>
          )}

          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="ესაუბრე AI-ს, ჰკითხე რჩევა ან სთხოვე ფილმის მოძებნა..."
              className="w-full pl-5 pr-24 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-white/30 text-sm md:text-base placeholder:text-slate-500"
            />

            <div className="absolute right-3 flex items-center gap-1.5">
              <button
                onClick={handleVoiceInput}
                title="ხმოვანი შეყვანა"
                className={`p-2.5 rounded-xl transition ${
                  isListening
                    ? "bg-red-500 text-white animate-bounce"
                    : "bg-white/10 text-slate-300 hover:bg-white/20"
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className={`p-2.5 rounded-xl bg-gradient-to-r ${accentColors[mood]} text-white transition disabled:opacity-40`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Trailer Modal */}
      {selectedTrailerMovie && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-base md:text-lg">{selectedTrailerMovie.title} — Official Trailer</h3>
              <button
                onClick={() => setSelectedTrailerMovie(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative aspect-video w-full">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(
                  selectedTrailerMovie.title + " " + selectedTrailerMovie.year + " official trailer"
                )}`}
                title="Trailer"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}