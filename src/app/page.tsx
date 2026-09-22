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
  Check,
  Clapperboard,
  SlidersHorizontal,
  Crown,
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
      text: "???????????? StreamCrafters VIP Lounge-??! ??\n\n?? ??? ???? ??????????? AI ????-?????????. ???? 3-????????? ???????????? ????????, ???????? ???????? ??????????? ?????-?????? (?????, ??????????, ?????) ?? ????????? ????????? ???????.\n\n??? ??????????? ?????",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

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

  const copyShareLink = (movie: MovieResult) => {
    const text = `?? StreamCrafters VIP Recommendation: "${movie.title} (${movie.year})" - IMDb ? ${movie.imdbRating}. Match: ${movie.matchScore}%`;
    navigator.clipboard.writeText(text);
    setCopiedMovieTitle(movie.title);
    setTimeout(() => setCopiedMovieTitle(null), 2500);
  };

  const themeStyles = {
    moody: "bg-[#08080a] text-amber-100/90 border-amber-900/30",
    happy: "bg-[#0b0c09] text-amber-50 border-emerald-900/40",
    chill: "bg-[#050a08] text-emerald-50 border-emerald-900/40",
  };

  const orbGlows = {
    moody: "from-amber-600/20 via-yellow-600/10 to-emerald-950/20",
    happy: "from-amber-500/20 via-orange-600/15 to-emerald-900/20",
    chill: "from-emerald-600/20 via-teal-700/15 to-amber-900/20",
  };

  const promptChips = [
    { icon: <Film className="w-3.5 h-3.5 text-amber-400" />, text: "90-??????? ??????? Sci-Fi ???????" },
    { icon: <Brain className="w-3.5 h-3.5 text-emerald-400" />, text: "?????????? ????????? ???????" },
    { icon: <Zap className="w-3.5 h-3.5 text-amber-400" />, text: "???????? ??????? 1.5 ??????" },
    { icon: <Headphones className="w-3.5 h-3.5 text-emerald-400" />, text: "????????? ??????????? ????? ?????" },
    { icon: <Clapperboard className="w-3.5 h-3.5 text-amber-400" />, text: "??????? ?????? ???????????? ?????" },
  ];

  const handleVoiceInput = () => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("??????? ?????????? ?????????? Google Chrome.");
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
        text: data.reply || "?????? ??? ????????.",
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
          text: "???????? ??????? ?????????. ?????? ?????? ???????.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChatHistory = () => {
    if (confirm("????????? ????? ????? ???????? ??????")) {
      setMessages([
        {
          id: Date.now().toString(),
          sender: "ai",
          text: "???? ??????????????! ??? ???????? ??????????",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  };

  return (
    <main className={`fixed inset-0 transition-colors duration-700 ${themeStyles[mood]} flex flex-col p-3 md:p-5 overflow-hidden select-none font-sans`}>
      
      {/* ?? Background Luxury Glows */}
      <div className={`absolute -top-40 -left-40 w-[35rem] h-[35rem] bg-gradient-to-br ${orbGlows[mood]} rounded-full blur-[160px] pointer-events-none transition-all duration-1000 animate-pulse`} />
      <div className={`absolute -bottom-40 -right-40 w-[40rem] h-[40rem] bg-gradient-to-tl ${orbGlows[mood]} rounded-full blur-[180px] pointer-events-none transition-all duration-1000`} />

      <div className="max-w-5xl w-full mx-auto flex-1 flex flex-col h-full min-h-0 overflow-hidden relative z-10">
        
        {/* ?? 1. VIP HEADER */}
        <header className="shrink-0 flex flex-col md:flex-row md:items-center justify-between border-b border-amber-500/20 pb-3 mb-2 gap-2 backdrop-blur-2xl z-20">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-3">
              {/* Logo Display */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-emerald-500 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
                <div className="relative w-11 h-11 bg-black rounded-2xl border border-amber-500/40 p-1 flex items-center justify-center shadow-2xl">
                  <img src="/logo.png" alt="StreamCrafters VIP" className="w-full h-full object-contain rounded-xl" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base md:text-xl font-black tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent drop-shadow-md">
                    StreamCrafters
                  </h1>
                  <span className="px-2 py-0.5 text-[9px] font-black bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 rounded-full tracking-widest uppercase flex items-center gap-1 shadow-inner">
                    <Crown className="w-2.5 h-2.5 text-amber-400" /> VIP
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-amber-200/50 mt-0.5 font-medium">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Cpu className="w-3 h-3 animate-spin" /> Luxury AI Core
                  </span>
                  <span>•</span>
                  <span className="text-amber-400/80">3-Agent Load Balanced</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 md:hidden">
              <button
                onClick={() => setShowWatchlist(!showWatchlist)}
                className="p-2 bg-black/60 border border-amber-500/30 rounded-xl text-amber-300 relative shadow-lg"
              >
                <Bookmark className="w-4 h-4" />
                {watchlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[9px] font-black rounded-full flex items-center justify-center shadow">
                    {watchlist.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto">
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={clearChatHistory}
                title="????? ???????????"
                className="p-2 bg-black/40 hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 rounded-xl text-amber-200/60 hover:text-amber-300 transition-all text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setShowWatchlist(!showWatchlist)}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-950/40 to-emerald-950/40 hover:from-amber-900/60 hover:to-emerald-900/60 border border-amber-500/30 rounded-xl text-amber-200 transition-all text-xs font-semibold flex items-center gap-2 relative shadow-lg"
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                Watchlist
                {watchlist.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[10px] font-black rounded-full shadow">
                    {watchlist.length}
                  </span>
                )}
              </button>
            </div>

            {/* Mood Selector */}
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-2xl border border-amber-500/20 backdrop-blur-xl w-full md:w-auto justify-center shadow-inner">
              {(["moody", "happy", "chill"] as Mood[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold capitalize transition-all duration-300 flex-1 md:flex-none ${
                    mood === m
                      ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-lg shadow-amber-500/20 scale-105"
                      : "text-amber-200/50 hover:text-amber-300"
                  }`}
                >
                  {m === "moody" && "?? Regal"}
                  {m === "happy" && "?? Radiance"}
                  {m === "chill" && "?? Emerald"}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* ?? 2. CHAT CONTAINER */}
        <div className="flex-1 flex gap-4 overflow-hidden min-h-0 relative">
          
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            
            {/* Messages Scroll Area */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 pr-2 min-h-0 custom-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.sender === "ai" && (
                    <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-950 border border-amber-500/40 flex items-center justify-center shrink-0 mt-1 shadow-lg backdrop-blur-md">
                      <Bot className="w-4 h-4 text-amber-400" />
                    </div>
                  )}

                  <div className="max-w-[88%] md:max-w-[78%] space-y-1.5">
                    <div className="flex items-center justify-between px-1 text-[10px] text-amber-200/40 font-medium">
                      <span className="font-semibold text-amber-400/80">{msg.sender === "user" ? "???" : "StreamCrafters AI"}</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`p-3.5 md:p-4 rounded-2xl text-xs md:text-sm leading-relaxed whitespace-pre-wrap transition-all duration-300 ${
                        msg.sender === "user"
                          ? "bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-black font-medium rounded-tr-none ml-auto shadow-xl shadow-amber-900/20 border border-amber-300/30"
                          : "bg-black/70 backdrop-blur-xl border border-amber-500/20 rounded-tl-none shadow-2xl hover:border-amber-500/40 text-amber-100/90"
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* ?? VIP MOVIE CARD */}
                    {msg.movie && (
                      <div className="border border-amber-500/30 bg-gradient-to-b from-black/90 via-neutral-950 to-emerald-950/30 rounded-3xl p-4 space-y-3 backdrop-blur-2xl shadow-2xl hover:border-amber-500/50 transition-all relative overflow-hidden group">
                        
                        <div className="flex items-start justify-between border-b border-amber-500/20 pb-2.5 gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base md:text-lg font-black bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">{msg.movie.title}</h3>
                              <span className="text-amber-200/50 text-xs font-semibold">({msg.movie.year})</span>
                            </div>
                            <p className="text-amber-200/60 text-[11px] mt-0.5">
                              ????????: <span className="text-amber-200 font-medium">{msg.movie.director}</span> | IMDb: ? <span className="text-amber-400 font-black">{msg.movie.imdbRating}</span>
                            </p>
                          </div>

                          <span className="px-2.5 py-1 bg-gradient-to-r from-emerald-950 to-emerald-900/80 text-emerald-300 border border-emerald-500/40 rounded-xl text-[10px] font-black tracking-wider shadow-inner shrink-0 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-400" /> {msg.movie.matchScore}% MATCH
                          </span>
                        </div>

                        <p className="text-amber-100/80 text-xs leading-relaxed">
                          <strong className="text-amber-400 font-semibold">AI ???????:</strong> {msg.movie.aiReasoning}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
                          <button
                            onClick={() => setSelectedTrailerMovie(msg.movie!)}
                            className="md:col-span-2 py-2 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                          >
                            <Play className="w-3.5 h-3.5 fill-black" /> ????????? ?????
                          </button>

                          <button
                            onClick={() => toggleWatchlist(msg.movie!)}
                            className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all active:scale-95 ${
                              isMovieInWatchlist(msg.movie.title)
                                ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-inner"
                                : "bg-black/50 hover:bg-amber-500/10 text-amber-200 border-amber-500/30"
                            }`}
                          >
                            {isMovieInWatchlist(msg.movie.title) ? (
                              <>
                                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" /> ?????????
                              </>
                            ) : (
                              <>
                                <Bookmark className="w-3.5 h-3.5 text-amber-400" /> ???????
                              </>
                            )}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs pt-2 border-t border-amber-500/15">
                          <div className="p-2 bg-black/60 rounded-xl border border-amber-500/10 flex items-center gap-2 truncate">
                            <Tv className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate text-amber-200/70 text-[10px]">{msg.movie.streamingPlatforms?.join(", ")}</span>
                          </div>

                          <div className="p-2 bg-black/60 rounded-xl border border-amber-500/10 flex items-center gap-2 truncate">
                            <Music className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <a
                              href={msg.movie.soundtrackUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="truncate hover:underline text-emerald-300 font-medium text-[10px]"
                            >
                              {msg.movie.soundtrack}
                            </a>
                          </div>

                          {msg.movie.bookTitle && (
                            <div className="p-2 bg-black/60 rounded-xl border border-amber-500/10 flex items-center gap-2 md:col-span-2 truncate">
                              <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="truncate text-amber-300 text-[10px]">?????: {msg.movie.bookTitle}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-end pt-0.5">
                          <button
                            onClick={() => copyShareLink(msg.movie!)}
                            className="text-[10px] text-amber-200/50 hover:text-amber-300 flex items-center gap-1 transition"
                          >
                            {copiedMovieTitle === msg.movie.title ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" /> ?????????????!
                              </>
                            ) : (
                              <>
                                <Share2 className="w-3 h-3" /> ?????????
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {msg.sender === "user" && (
                    <div className="w-8 h-8 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 mt-1 shadow-lg">
                      <User className="w-4 h-4 text-amber-300" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-amber-300/80 text-xs animate-pulse p-2">
                  <div className="w-8 h-8 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-amber-400" />
                  </div>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" /> StreamCrafters AI ???????? ?????????? ??????...
                </div>
              )}
            </div>

            {/* Prompt Chips */}
            <div className="shrink-0 pt-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] text-amber-200/50 font-medium flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3 text-amber-400" /> ?????? VIP ??????:
                </p>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {promptChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip.text)}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/60 hover:bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] font-medium whitespace-nowrap transition-all duration-200 active:scale-95 text-amber-100/80 disabled:opacity-50 shadow-sm"
                  >
                    <span>{chip.icon}</span>
                    {chip.text}
                  </button>
                ))}
              </div>
            </div>

            {/* ?? Input Bar */}
            <div className="shrink-0 relative pt-1">
              {isListening && (
                <p className="text-[10px] text-red-400 mb-1 animate-pulse text-center font-medium">
                  ??? ???????... ??????????...
                </p>
              )}

              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="??????? AI-?, ?????? ????? ?? ?????? ?????? ???????..."
                  className="w-full pl-4 pr-24 py-3 bg-black/80 border border-amber-500/30 rounded-2xl focus:outline-none focus:border-amber-400 backdrop-blur-xl text-xs md:text-sm text-amber-100 placeholder:text-amber-200/30 shadow-2xl transition-all"
                />

                <div className="absolute right-2 flex items-center gap-1">
                  <button
                    onClick={handleVoiceInput}
                    title="??????? ???????"
                    className={`p-2 rounded-xl transition-all ${
                      isListening
                        ? "bg-red-500 text-white animate-bounce shadow-lg"
                        : "bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/20"
                    }`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || loading}
                    className="p-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold transition-all shadow-lg active:scale-95 disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* ?? Watchlist Panel */}
          {showWatchlist && (
            <div className="w-full md:w-80 bg-black/95 border border-amber-500/30 rounded-3xl p-4 flex flex-col space-y-3 backdrop-blur-2xl shadow-2xl absolute md:relative inset-0 z-30 animate-in slide-in-from-right duration-300 min-h-0 overflow-hidden">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-amber-200 text-xs">???? Watchlist</h3>
                </div>
                <button
                  onClick={() => setShowWatchlist(false)}
                  className="p-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {watchlist.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-amber-200/40 space-y-2">
                  <Bookmark className="w-8 h-8 text-amber-500/20" />
                  <p className="text-xs">???????? ??????? ??? ?? ?????.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                  {watchlist.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-black/60 border border-amber-500/20 rounded-2xl space-y-2 hover:border-amber-500/40 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-xs text-amber-200">{item.title}</h4>
                          <p className="text-[10px] text-amber-200/50">{item.year} | ? {item.imdbRating}</p>
                        </div>
                        <button
                          onClick={() => toggleWatchlist(item)}
                          className="p-1 text-amber-200/40 hover:text-red-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => setSelectedTrailerMovie(item)}
                        className="w-full py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                      >
                        <Play className="w-3 h-3 fill-black" /> ????????
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* ?? Trailer Modal */}
      {selectedTrailerMovie && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-neutral-950 border border-amber-500/40 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative">
            <div className="p-4 border-b border-amber-500/20 flex items-center justify-between bg-black/60">
              <div>
                <h3 className="font-bold text-sm md:text-base text-amber-200">{selectedTrailerMovie.title}</h3>
                <p className="text-[11px] text-amber-200/50">Official YouTube Trailer</p>
              </div>
              <button
                onClick={() => setSelectedTrailerMovie(null)}
                className="p-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition active:scale-95 border border-amber-500/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative aspect-video w-full bg-black">
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
