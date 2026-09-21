"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Music,
  Tv,
  Send,
  Mic,
  MicOff,
  Loader2,
  BookOpen,
  Play,
  X,
  Bot,
  User,
  Film,
  Zap,
  Brain,
  Headphones,
  Bookmark,
  BookmarkCheck,
  Share2,
  Trash2,
  Cpu,
  Star,
  Check,
  Clapperboard,
  SlidersHorizontal,
} from "lucide-react";

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
  timestamp?: string;
}

export default function Home() {
  const [mood, setMood] = useState<Mood>("moody");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedTrailerMovie, setSelectedTrailerMovie] = useState<MovieResult | null>(null);
  const [watchlist, setWatchlist] = useState<MovieResult[]>([]);
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [copiedMovieTitle, setCopiedMovieTitle] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: "მოგესალმებით StreamCrafters-ში! 🎬\n\nმე ვარ შენი პერსონალური AI კინო-ასისტენტი. ჩემი 3-აგენტიანი არქიტექტურის წყალობით, შემიძლია გესაუბრო კინემატოგრაფიაზე, გაგიზიარო სიუჟეტური ანალიზი, ან შეგირჩიო იდეალური მედია-პაკეტი (ფილმი, საუნდტრეკი, წიგნი).\n\nრით დავიწყოთ დღეს?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 💾 Watchlist-ის ჩატვირთვა LocalStorage-დან
  useEffect(() => {
    const saved = localStorage.getItem("streamcrafters_watchlist");
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch (e) {
        console.error("Watchlist parsing error", e);
      }
    }
  }, []);

  // 💾 Watchlist-ის შენახვა
  const saveWatchlist = (newList: MovieResult[]) => {
    setWatchlist(newList);
    localStorage.setItem("streamcrafters_watchlist", JSON.stringify(newList));
  };

  const toggleWatchlist = (movie: MovieResult) => {
    const exists = watchlist.some((item) => item.title === movie.title);
    if (exists) {
      saveWatchlist(watchlist.filter((item) => item.title !== movie.title));
    } else {
      saveWatchlist([...watchlist, movie]);
    }
  };

  const isMovieInWatchlist = (title: string) => {
    return watchlist.some((item) => item.title === title);
  };

  // 🔗 გაზიარების ლოგიკა
  const copyShareLink = (movie: MovieResult) => {
    const text = `🎬 StreamCrafters AI Recommendation: "${movie.title} (${movie.year})" - IMDb ⭐ ${movie.imdbRating}. Match: ${movie.matchScore}%`;
    navigator.clipboard.writeText(text);
    setCopiedMovieTitle(movie.title);
    setTimeout(() => setCopiedMovieTitle(null), 2500);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // 🌌 ატმოსფერული სტილები
  const themeStyles = {
    moody: "bg-slate-950 text-slate-100 border-slate-800",
    happy: "bg-[#180d04] text-amber-50 border-amber-900/40",
    chill: "bg-[#041410] text-emerald-50 border-emerald-900/40",
  };

  const orbGlows = {
    moody: "from-blue-600/25 via-indigo-600/20 to-purple-900/20",
    happy: "from-amber-500/25 via-orange-600/20 to-yellow-700/20",
    chill: "from-emerald-500/25 via-teal-600/20 to-cyan-800/20",
  };

  const accentColors = {
    moody: "from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500",
    happy: "from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400",
    chill: "from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500",
  };

  const promptChips = [
    { icon: <Film className="w-3.5 h-3.5" />, text: "90-იანების საკულტო Sci-Fi ფილმები" },
    { icon: <Brain className="w-3.5 h-3.5" />, text: "მოულოდნელი სიუჟეტური ფინალით" },
    { icon: <Zap className="w-3.5 h-3.5" />, text: "დაძაბული თრილერი 1.5 საათში" },
    { icon: <Headphones className="w-3.5 h-3.5" />, text: "საუკეთესო საუნდტრეკის მქონე ფილმი" },
    { icon: <Clapperboard className="w-3.5 h-3.5" />, text: "ნოლანის სტილის ფსიქოლოგიური დრამა" },
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

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend.trim(),
      timestamp: timeStr,
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
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "ai",
          text: "კავშირის შეცდომა სერვერთან. გთხოვთ სცადოთ ხელახლა.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChatHistory = () => {
    if (confirm("ნამდვილად გსურთ ჩატის ისტორიის წაშლა?")) {
      setMessages([
        {
          id: Date.now().toString(),
          sender: "ai",
          text: "ჩატი გასუფთავებულია! რით შემიძლია დაგეხმარო?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  };

  return (
    <main className={`min-h-screen transition-colors duration-700 ${themeStyles[mood]} flex flex-col p-3 md:p-6 relative overflow-hidden select-none`}>
      
      {/* 🌌 Dynamic Ambient Background Mesh */}
      <div className={`absolute -top-40 -left-40 w-[30rem] h-[30rem] bg-gradient-to-br ${orbGlows[mood]} rounded-full blur-[140px] pointer-events-none transition-all duration-1000 animate-pulse`} />
      <div className={`absolute -bottom-40 -right-40 w-[35rem] h-[35rem] bg-gradient-to-tl ${orbGlows[mood]} rounded-full blur-[160px] pointer-events-none transition-all duration-1000`} />
      <div className="absolute inset-0 bg-[radial-gradient(#rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

      <div className="max-w-5xl w-full mx-auto flex-1 flex flex-col space-y-4 relative z-10">
        
        {/* 🔝 Main Header Navigation */}
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-4 pt-1 gap-3 backdrop-blur-2xl">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-2xl border border-white/15 backdrop-blur-xl shadow-inner">
                <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                    StreamCrafters
                  </h1>
                  <span className="px-2 py-0.5 text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full tracking-wider uppercase">
                    v2.5 AI
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <Cpu className="w-3 h-3 animate-spin" /> 3-Agent Network
                  </span>
                  <span>•</span>
                  <span>Load Balanced</span>
                </div>
              </div>
            </div>

            {/* Mobile Watchlist & Clear Buttons */}
            <div className="flex items-center gap-1.5 md:hidden">
              <button
                onClick={() => setShowWatchlist(!showWatchlist)}
                className="p-2 bg-white/5 border border-white/10 rounded-xl text-slate-300 relative"
              >
                <Bookmark className="w-4 h-4" />
                {watchlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-black text-[9px] font-black rounded-full flex items-center justify-center">
                    {watchlist.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Actions & Mood Bar */}
          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            {/* Clear & Watchlist Desktop Buttons */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={clearChatHistory}
                title="ჩატის გასუფთავება"
                className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all text-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setShowWatchlist(!showWatchlist)}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-200 transition-all text-xs font-semibold flex items-center gap-2 relative"
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                Watchlist
                {watchlist.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-amber-500 text-black text-[10px] font-black rounded-full">
                    {watchlist.length}
                  </span>
                )}
              </button>
            </div>

            {/* Mood Switcher */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-xl w-full md:w-auto justify-center">
              {(["moody", "happy", "chill"] as Mood[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all duration-300 flex-1 md:flex-none ${
                    mood === m ? "bg-white text-black shadow-lg scale-105" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {m === "moody" && "🌙 Moody"}
                  {m === "happy" && "☀️ Happy"}
                  {m === "chill" && "🌿 Chill"}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* 💬 Main Chat & Watchlist Container */}
        <div className="flex-1 flex gap-4 overflow-hidden relative">
          
          {/* Chat Messages Panel */}
          <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 max-h-[60vh] min-h-[48vh] custom-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.sender === "ai" && (
                    <div className="w-9 h-9 rounded-2xl bg-indigo-600/90 border border-indigo-400/40 flex items-center justify-center shrink-0 mt-1 shadow-lg backdrop-blur-md">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}

                  <div className="max-w-[88%] md:max-w-[78%] space-y-3">
                    {/* Bubble Header */}
                    <div className="flex items-center justify-between px-1 text-[10px] text-slate-400">
                      <span className="font-semibold">{msg.sender === "user" ? "შენ" : "StreamCrafters AI"}</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    {/* Text Content */}
                    <div
                      className={`p-4 md:p-5 rounded-2xl text-sm md:text-base leading-relaxed whitespace-pre-wrap transition-all duration-300 ${
                        msg.sender === "user"
                          ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-tr-none ml-auto shadow-xl"
                          : "bg-white/10 backdrop-blur-xl border border-white/10 rounded-tl-none shadow-xl hover:border-white/20"
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* 🎬 High-End Interactive Movie Card */}
                    {msg.movie && (
                      <div className="border border-white/15 bg-black/60 rounded-3xl p-5 md:p-6 space-y-4 backdrop-blur-2xl shadow-2xl transition-all hover:border-white/30 relative overflow-hidden group">
                        
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />

                        {/* Title & Header */}
                        <div className="flex items-start justify-between border-b border-white/10 pb-3 gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-xl md:text-2xl font-black text-white tracking-wide">{msg.movie.title}</h3>
                              <span className="text-slate-400 text-sm font-semibold">({msg.movie.year})</span>
                            </div>
                            <p className="text-slate-400 text-xs mt-1">
                              რეჟისორი: <span className="text-slate-200 font-medium">{msg.movie.director}</span> | IMDb: ⭐ <span className="text-amber-400 font-bold">{msg.movie.imdbRating}</span>
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-black tracking-wider shadow-inner">
                              {msg.movie.matchScore}% MATCH
                            </span>
                          </div>
                        </div>

                        {/* Reasoning */}
                        <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                          <strong className="text-white font-semibold">AI ანალიზი:</strong> {msg.movie.aiReasoning}
                        </p>

                        {/* Interactive Action Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
                          <button
                            onClick={() => setSelectedTrailerMovie(msg.movie!)}
                            className="md:col-span-2 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs md:text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                          >
                            <Play className="w-4 h-4 fill-white" /> თრეილერი
                          </button>

                          <button
                            onClick={() => toggleWatchlist(msg.movie!)}
                            className={`py-3 px-4 rounded-2xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 border transition-all active:scale-95 ${
                              isMovieInWatchlist(msg.movie.title)
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                : "bg-white/10 hover:bg-white/20 text-white border-white/10"
                            }`}
                          >
                            {isMovieInWatchlist(msg.movie.title) ? (
                              <>
                                <BookmarkCheck className="w-4 h-4 text-amber-400" /> შენახულია
                              </>
                            ) : (
                              <>
                                <Bookmark className="w-4 h-4" /> შენახვა
                              </>
                            )}
                          </button>
                        </div>

                        {/* Media Integration Badges */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-2 border-t border-white/10">
                          <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between backdrop-blur-md">
                            <div className="flex items-center gap-2 truncate">
                              <Tv className="w-4 h-4 text-indigo-400 shrink-0" />
                              <span className="truncate text-slate-300">{msg.movie.streamingPlatforms?.join(", ")}</span>
                            </div>
                          </div>

                          <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between backdrop-blur-md">
                            <div className="flex items-center gap-2 truncate">
                              <Music className="w-4 h-4 text-emerald-400 shrink-0" />
                              <a
                                href={msg.movie.soundtrackUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="truncate hover:underline text-emerald-300 font-medium"
                              >
                                {msg.movie.soundtrack}
                              </a>
                            </div>
                          </div>

                          {msg.movie.bookTitle && (
                            <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between md:col-span-2 backdrop-blur-md">
                              <div className="flex items-center gap-2 truncate">
                                <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                                <span className="truncate text-amber-200">წიგნი: {msg.movie.bookTitle}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Bottom Share Bar */}
                        <div className="flex items-center justify-end pt-1">
                          <button
                            onClick={() => copyShareLink(msg.movie!)}
                            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition"
                          >
                            {copiedMovieTitle === msg.movie.title ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" /> დაკოპირებულია!
                              </>
                            ) : (
                              <>
                                <Share2 className="w-3.5 h-3.5" /> გაზიარება
                              </>
                            )}
                          </button>
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
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" /> StreamCrafters აგენერირებს პასუხს...
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* 💡 Quick Prompt Chips */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3 h-3 text-amber-400" /> სწრაფი იდეები:
                </p>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {promptChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip.text)}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/15 border border-white/10 rounded-2xl text-xs font-medium whitespace-nowrap transition-all duration-200 active:scale-95 text-slate-200 disabled:opacity-50 shadow-sm"
                  >
                    <span className="text-indigo-400">{chip.icon}</span>
                    {chip.text}
                  </button>
                ))}
              </div>
            </div>

            {/* 📥 Text Input Bar */}
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

          {/* 🔖 Watchlist Side Panel (Desktop & Mobile) */}
          {showWatchlist && (
            <div className="w-full md:w-80 bg-slate-900/90 border border-white/15 rounded-3xl p-4 flex flex-col space-y-4 backdrop-blur-2xl shadow-2xl absolute md:relative inset-0 z-30 animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-white text-base">ჩემი Watchlist</h3>
                </div>
                <button
                  onClick={() => setShowWatchlist(false)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {watchlist.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-slate-400 space-y-2">
                  <Bookmark className="w-8 h-8 text-slate-600" />
                  <p className="text-xs">შენახული ფილმები ჯერ არ გაქვს.</p>
                  <p className="text-[10px] text-slate-500">დააჭირე "შენახვა" ღილაკს AI-ს რეკომენდაციებზე.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                  {watchlist.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-2 hover:border-white/20 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-white">{item.title}</h4>
                          <p className="text-[11px] text-slate-400">{item.year} | ⭐ {item.imdbRating}</p>
                        </div>
                        <button
                          onClick={() => toggleWatchlist(item)}
                          className="p-1 text-slate-400 hover:text-red-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => setSelectedTrailerMovie(item)}
                        className="w-full py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                      >
                        <Play className="w-3 h-3 fill-white" /> თრეილერი
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* 🍿 YouTube Trailer Modal */}
      {selectedTrailerMovie && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-white/20 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div>
                <h3 className="font-bold text-base md:text-lg text-white">{selectedTrailerMovie.title}</h3>
                <p className="text-xs text-slate-400">Official YouTube Trailer</p>
              </div>
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