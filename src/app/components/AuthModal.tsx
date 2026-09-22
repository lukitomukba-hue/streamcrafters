"use client";

import { useState } from "react";
import { X, Mail, Lock, User, Crown, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(isRegister ? "VIP რეგისტრაცია წარმატებით დასრულდა! კეთილი იყოს თქვენი მობრძანება." : "VIP ავტორიზაცია წარმატებულია!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[#0a0a0c] border border-amber-500/40 rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl shadow-amber-500/10 relative overflow-hidden">
        
        {/* Luxury Background Ambient Glows */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition active:scale-95 z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header / Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-emerald-500 rounded-2xl blur opacity-40 group-hover:opacity-80 transition duration-500" />
            <div className="relative w-16 h-16 bg-black rounded-2xl border border-amber-500/50 p-1.5 flex items-center justify-center shadow-2xl">
              <img src="/4410.jpg" alt="StreamCrafters VIP" className="w-full h-full object-contain rounded-xl" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-black bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full uppercase tracking-widest mb-2 shadow-inner">
            <Crown className="w-3 h-3 text-amber-400" /> StreamCrafters VIP Access
          </div>

          <h2 className="text-xl font-black bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
            {isRegister ? "VIP ანგარიშის შექმნა" : "VIP ლოჟაში შესვლა"}
          </h2>
          <p className="text-amber-200/50 text-xs mt-1">
            {isRegister ? "მიიღეთ ექსკლუზიური წვდომა AI კინო-კონსიერჟზე" : "გააგრძელეთ პრემიუმ კინო-გამოცდილება"}
          </p>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-[11px] font-bold text-amber-200/70 mb-1">სრული სახელი</label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-amber-400 absolute left-3.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="მაგ: გიორგი ბერიძე"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/70 border border-amber-500/30 rounded-xl focus:outline-none focus:border-amber-400 text-xs text-amber-100 placeholder:text-amber-200/30 transition shadow-inner"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-amber-200/70 mb-1">ელ. ფოსტა</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-amber-400 absolute left-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vip@streamcrafters.ge"
                className="w-full pl-10 pr-4 py-2.5 bg-black/70 border border-amber-500/30 rounded-xl focus:outline-none focus:border-amber-400 text-xs text-amber-100 placeholder:text-amber-200/30 transition shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-amber-200/70 mb-1">პაროლი</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-amber-400 absolute left-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-black/70 border border-amber-500/30 rounded-xl focus:outline-none focus:border-amber-400 text-xs text-amber-100 placeholder:text-amber-200/30 transition shadow-inner"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/20 active:scale-95 mt-2"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            {isRegister ? "რეგისტრაციის დასრულება" : "შესვლა VIP ლოჟაში"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Features Badge */}
        <div className="mt-5 p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-[10px] text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>256-Bit დაშიფრული უსაფრთხოება და პრიორიტეტული AI წვდომა.</span>
        </div>

        {/* Toggle Register / Login */}
        <div className="mt-5 pt-3 border-t border-amber-500/15 text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-amber-200/70 hover:text-amber-300 font-semibold transition"
          >
            {isRegister ? (
              <>უკვე გაქვთ VIP ანგარიში? <span className="text-amber-400 font-extrabold underline underline-offset-4">შესვლა</span></>
            ) : (
              <>არ გაქვთ VIP ანგარიში? <span className="text-amber-400 font-extrabold underline underline-offset-4">რეგისტრაცია</span></>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
