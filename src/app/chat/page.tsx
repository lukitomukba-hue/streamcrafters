"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkles, Music, Tv, Send, Mic, MicOff, Loader2, BookOpen, Play, X, Bot, User,
  Film, Zap, Brain, Headphones, Bookmark, BookmarkCheck, Share2, Trash2, Cpu, Check, Clapperboard, SlidersHorizontal, Crown, UserCheck, ArrowLeft, ExternalLink
} from "lucide-react";
import Link from "next/link";
import AuthModal from "../components/AuthModal";

interface MovieResult {
  title: string; year: string; director: string; imdbRating: string; matchScore: number;
  aiReasoning: string; streamingPlatforms: string[]; soundtrack: string; soundtrackUrl?: string; bookTitle?: string | null; youtubeId?: string;
}

interface Message {
  id: string; sender: "user" | "ai"; text: string; movie?: MovieResult | null; timestamp?: string;
}

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedTrailerMovie, setSelectedTrailerMovie] = useState<MovieResult | null>(null);
  const [watchlist, setWatchlist] = useState<MovieResult[]>([]);
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [copiedMovieTitle, setCopiedMovieTitle] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: "მოგესალმებით StreamCrafters VIP Lounge-ში! 👑\n\nმე ვარ შენი პერსონალური AI კინო-კონსიერჟი. ჩემი 3-აგენტიანი არქიტექტურის წყალობით, შემიძლია შეგირჩიო ექსკლუზიური მედია-პაკეტი (ფილმი, საუნდტრეკი, წიგნი) და გაგიზიარო სიუჟეტური ანალიზი.\n\nრით ვისიამოვნოთ დღეს?",
      timestamp: "10:00",
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
      try { setWatchlist(JSON.parse(saved)); } catch (e) { console.error(e); }
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

  const isMovieInWatchlist = (title: string) => watchlist.some((item) => item.title === title);

  const copyShareLink = (movie: MovieResult) => {
    const text = `👑 StreamCrafters VIP Recommendation: "${movie.title} (${movie.year})" - IMDb ⭐ ${movie.imdbRating}. Match: ${movie.matchScore}%`;
    navigator.clipboard.writeText(text);
    setCopiedMovieTitle(movie.title);
    setTimeout(() => setCopiedMovieTitle(null), 2500);
  };

  const promptChips = [
    { icon: <Film className="w-3.5 h-3.5 text-amber-400" />, text: "90-იანების საკულტო Sci-Fi ფილმები" },
    { icon: <Brain className="w-3.5 h-3.5 text-emerald-400" />, text: "მოულოდნელი სიუჟეტური ფინალით" },
    { icon: <Zap className="w-3.5 h-3.5 text-amber-400" />, text: "დაძაბული თრილერი 1.5 საათში" },
    { icon: <Headphones className="w-3.5 h-3.5 text-emerald-400" />, text: "საუკეთესო საუნდტრეკის მქონე ფილმი" },
    { icon: <Clapperboard className="w-3.5 h-3.5 text-amber-400" />, text: "ნოლანის სტილის ფსიქოლოგიური დრამა" },
  ];

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("ხმოვანი ძებნისთვის გამოიყენეთ Google Chrome."); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = "ka-GE";
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => setInput(event.results[0][0].transcript);
    recognition.start();
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = { id: Date.now().toString(), sender: "user", text: textToSend.trim(), timestamp: timeStr };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, mood: "moody" }),
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
      setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "ai", text: "კავშირის შეცდომა სერვერთან.", timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="fixed inset-0 bg-[#08080a] text-amber-100/90 flex flex-col p-3 md:p-5 overflow-hidden select-none font-sans">
      
      <div className="absolute -top-40 -left-40 w-[35rem] h-[35rem] bg-gradient-to-br from-amber-600/20 via-yellow-600/10 to-emerald-950/20 rounded-full blur-[160px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-40 -right-40 w-[40rem] h-[40rem] bg-gradient-to-tl from-amber-600/20 via-yellow-600/10 to-emerald-950/20 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-5xl w-full mx-auto flex-1 flex flex-col h-full min-h-0 overflow-hidden relative z-10">
        
        <header className="shrink-0 flex flex-col md:flex-row md:items-center justify-between border-b border-amber-500/20 pb-3 mb-2 gap-2 backdrop-blur-2xl z-20">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 bg-black/60 hover:bg-amber-500/20 border border-amber-500/30 rounded-2xl text-amber-300 transition shadow-lg active:scale-95" title="მთავარ გვერდზე დაბრუნება">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="relative group cursor-pointer" onClick={() => setIsAuthOpen(true)}>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-emerald-500 rounded-2xl blur opacity-30"></div>
                <div style={{ width: '44px', height: '44px' }} className="relative bg-black rounded-2xl border border-amber-500/40 p-1 flex items-center justify-center shadow-2xl overflow-hidden">
                  <img src="/4410.jpg" alt="StreamCrafters VIP" style={{ width: '100%', height: '100%', objectFit: 'contain' }} className="rounded-xl" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base md:text-xl font-black tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">StreamCrafters</h1>
                  <span className="px-2 py-0.5 text-[9px] font-black bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 rounded-full tracking-widest uppercase flex items-center gap-1 shadow-inner">
                    <Crown className="w-2.5 h-2.5 text-amber-400" /> VIP AI
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-amber-200/50 mt-0.5 font-medium">
                  <span className="flex items-center gap-1 text-emerald-400"><Cpu className="w-3 h-3 animate-spin" /> Luxury AI Core</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 md:hidden">
              <button onClick={() => setIsAuthOpen(true)} className="p-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold rounded-xl text-xs flex items-center gap-1">
                <UserCheck className="w-4 h-4" />
              </button>
              <button onClick={() => setShowWatchlist(!showWatchlist)} className="p-2 bg-black/60 border border-amber-500/30 rounded-xl text-amber-300 relative shadow-lg">
                <Bookmark className="w-4 h-4" />
                {watchlist.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[9px] font-black rounded-full flex items-center justify-center shadow">{watchlist.length}</span>}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 w-full md:w-auto">
            <button onClick={() => setIsAuthOpen(true)} className="px-3 py-1.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition">
              <UserCheck className="w-3.5 h-3.5" /> VIP შესვლა
            </button>
            <button onClick={() => setMessages([{ id: Date.now().toString(), sender: "ai", text: "ჩატი გასუფთავებულია!", timestamp: "10:00" }])} className="p-2 bg-black/40 hover:bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200/60 hover:text-amber-300 transition-all text-xs" title="ჩატის გასუფთავება">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setShowWatchlist(!showWatchlist)} className="px-3 py-1.5 bg-gradient-to-r from-amber-950/40 to-emerald-950/40 hover:from-amber-900/60 hover:to-emerald-900/60 border border-amber-500/30 rounded-xl text-amber-200 transition-all text-xs font-semibold flex items-center gap-2 relative shadow-lg">
              <Bookmark className="w-3.5 h-3.5 text-amber-400" /> Watchlist
              {watchlist.length > 0 && <span className="px-1.5 py-0.2 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[10px] font-black rounded-full shadow">{watchlist.length}</span>}
            </button>
          </div>
        </header>

        <div className="flex-1 flex gap-4 overflow-hidden min-h-0 relative">
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 pr-2 min-h-0 custom-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.sender === "ai" && (
                    <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-950 border border-amber-500/40 flex items-center justify-center shrink-0 mt-1 shadow-lg backdrop-blur-md">
                      <Bot className="w-4 h-4 text-amber-400" />
                    </div>
                  )}

                  <div className="max-w-[88%] md:max-w-[78%] space-y-1.5">
                    <div className="flex items-center justify-between px-1 text-[10px] text-amber-200/40 font-medium">
                      <span className="font-semibold text-amber-400/80">{msg.sender === "user" ? "შენ" : "StreamCrafters AI"}</span>
                      <span suppressHydrationWarning>{msg.timestamp}</span>
                    </div>

                    <div className={`p-3.5 md:p-4 rounded-2xl text-xs md:text-sm leading-relaxed whitespace-pre-wrap transition-all duration-300 ${msg.sender === "user" ? "bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-black font-medium rounded-tr-none ml-auto shadow-xl shadow-amber-900/20 border border-amber-300/30" : "bg-black/70 backdrop-blur-xl border border-amber-500/20 rounded-tl-none shadow-2xl text-amber-100/90"}`}>
                      {msg.text}
                    </div>

                    {msg.movie && (
                      <div className="border border-amber-500/30 bg-gradient-to-b from-black/90 via-neutral-950 to-emerald-950/30 rounded-3xl p-4 space-y-3 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
                        <div className="flex items-start justify-between border-b border-amber-500/20 pb-2.5 gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base md:text-lg font-black bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">{msg.movie.title}</h3>
                              <span className="text-amber-200/50 text-xs font-semibold">({msg.movie.year})</span>
                            </div>
                            <p className="text-amber-200/60 text-[11px] mt-0.5">
                              რეჟისორი: <span className="text-amber-200 font-medium">{msg.movie.director}</span> | IMDb: ⭐ <span className="text-amber-400 font-black">{msg.movie.imdbRating}</span>
                            </p>
                          </div>
                          <span className="px-2.5 py-1 bg-gradient-to-r from-emerald-950 to-emerald-900/80 text-emerald-300 border border-emerald-500/40 rounded-xl text-[10px] font-black tracking-wider shrink-0 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-400" /> {msg.movie.matchScore}% MATCH
                          </span>
                        </div>

                        <p className="text-amber-100/80 text-xs leading-relaxed">
                          <strong className="text-amber-400 font-semibold">AI ანალიზი:</strong> {msg.movie.aiReasoning}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
                          <button onClick={() => setSelectedTrailerMovie(msg.movie!)} className="md:col-span-2 py-2 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95">
                            <Play className="w-3.5 h-3.5 fill-black" /> თრეილერის / ვიდეოს ნახვა
                          </button>
                          <button onClick={() => toggleWatchlist(msg.movie!)} className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all active:scale-95 ${isMovieInWatchlist(msg.movie.title) ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-inner" : "bg-black/50 hover:bg-amber-500/10 text-amber-200 border-amber-500/30"}`}>
                            {isMovieInWatchlist(msg.movie.title) ? <><BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" /> შენახულია</> : <><Bookmark className="w-3.5 h-3.5 text-amber-400" /> შენახვა</>}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs pt-2 border-t border-amber-500/15">
                          <div className="p-2 bg-black/60 rounded-xl border border-amber-500/10 flex items-center gap-2 truncate">
                            <Tv className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate text-amber-200/70 text-[10px]">{msg.movie.streamingPlatforms?.join(", ")}</span>
                          </div>
                          <div className="p-2 bg-black/60 rounded-xl border border-amber-500/10 flex items-center gap-2 truncate">
                            <Music className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <a href={msg.movie.soundtrackUrl} target="_blank" rel="noreferrer" className="truncate hover:underline text-emerald-300 font-medium text-[10px]">{msg.movie.soundtrack}</a>
                          </div>
                          {msg.movie.bookTitle && (
                            <div className="p-2 bg-black/60 rounded-xl border border-amber-500/10 flex items-center gap-2 md:col-span-2 truncate">
                              <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="truncate text-amber-300 text-[10px]">წიგნი: {msg.movie.bookTitle}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-end pt-0.5">
                          <button onClick={() => copyShareLink(msg.movie!)} className="text-[10px] text-amber-200/50 hover:text-amber-300 flex items-center gap-1 transition">
                            {copiedMovieTitle === msg.movie.title ? <><Check className="w-3 h-3 text-emerald-400" /> დაკოპირებულია!</> : <><Share2 className="w-3 h-3" /> გაზიარება</>}
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
                  <div className="w-8 h-8 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center"><Bot className="w-4 h-4 text-amber-400" /></div>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" /> StreamCrafters AI პასუხს ამზადებს...
                </div>
              )}
            </div>

            <div className="shrink-0 pt-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] text-amber-200/50 font-medium flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3 text-amber-400" /> სწრაფი იდეები:
                </p>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {promptChips.map((chip, idx) => (
                  <button key={idx} onClick={() => handleSend(chip.text)} disabled={loading} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/60 hover:bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] font-medium whitespace-nowrap transition-all duration-200 active:scale-95 text-amber-100/80 disabled:opacity-50 shadow-sm">
                    <span>{chip.icon}</span>
                    {chip.text}
                  </button>
                ))}
              </div>
            </div>

            <div className="shrink-0 relative pt-1">
              {isListening && <p className="text-[10px] text-red-400 mb-1 animate-pulse text-center font-medium">🎙️ გისმენთ...</p>}
              <div className="relative flex items-center">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="ესაუბრე AI-ს..." className="w-full pl-4 pr-24 py-3 bg-black/80 border border-amber-500/30 rounded-2xl focus:outline-none focus:border-amber-400 backdrop-blur-xl text-xs md:text-sm text-amber-100 placeholder:text-amber-200/30 shadow-2xl transition-all" />
                <div className="absolute right-2 flex items-center gap-1">
                  <button onClick={handleVoiceInput} className={`p-2 rounded-xl transition-all ${isListening ? "bg-red-500 text-white animate-bounce shadow-lg" : "bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/20"}`}>
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => handleSend()} disabled={!input.trim() || loading} className="p-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold transition-all shadow-lg active:scale-95 disabled:opacity-40">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {showWatchlist && (
            <div className="w-full md:w-80 bg-black/95 border border-amber-500/30 rounded-3xl p-4 flex flex-col space-y-3 backdrop-blur-2xl shadow-2xl absolute md:relative inset-0 z-30 animate-in slide-in-from-right duration-300 min-h-0 overflow-hidden">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-amber-200 text-xs">ჩემი Watchlist</h3>
                </div>
                <button onClick={() => setShowWatchlist(false)} className="p-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {watchlist.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-amber-200/40 space-y-2">
                  <Bookmark className="w-8 h-8 text-amber-500/20" />
                  <p className="text-xs">შენახული ფილმები ჯერ არ გაქვს.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                  {watchlist.map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-black/60 border border-amber-500/20 rounded-2xl space-y-2 hover:border-amber-500/40 transition">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-xs text-amber-200">{item.title}</h4>
                          <p className="text-[10px] text-amber-200/50">{item.year} | ⭐ {item.imdbRating}</p>
                        </div>
                        <button onClick={() => toggleWatchlist(item)} className="p-1 text-amber-200/40 hover:text-red-400 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                      <button onClick={() => setSelectedTrailerMovie(item)} className="w-full py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition">
                        <Play className="w-3 h-3 fill-black" /> თრეილერი
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {selectedTrailerMovie && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-neutral-950 border border-amber-500/40 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative">
            <div className="p-4 border-b border-amber-500/20 flex items-center justify-between bg-black/60">
              <div>
                <h3 className="font-bold text-sm md:text-base text-amber-200">{selectedTrailerMovie.title}</h3>
                <p className="text-[11px] text-amber-200/50">Official YouTube Player</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={selectedTrailerMovie.youtubeId ? `https://www.youtube.com/watch?v=${selectedTrailerMovie.youtubeId}` : `https://www.youtube.com/results?search_query=${encodeURIComponent(selectedTrailerMovie.title + " " + selectedTrailerMovie.year)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> YouTube-ზე გახსნა ↗
                </a>
                <button onClick={() => setSelectedTrailerMovie(null)} className="p-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition border border-amber-500/20">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="relative aspect-video w-full bg-black flex items-center justify-center">
              {selectedTrailerMovie.youtubeId ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube-nocookie.com/embed/${selectedTrailerMovie.youtubeId}?autoplay=1`}
                  title="Trailer"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="text-center p-6 space-y-3">
                  <p className="text-amber-200/80 text-sm">YouTube ზღუდავს ამ ვიდეოს ჩაშენებას. უყურეთ პირდაპირ YouTube-ზე:</p>
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedTrailerMovie.title + " " + selectedTrailerMovie.year)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition shadow-xl"
                  >
                    ▶ უყურე YouTube-ზე
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}