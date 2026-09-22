"use client";

import { useState } from "react";
import Link from "next/link";
import { Crown, Sparkles, Film, Music, BookOpen, Bot, ShieldCheck, ArrowRight, UserCheck, Play, Star, ChevronRight } from "lucide-react";
import AuthModal from "./components/AuthModal";

export default function Home() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#08080a] text-amber-100/90 font-sans relative overflow-x-hidden select-none">
      
      {/* Ambient Glowing Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50rem] h-[30rem] bg-gradient-to-b from-amber-500/15 via-emerald-950/20 to-transparent rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-[35rem] h-[35rem] bg-emerald-600/10 rounded-full blur-[180px] pointer-events-none" />

      {/* 👑 VIP Header */}
      <header className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between border-b border-amber-500/20 relative z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-emerald-500 rounded-2xl blur opacity-40 group-hover:opacity-80 transition duration-500" />
            <div className="relative w-12 h-12 bg-black rounded-2xl border border-amber-500/50 p-1 flex items-center justify-center shadow-2xl">
              <img src="/4410.jpg" alt="StreamCrafters VIP" className="w-full h-full object-contain rounded-xl" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
                StreamCrafters
              </h1>
              <span className="px-2 py-0.5 text-[9px] font-black bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 rounded-full tracking-widest uppercase flex items-center gap-1 shadow-inner">
                <Crown className="w-2.5 h-2.5 text-amber-400" /> VIP
              </span>
            </div>
            <p className="text-[10px] text-amber-200/50 font-medium">Luxury AI Cinema Experience</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAuthOpen(true)}
            className="px-4 py-2 bg-black/60 hover:bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-xs font-semibold flex items-center gap-2 transition"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-400" /> VIP შესვლა
          </button>

          <Link
            href="/chat"
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-95"
          >
            <Bot className="w-4 h-4 fill-black" />
            AI ჩატი
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* 🚀 Hero Section */}
      <section className="max-w-4xl mx-auto px-4 pt-16 pb-20 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-950/80 to-emerald-950/80 border border-amber-500/30 text-amber-300 text-xs font-bold mb-6 shadow-xl backdrop-blur-xl">
          <Crown className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>3-Agent VIP AI Architecture • Powered by Gemini</span>
        </div>

        <h1 className="text-3xl md:text-6xl font-black tracking-tight leading-tight mb-6 bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
          აღმოაჩინე კინემატოგრაფიის ახალი, ექსკლუზიური ეპოქა
        </h1>

        <p className="text-sm md:text-lg text-amber-200/70 max-w-2xl mx-auto mb-10 leading-relaxed">
          StreamCrafters AI — შენი პერსონალური კინო-კონსიერჟი. შეარჩიე იდეალური ფილმი, საუნდტრეკი და წიგნი შენი განწყობის მიხედვით.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/chat"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-sm rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-amber-500/30 active:scale-95 transition"
          >
            <Sparkles className="w-5 h-5 fill-black" />
            გამოცადე VIP AI ჩატი
            <ChevronRight className="w-4 h-4" />
          </Link>

          <button
            onClick={() => setIsAuthOpen(true)}
            className="w-full sm:w-auto px-8 py-4 bg-black/80 hover:bg-amber-500/10 border border-amber-500/40 text-amber-200 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 backdrop-blur-xl transition active:scale-95 shadow-xl"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            VIP წევრობის მიღება
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left pt-6 border-t border-amber-500/20">
          <div className="p-5 bg-black/60 border border-amber-500/20 rounded-3xl backdrop-blur-xl hover:border-amber-500/40 transition group">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400 group-hover:scale-110 transition">
              <Film className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-amber-200 text-sm mb-1">3-Agent AI Match</h3>
            <p className="text-amber-200/50 text-xs leading-relaxed">ზუსტი კინო-ანალიზი და პერსონალიზებული მედია-პაკეტების შერჩევა.</p>
          </div>

          <div className="p-5 bg-black/60 border border-amber-500/20 rounded-3xl backdrop-blur-xl hover:border-amber-500/40 transition group">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400 group-hover:scale-110 transition">
              <Music className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-amber-200 text-sm mb-1">Soundtracks & Books</h3>
            <p className="text-amber-200/50 text-xs leading-relaxed">ფილმთან ერთად საუნდტრეკებისა და წიგნების ინტეგრირებული რეკომენდაციები.</p>
          </div>

          <div className="p-5 bg-black/60 border border-amber-500/20 rounded-3xl backdrop-blur-xl hover:border-amber-500/40 transition group">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400 group-hover:scale-110 transition">
              <Star className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-amber-200 text-sm mb-1">Trailers & Watchlist</h3>
            <p className="text-amber-200/50 text-xs leading-relaxed">YouTube თრეილერების ნახვა და პირადი კოლექციის შენახვა მარტივად.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-amber-500/15 py-8 text-center text-xs text-amber-200/40 relative z-10">
        <p>© 2026 StreamCrafters VIP. All rights reserved.</p>
      </footer>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
