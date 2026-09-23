'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Movie {
  title: string;
  year: string;
  director: string;
  imdbRating: string;
  matchScore: number;
  aiReasoning: string;
  streamingPlatforms: string[];
  soundtrack?: string;
  soundtrackUrl?: string;
  bookTitle?: string;
  youtubeId?: string;
  fullMovieUrl?: string;
  servers?: {
    server1?: string;
    server2?: string;
    server3?: string;
    trailer?: string;
  };
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  hasMovie?: boolean;
  movie?: Movie | null;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'მოგესალმებით StreamCrafters VIP Lounge-ში! 👑\n\nმე ვარ შენი პერსონალური AI კინო-კონსიერჟი. შემიძლია შეგირჩიო ნებისმიერი ფილმი, გაჩვენო სრული სტრიმი, საუნდტრეკი და ანალიზი.\n\nრით ვისიამოვნოთ დღეს?',
      time: '10:00'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [selectedServer, setSelectedServer] = useState<'server1' | 'server2' | 'server3' | 'trailer'>('server1');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: timeNow
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ sender: m.sender, text: m.text })),
          mood: 'moody'
        })
      });

      const data = await res.json();

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.reply || 'გისმენთ, რით შემიძლია დაგეხმაროთ?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hasMovie: !!data.hasMovie,
        movie: data.movie || null
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'მოგესალმებით StreamCrafters VIP Lounge-ში! რით შემიძლია გემსახუროთ?',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getActiveStreamUrl = (movie: Movie) => {
    if (!movie.servers) return movie.fullMovieUrl || `https://www.youtube.com/embed/${movie.youtubeId || '4CJFF-ALAqs'}`;
    if (selectedServer === 'server1') return movie.servers.server1 || movie.fullMovieUrl || movie.servers.trailer;
    if (selectedServer === 'server2') return movie.servers.server2 || movie.servers.server1;
    if (selectedServer === 'server3') return movie.servers.server3 || movie.servers.server1;
    if (selectedServer === 'trailer') return movie.servers.trailer || `https://www.youtube.com/embed/${movie.youtubeId}`;
    return movie.fullMovieUrl || movie.servers.server1;
  };

  const quickIdeas = [
    '90-იანების საკულტო Sci-Fi ფილმები',
    'მოულოდნელი სიუჟეტური ფინალით',
    'დაძაბული თრილერი 1.5 საათში',
    'საუკეთესო საუნდტრეკის მქონე ფილმი'
  ];

  return (
    <div className="flex flex-col h-screen bg-[#0d0d0d] text-white font-sans overflow-hidden">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#121212]">
        <div className="flex items-center gap-4">
          <button onClick={() => window.history.back()} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-300">
            ←
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-amber-400">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-amber-400">StreamCrafters</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">VIP AI</span>
              </div>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Luxury AI Core
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-semibold text-xs px-4 py-2 rounded-xl">
            👑 VIP შესვლა
          </button>
          <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400">🗑</button>
          <button className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-amber-300 border border-amber-500/30">
            🔖 Watchlist
          </button>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map(msg => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className="flex items-end gap-2 max-w-[85%]">
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs shrink-0">
                  🤖
                </div>
              )}

              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-black font-medium rounded-br-none shadow-lg shadow-amber-600/10'
                    : 'bg-[#18181b] border border-white/10 text-gray-200 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Movie Card */}
                {msg.hasMovie && msg.movie && (
                  <div className="mt-4 p-4 rounded-xl bg-[#121214] border border-amber-500/30 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold text-amber-400">
                          {msg.movie.title} <span className="text-gray-400 text-xs">({msg.movie.year})</span>
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          რეჟისორი: <span className="text-gray-200 font-medium">{msg.movie.director}</span> | IMDb: ⭐{' '}
                          <span className="text-amber-300 font-bold">{msg.movie.imdbRating}</span>
                        </p>
                      </div>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-1 rounded-full font-bold">
                        ✨ {msg.movie.matchScore}% MATCH
                      </span>
                    </div>

                    <p className="text-xs text-gray-300 bg-white/5 p-2.5 rounded-lg border border-white/5">
                      <strong className="text-amber-400">AI ანალიზი:</strong> {msg.movie.aiReasoning}
                    </p>

                    {/* Media Actions */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => {
                          setPlayingVideoId(playingVideoId === msg.id ? null : msg.id);
                          setSelectedServer('server1');
                        }}
                        className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition"
                      >
                        ▶ {playingVideoId === msg.id ? 'ფლეერის დახურვა' : 'სრული ფილმი / ვიდეო'}
                      </button>
                      
                      <a
                        href={getActiveStreamUrl(msg.movie)}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-white/10 hover:bg-white/20 text-amber-300 font-medium text-xs py-2 px-3 rounded-xl flex items-center gap-1 border border-amber-500/30"
                      >
                        🔗 ახალ ფანჯარაში
                      </a>
                    </div>

                    {/* Server Switcher & Video Player */}
                    {playingVideoId === msg.id && (
                      <div className="mt-3 space-y-2">
                        {/* Server Buttons */}
                        <div className="flex flex-wrap items-center gap-1.5 bg-black/40 p-1.5 rounded-lg border border-white/10 text-[11px]">
                          <span className="text-gray-400 px-1 font-semibold">სერვერები:</span>
                          <button
                            onClick={() => setSelectedServer('server1')}
                            className={`px-2.5 py-1 rounded-md transition ${selectedServer === 'server1' ? 'bg-amber-500 text-black font-bold' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                          >
                            სერვერი 1 (HD)
                          </button>
                          <button
                            onClick={() => setSelectedServer('server2')}
                            className={`px-2.5 py-1 rounded-md transition ${selectedServer === 'server2' ? 'bg-amber-500 text-black font-bold' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                          >
                            სერვერი 2
                          </button>
                          <button
                            onClick={() => setSelectedServer('server3')}
                            className={`px-2.5 py-1 rounded-md transition ${selectedServer === 'server3' ? 'bg-amber-500 text-black font-bold' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                          >
                            სერვერი 3
                          </button>
                          <button
                            onClick={() => setSelectedServer('trailer')}
                            className={`px-2.5 py-1 rounded-md transition ${selectedServer === 'trailer' ? 'bg-amber-500 text-black font-bold' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                          >
                            🎬 თრეილერი
                          </button>
                        </div>

                        {/* Player Frame */}
                        <div className="aspect-video w-full rounded-xl overflow-hidden border border-amber-500/40 bg-black">
                          <iframe
                            key={selectedServer}
                            src={getActiveStreamUrl(msg.movie)}
                            className="w-full h-full"
                            allowFullScreen
                            allow="autoplay; encrypted-media; picture-in-picture"`n                          sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"`n                          referrerPolicy="no-referrer"
                          ></iframe>
                        </div>
                      </div>
                    )}

                    {/* Meta Links */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                      {msg.movie.streamingPlatforms && (
                        <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-gray-300">
                          📺 {msg.movie.streamingPlatforms.join(', ')}
                        </div>
                      )}
                      {msg.movie.soundtrack && (
                        <a
                          href={msg.movie.soundtrackUrl || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg bg-white/5 border border-white/5 text-amber-300 hover:underline truncate block"
                        >
                          🎵 {msg.movie.soundtrack}
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <span className="text-[10px] text-gray-500 mt-1 px-1">{msg.time}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-gray-400 text-xs italic">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></div>
            VIP AI ფიქრობს...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-6 py-2 border-t border-white/5 bg-[#121212]/50">
        <div className="flex items-center gap-2 overflow-x-auto text-xs py-1 scrollbar-none">
          <span className="text-amber-400/80 text-[11px] font-medium shrink-0">⚡ სწრაფი იდეები:</span>
          {quickIdeas.map((idea, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(idea)}
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-amber-500/20 text-gray-300 hover:text-amber-300 border border-white/10 hover:border-amber-500/40 shrink-0 transition"
            >
              {idea}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-white/10 bg-[#121212]">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-3 bg-[#1a1a1d] border border-white/10 rounded-2xl px-4 py-2.5 focus-within:border-amber-500/50 transition"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="ესაუბრე AI-ს... (მაგ: მინდა ვუყურო Gladiator, The Matrix, ან უბრალოდ გამარჯობა)"
            className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder-gray-500"
          />
          <button type="button" className="p-2 text-gray-400 hover:text-white transition">
            🎙
          </button>
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold rounded-xl disabled:opacity-40 transition"
          >
            ➔
          </button>
        </form>
      </div>
    </div>
  );
}