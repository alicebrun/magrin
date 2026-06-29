"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { use } from "react";

const friends: Record<string, { name: string; online: boolean }> = {
  "1": { name: "Léa", online: true },
  "2": { name: "Hugo", online: false },
  "3": { name: "Mia", online: true },
  "4": { name: "Tom", online: false },
  "5": { name: "Jade", online: true },
  "6": { name: "Alex", online: false },
  "8": { name: "Nina", online: false },
};

export default function VisitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const friend = friends[id];

  if (!friend) {
    return (
      <div className="min-h-screen bg-night flex items-center justify-center">
        <div className="text-center">
          <p className="text-cream/40 text-sm">Cet appart n&apos;existe pas</p>
          <Link href="/" className="text-warm text-sm mt-2 block">← Retour à l&apos;immeuble</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Room background — same as apartment but slightly different tint */}
      <div className="absolute top-0 left-0 right-0 h-[12%] bg-gradient-to-b from-[#E0D0BC] to-[#D8C8AE]">
        <div className="absolute bottom-0 left-0 right-0 h-[6px] bg-gradient-to-b from-[#C0AC90] to-[#CCB89C] shadow-sm" />
      </div>

      <div className="absolute top-[12%] left-0 right-0 bottom-[25%] bg-gradient-to-b from-[#D8C8AE] to-[#CCBA9C]">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)"
        }} />
      </div>

      <div className="absolute left-0 right-0 bottom-[25%] h-[8px] bg-gradient-to-b from-[#A89478] to-[#988468]" />

      <div className="absolute left-0 right-0 bottom-0 h-[25%] bg-gradient-to-b from-[#B8843A] to-[#A07030]">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(0,0,0,0.15) 60px, rgba(0,0,0,0.15) 61px)",
        }} />
        <div className="absolute top-0 left-0 right-0 h-[30%] bg-gradient-to-b from-white/8 to-transparent" />
      </div>

      {/* Door to go back */}
      <Link href="/">
        <motion.div
          className="absolute right-[12%] bottom-[12%] cursor-pointer group"
          whileHover={{ scale: 1.03 }}
        >
          <div className="relative w-16 h-28 sm:w-20 sm:h-36">
            <div className="absolute inset-0 bg-stone-300/40 rounded-t-sm" />
            <div className="absolute inset-[3px] bg-gradient-to-b from-amber-700 to-amber-800 rounded-t-sm">
              <div className="absolute top-[8%] left-[10%] right-[10%] h-[35%] border-2 border-amber-600/40 rounded-sm" />
              <div className="absolute top-[52%] left-[10%] right-[10%] h-[35%] border-2 border-amber-600/40 rounded-sm" />
              <div className="absolute top-1/2 right-[12%] w-2 h-3 bg-amber-400 rounded-full shadow-md" />
            </div>
          </div>
          <div className="text-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-cream/50 text-[10px] bg-night/60 px-2 py-0.5 rounded">← Sortir</span>
          </div>
        </motion.div>
      </Link>

      {/* Wall lamp */}
      <div className="absolute top-[18%] left-[8%]">
        <div className="w-[3px] h-8 bg-amber-700 mx-auto" />
        <motion.div
          animate={{ opacity: friend.online ? [0.7, 1, 0.7] : 0.3 }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className={`w-10 h-5 rounded-b-full mx-auto ${friend.online ? "bg-gradient-to-b from-amber-300/80 to-amber-400/60" : "bg-gradient-to-b from-amber-300/20 to-amber-400/15"}`} />
          {friend.online && <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-32 bg-amber-200/8 rounded-full blur-xl" />}
        </motion.div>
      </div>

      {/* Empty bookshelf placeholder */}
      <div className="absolute left-[10%] top-[35%]">
        <div className="w-20 h-28 sm:w-24 sm:h-32 bg-amber-800/20 border border-amber-700/20 rounded-sm flex items-center justify-center">
          <span className="text-2xl opacity-30">📚</span>
        </div>
        <p className="text-amber-800/25 text-[9px] text-center mt-1">{friend.name} n&apos;a pas encore de livres</p>
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/30 to-transparent">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/">
            <motion.button
              className="text-cream/60 hover:text-cream text-sm cursor-pointer"
              whileTap={{ scale: 0.95 }}
            >
              ← Immeuble
            </motion.button>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-cream font-medium text-sm drop-shadow-md">
              Chez {friend.name}
            </h1>
            {friend.online && (
              <motion.div
                className="w-2 h-2 rounded-full bg-green-400"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
          <div className="w-16" />
        </div>
      </div>

      {/* Center message */}
      <motion.div
        className="absolute top-[22%] left-1/2 -translate-x-1/2 text-center z-10 pointer-events-none"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-amber-800/30 text-sm">L&apos;appart de {friend.name}</p>
        <p className="text-amber-800/20 text-xs mt-1">
          {friend.online ? "En ligne en ce moment" : "Hors ligne"}
        </p>
      </motion.div>

      {/* Bottom nav */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/40 to-transparent">
        <div className="max-w-md mx-auto flex justify-around py-3 px-4">
          <Link href="/" className="flex flex-col items-center gap-0.5 text-cream/40 hover:text-cream/70 transition-colors">
            <span className="text-lg">🏢</span>
            <span className="text-[9px]">Immeuble</span>
          </Link>
          <Link href="/apartment" className="flex flex-col items-center gap-0.5 text-cream/40 hover:text-cream/70 transition-colors">
            <span className="text-lg">🏠</span>
            <span className="text-[9px]">Mon appart</span>
          </Link>
          <Link href="/street" className="flex flex-col items-center gap-0.5 text-cream/40 hover:text-cream/70 transition-colors">
            <span className="text-lg">🏘️</span>
            <span className="text-[9px]">La rue</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
