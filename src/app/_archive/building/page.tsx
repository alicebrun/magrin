"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Friends data — 4 floors × 3 windows = 12
const friends = [
  { id: 1, name: "Léa", online: true, floor: 4, col: 0 },
  { id: 2, name: "Hugo", online: false, floor: 4, col: 1 },
  { id: 3, name: "Mia", online: true, floor: 4, col: 2 },
  { id: 4, name: "Tom", online: false, floor: 3, col: 0 },
  { id: 5, name: "Jade", online: true, floor: 3, col: 1 },
  { id: 6, name: "Alex", online: false, floor: 3, col: 2 },
  { id: 7, name: "Toi", online: true, floor: 2, col: 0, isYou: true },
  { id: 8, name: "Nina", online: false, floor: 2, col: 1 },
  { id: 9, name: "Sacha", online: true, floor: 2, col: 2 },
  { id: 10, name: "Lou", online: false, floor: 1, col: 0 },
  { id: 11, name: "Elio", online: true, floor: 1, col: 1 },
  { id: 12, name: "Zoé", online: false, floor: 1, col: 2 },
];

type Friend = (typeof friends)[0];

// Stars — fixed background
function Stars() {
  const [stars, setStars] = useState<
    { id: number; x: number; y: number; size: number; dur: number }[]
  >([]);
  useEffect(() => {
    setStars(
      Array.from({ length: 80 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        dur: Math.random() * 4 + 2,
      }))
    );
  }, []);
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white star"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            "--duration": `${s.dur}s`,
            "--delay": `${Math.random() * 3}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// A single window
function WindowUnit({
  friend,
  onSelect,
  isSelected,
}: {
  friend: Friend;
  onSelect: () => void;
  isSelected: boolean;
}) {
  const lit = friend.online;

  // Vary window light color based on friend id
  const lightStyles = [
    { bg: "linear-gradient(180deg, #ffb088 0%, #f5743d 60%, #e0602a 100%)", shadow: "rgba(255,155,106,0.25)", glow: "rgba(255,155,106,0.1)" },
    { bg: "linear-gradient(180deg, #ffd4a8 0%, #e8a050 60%, #d08530 100%)", shadow: "rgba(232,160,80,0.25)", glow: "rgba(232,160,80,0.1)" },
    { bg: "linear-gradient(180deg, #a5c7ff 0%, #5d8aff 60%, #3a6ae0 100%)", shadow: "rgba(93,138,255,0.2)", glow: "rgba(93,138,255,0.08)" },
    { bg: "linear-gradient(180deg, #ffe8c0 0%, #f0c070 60%, #d4a048 100%)", shadow: "rgba(240,192,112,0.25)", glow: "rgba(240,192,112,0.1)" },
    { bg: "linear-gradient(180deg, #c8b8ff 0%, #8070d0 60%, #6050b0 100%)", shadow: "rgba(128,112,208,0.2)", glow: "rgba(128,112,208,0.08)" },
  ];
  const style = lightStyles[friend.id % lightStyles.length];

  return (
    <motion.button
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      className="relative flex flex-col items-center cursor-pointer group"
      whileTap={{ scale: 0.96 }}
    >
      {/* Glow bloom behind window */}
      {lit && (
        <div
          className="absolute inset-0 rounded-sm blur-md opacity-25 z-0"
          style={{ background: style.bg, transform: "scale(1.15)" }}
        />
      )}

      {/* Window frame */}
      <div
        className={`relative w-20 h-28 sm:w-24 sm:h-32 border-2 overflow-hidden transition-all duration-700 z-10
          ${lit
            ? "border-[#1a1230]"
            : "border-[#0e0b20] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]"
          }
        `}
        style={{
          background: lit ? style.bg : "#030208",
          boxShadow: lit
            ? `0 0 25px ${style.shadow}, 0 0 60px ${style.glow}, inset 0 0 15px ${style.glow}`
            : undefined,
        }}
      >
        {/* Curtains */}
        {lit && (
          <>
            <div className="absolute top-0 left-0 w-[35%] h-full bg-black/20 blur-[2px] -rotate-2 origin-top-left" />
            <div className="absolute top-0 right-0 w-[35%] h-full bg-black/20 blur-[2px] rotate-2 origin-top-right" />
          </>
        )}

        {/* Silhouette */}
        {lit && (
          <div
            className="absolute bottom-0 w-[30%] h-[40%] bg-black/40 blur-[2px] rounded-t-full"
            style={{ left: `${25 + (friend.id % 3) * 15}%` }}
          />
        )}

        {/* Mullions (pane dividers) */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-black/40 z-10" />
        <div className="absolute top-[35%] left-0 right-0 h-[2px] bg-black/40 z-10" />

      </div>

      {/* Balcony railing */}
      <div className="relative w-[110%] h-4 mt-[-2px]">
        <div className="absolute inset-0 border-t-2 border-l border-r border-[#0e0b20]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, transparent, transparent 5px, #0a081a 5px, #0a081a 7px)",
            }}
          />
        </div>
      </div>

      {/* Light spill below window */}
      {lit && (
        <div
          className="absolute -bottom-2 left-[0%] right-[0%] h-4 rounded-full blur-lg opacity-20"
          style={{ background: style.bg }}
        />
      )}

      {/* Name — always visible for lit windows, like a small nameplate */}
      {friend.name && (
        <div
          className={`mt-1.5 px-2 py-[2px] rounded-sm text-[9px] sm:text-[10px] font-medium tracking-wide transition-all duration-500 text-center
            ${lit
              ? "opacity-90 text-[#ffb088]/80 bg-black/30 backdrop-blur-sm border border-white/[0.04]"
              : "opacity-0 group-hover:opacity-40 text-white/30"
            }
          `}
          style={lit ? {
            textShadow: `0 0 8px ${style.shadow}`,
          } : undefined}
        >
          {friend.name}
        </div>
      )}

      {/* "chez toi" badge */}
      {friend.isYou && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] text-[#ffb088]/60 whitespace-nowrap">
          chez toi ↓
        </div>
      )}
    </motion.button>
  );
}

// A single floor section
function Floor({
  floorNum,
  floorFriends,
  selectedFriend,
  onSelect,
  hasPediment,
}: {
  floorNum: number;
  floorFriends: Friend[];
  selectedFriend: Friend | null;
  onSelect: (f: Friend) => void;
  hasPediment: boolean;
}) {
  return (
    <div className="relative">
      {/* Floor content */}
      <div className="flex justify-center items-end gap-3 sm:gap-8 py-10 sm:py-14 px-3 sm:px-6">
        {floorFriends.map((friend) => (
          <WindowUnit
            key={friend.id}
            friend={friend}
            isSelected={selectedFriend?.id === friend.id}
            onSelect={() => onSelect(friend)}
          />
        ))}
      </div>

      {/* Cornice / floor separator */}
      <div className="relative h-3 bg-[#0e0b20] shadow-[0_4px_15px_rgba(0,0,0,0.7)]">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/[0.03]" />
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/[0.03]" />
      </div>
    </div>
  );
}

// Splash screen
function SplashScreen({ onDone }: { onDone: () => void }) {
  const [text, setText] = useState("");
  const [fading, setFading] = useState(false);
  const fullText = "Connexion au quartier...";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) {
        clearInterval(interval);
        setTimeout(() => setFading(true), 400);
        setTimeout(onDone, 900);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#0d0b21] flex flex-col items-center justify-center gap-6 transition-opacity duration-500 ${fading ? "opacity-0" : "opacity-100"}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <div className="relative animate-[fadeInUp_0.6s_ease-out_0.2s_both]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/retro-computer.jpg"
          alt=""
          className="w-48 h-48 sm:w-56 sm:h-56 object-contain drop-shadow-[0_0_30px_rgba(255,207,86,0.15)] mix-blend-lighten rounded-lg"
        />
        <div className="absolute top-[10%] left-[20%] w-[55%] h-[45%] bg-sky/10 rounded blur-xl animate-pulse" />
      </div>
      <h1 className="text-[#ffb088] font-bold text-3xl tracking-[0.4em] drop-shadow-[0_0_15px_rgba(255,155,106,0.4)] animate-[fadeIn_0.5s_ease-out_0.5s_both]">
        SIDE
      </h1>
      <p className="text-white/30 text-xs font-mono animate-[fadeIn_0.5s_ease-out_0.8s_both]">
        {text}
        <span className="animate-pulse">_</span>
      </p>
    </div>
  );
}

export default function Home() {
  const [showSplash, setShowSplash] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleWindowClick = (friend: Friend) => {
    if (friend.isYou) {
      router.push("/apartment");
    } else if (friend.online) {
      router.push(`/visit/${friend.id}`);
    } else {
      setSelectedFriend(friend);
    }
  };

  useEffect(() => {
    setMounted(true);
    setShowSplash(true);
  }, []);

  const floors = [4, 3, 2, 1];

  return (
    <div
      ref={scrollRef}
      className="fixed inset-0 bg-gradient-to-b from-[#0d0b21] to-[#1a1645] overflow-y-auto overflow-x-hidden flex flex-col items-center"
      onClick={() => setSelectedFriend(null)}
    >
      {/* Splash */}
      <AnimatePresence>
        {mounted && showSplash && (
          <SplashScreen onDone={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      <Stars />

      {/* Vignette */}
      <div className="fixed inset-0 pointer-events-none z-10 bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.6)_100%)]" />

      {/* Spacer for sky */}
      <div className="h-16" />

      {/* Building body — centered, repeating floors for infinite scroll */}
      <div
        className="relative z-20 mx-auto border-l-[6px] border-r-[6px] border-[#1a1535] bg-[#12102a] shadow-[0_40px_100px_rgba(0,0,0,0.9)]"
        style={{ width: "min(85vw, 420px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Roof cap */}
        <div className="h-3 bg-[#100d25] rounded-t-md border-t border-white/[0.04]" />

        {/* Real floors (with actual friends) */}
        {floors.map((floorNum, i) => {
          const floorFriends = friends.filter((f) => f.floor === floorNum);
          return (
            <Floor
              key={floorNum}
              floorNum={floorNum}
              floorFriends={floorFriends}
              selectedFriend={selectedFriend}
              onSelect={handleWindowClick}
              hasPediment={i % 2 === 0}
            />
          );
        })}

        {/* Extra repeating floors for scrollability (decorative, no friends) */}
        {Array.from({ length: 8 }, (_, i) => {
          // Generate decorative floors with random online/offline pattern
          const decoFriends: Friend[] = [0, 1, 2].map((col) => ({
            id: 100 + i * 3 + col,
            name: "",
            online: [true, false, true, false, true, true, false, true][
              (i + col) % 8
            ],
            floor: -(i + 1),
            col,
          }));
          return (
            <Floor
              key={`deco-${i}`}
              floorNum={-(i + 1)}
              floorFriends={decoFriends}
              selectedFriend={null}
              onSelect={() => {}}
              hasPediment={i % 2 === 0}
            />
          );
        })}
      </div>

      {/* Friend tooltip */}
      <AnimatePresence>
        {selectedFriend && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 bg-black/70 backdrop-blur-md border border-white/10 rounded-xl p-4 min-w-[180px]"
            onClick={(e) => e.stopPropagation()}
          >
            <p
              className={`font-medium text-sm ${selectedFriend.online ? "text-[#ffb088]" : "text-white/40"}`}
            >
              {selectedFriend.name}
            </p>
            <p className="text-white/25 text-[10px] mt-0.5">
              {selectedFriend.online ? "En ligne" : "Hors ligne"}
            </p>
            {selectedFriend.online && (
              <Link
                href={
                  selectedFriend.isYou
                    ? "/apartment"
                    : `/visit/${selectedFriend.id}`
                }
                className="block mt-2 text-xs text-[#ffb088]/70 hover:text-[#ffb088] transition-colors"
              >
                {selectedFriend.isYou
                  ? "→ Entrer chez toi"
                  : "→ Visiter l'appart"}
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back to street */}
      <div className="fixed top-4 left-4 z-30">
        <Link href="/">
          <motion.div
            className="px-3 py-2 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-cream/40 hover:text-cream text-xs cursor-pointer transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            ← La rue
          </motion.div>
        </Link>
      </div>

      {/* Bottom spacing for nav */}
      <div className="h-24" />
    </div>
  );
}
