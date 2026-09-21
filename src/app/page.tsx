"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Music, Tv, Send, Mic, MicOff, Loader2, BookOpen, Play, X, Bot, User, Film, Zap, Brain, Headphones } from "lucide-react";

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
      text: "გამარჯობა! 👋 მე ვარ StreamCrafters AI. მზად ვარ გესაუბრო კინემატოგრაფიაზე, განვიხილოთ სიუჟეტები ან შეგირჩიო იდეალური ფილმი შენი განწყობის მიხედვით. რაზე ვისაუბროთ?",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // 🌌 ატმოსფერული ფონების სტილები განწყობის მიხედვით
  const themeStyles = {
    moody: "bg-slate-950 text-slate-100 border-slate-800",
    happy: "bg-amber-950/90 text-amber-50 border-amber-800",
    chill: "bg-emerald-950/90 text-emerald-50 border-emerald-800",
  };

  const orbGlows = {
    moody: "from-blue-600/20 via-indigo-600/20 to-purple-800/20",
    happy: "from-amber-500/20 via-orange-500/20 to-yellow-600/20",
    chill: "from-emerald-500/20 via-teal-500/20 to-cyan-700/20",
  };

  const accentColors = {
    moody: "from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500",
    happy: "from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400",
    chill: "from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500",
  };

  // 💡 სწრაფი Prompt Chips ღილაკების სია
  const promptChips = [
    { icon: <Film className="w-3.5 h-3.5" />, text: "90-იანების საკულტო Sci-Fi ფილმები" },
    { icon: <Brain className="w-3.5 h-3.5" />, text: "მოულოდნელი სიუჟეტური ფინალით" },
    { icon: <Zap className="w-3.5 h-3.5" />, text: "დაძაბული თრილერი 1.5 საათში" },
    { icon: <Headphones className="w-3.5 h-3.5" />, text: "საუკეთესო საუნდტრეკის მქონე ფილმი" },
  ];

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
  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend.trim(),
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
    <main className={`min-h-screen transition-colors duration-700 ${themeStyles[mood]} flex flex-col p-4 md:p-8 relative overflow-hidden select-none`}>
      
      {/* 🌌 Dynamic Ambient Glowing Orbs (ატმოსფერული ფონური სინათლე) */}
      <div className={`absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br ${orbGlows[mood]} rounded-full blur-[120px] pointer-events-none transition-all duration-1000 animate-pulse`} />
      <div className={`absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-gradient-to-tl ${orbGlows[mood]} rounded-full blur-[140px] pointer-events-none transition-all duration-1000`} />

      <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col space-y-4 relative z-10">
        
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/10 pb-4 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-xl">
              <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                StreamCrafters AI
              </h1>
              <p className="text-[10px] md:text-xs text-slate-400">Multi-Agent Cinema Companion</p>
            </div>
          </div>
          
          {/* Mood Selector */}
          <div className="flex items-center gap-1.5 bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl">
            {(["moody", "happy", "chill"] as Mood[]).map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all duration-300 ${
                  mood === m ? "bg-white text-black shadow-lg scale-105" : "text-slate-400 hover:text-white"
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
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 max-h-[62vh] min-h-[48vh] custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "ai" && (
                <div className="w-9 h-9 rounded-2xl bg-indigo-600/80 border border-indigo-400/30 flex items-center justify-center shrink-0 mt-1 shadow-lg backdrop-blur-md">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}

              <div className="max-w-[85%] md:max-w-[78%] space-y-3">
                <div
                  className={`p-4 md:p-5 rounded-2xl text-sm md:text-base leading-relaxed whitespace-pre-wrap transition-all duration-300 ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-br-none ml-auto shadow-xl"
                      : "bg-white/10 backdrop-blur-xl border border-white/10 rounded-bl-none shadow-xl hover:border-white/20"
                  }`}
                >
                  {msg.text}
                </div>

                {/* 🎬 Movie Card */}
                {msg.movie && (
                  <div className="border border-white/15 bg-black/50 rounded-3xl p-5 md:p-6 space-y-4 backdrop-blur-2xl shadow-2xl transition-all hover:border-white/30">
                    <div className="flex items-start justify-between border-b border-white/10 pb-3">
                      <div>
                        <h3 className="text-xl md:text-2xl font-black text-white tracking-wide">{msg.movie.title} ({msg.movie.year})</h3>
                        <p className="text-slate-400 text-xs mt-1">
                          რეჟისორი: <span className="text-slate-200 font-medium">{msg.movie.director}</span> | IMDb: ⭐ <span className="text-amber-400 font-bold">{msg.movie.imdbRating}</span>
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-black tracking-wider shadow-inner">
                        {msg.movie.matchScore}% MATCH
                      </span>
                    </div>

                    <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                      <strong className="text-white font-semibold">AI დასაბუთება:</strong> {msg.movie.aiReasoning}
                    </p>

                    <button
                      onClick={() => setSelectedTrailerMovie(msg.movie!)}
                      className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs md:text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-white" /> ოფიციალური თრეილერის ყურება
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                      <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-2.5 backdrop-blur-md">
                        <Tv className="w-4 h-4 text-indigo-400" />
                        <span className="truncate text-slate-300">{msg.movie.streamingPlatforms?.join(", ")}</span>
                      </div>
                      <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-2.5 backdrop-blur-md">
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
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-2.5 md:col-span-2 backdrop-blur-md">
                          <BookOpen className="w-4 h-4 text-amber-400" />
                          <span className="truncate text-amber-200">{msg.movie.bookTitle}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {msg.sender === "user" && (
                <div className="w-9 h-9 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-1 shadow-lg">
                  <User className="w-5 h-5 text-slate-300" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-slate-400 text-sm animate-pulse p-2">
              <div className="w-9 h-9 rounded-2xl bg-indigo-600/50 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" /> StreamCrafters აზროვნებს...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 💡 Quick Prompt Chips (სწრაფი იდეების ღილაკები) */}
        <div className="pt-2">
          <p className="text-[11px] text-slate-400 mb-2 font-medium flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400" /> სწრაფი იდეები:
          </p>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {promptChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip.text)}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/15 border border-white/10 rounded-2xl text-xs font-medium whitespace-nowrap transition-all duration-200 active:scale-95 text-slate-200 disabled:opacity-50"
              >
                <span className="text-indigo-400">{chip.icon}</span>
                {chip.text}
              </button>
            ))}
          </div>
        </div>

        {/* 📥 Input Area */}
        <div className="relative pt-1">
          {isListening && (
            <p className="text-xs text-red-400 mb-2 animate-pulse text-center font-medium">
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
              className="w-full pl-5 pr-28 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-white/30 backdrop-blur-xl text-sm md:text-base placeholder:text-slate-500 shadow-2xl transition-all"
            />

            <div className="absolute right-3 flex items-center gap-1.5">
              <button
                onClick={handleVoiceInput}
                title="ხმოვანი შეყვანა"
                className={`p-2.5 rounded-xl transition-all ${
                  isListening
                    ? "bg-red-500 text-white animate-bounce shadow-lg"
                    : "bg-white/10 text-slate-300 hover:bg-white/20"
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className={`p-2.5 rounded-xl bg-gradient-to-r ${accentColors[mood]} text-white transition-all shadow-lg active:scale-95 disabled:opacity-40`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 🍿 Trailer Modal */}
      {selectedTrailerMovie && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-white/20 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <h3 className="font-bold text-base md:text-lg text-white">{selectedTrailerMovie.title} — Official Trailer</h3>
              <button
                onClick={() => setSelectedTrailerMovie(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition active:scale-95"
              >
                <X className="w-5 h-5 text-white" />
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