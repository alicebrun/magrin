"use client";

/* eslint-disable @next/next/no-img-element */
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import type { PublicBookEntry, PublicRating } from "@/components/Bookshelf";

const STORAGE_KEY = "side-public-books";

const shelfPositions = [
  { top: "2%", height: "16.5%" },
  { top: "20%", height: "16.5%" },
  { top: "38%", height: "16.5%" },
  { top: "56.5%", height: "16.5%" },
  { top: "75%", height: "16.5%" },
];

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "text-base" : "text-[10px]";
  return (
    <span className={`${cls} tracking-tight`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < Math.round(rating) ? "text-[#8B0000]" : "text-[#2A2000]/15"}>★</span>
      ))}
    </span>
  );
}

function BookOnShelf({ book, onClick, index }: { book: PublicBookEntry; onClick: () => void; index: number }) {
  const avgRating = book.ratings.reduce((s, r) => s + r.rating, 0) / book.ratings.length;
  return (
    <motion.div
      className="relative cursor-pointer group flex-shrink-0"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 300, damping: 20 }}
      whileHover={{ y: -6, rotate: -1, zIndex: 10 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <div className="relative w-[42px] h-[62px] sm:w-[50px] sm:h-[74px] rounded-[2px] overflow-hidden shadow-[2px_3px_8px_rgba(0,0,0,0.5)]">
        {book.cover ? (
          <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-amber-700 to-amber-900 flex items-center justify-center p-0.5">
            <span className="text-[6px] text-cream text-center leading-tight font-medium">{book.title}</span>
          </div>
        )}
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex gap-[2px]">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={`block w-1 h-1 rounded-full ${i < Math.round(avgRating) ? "bg-amber-400" : "bg-white/15"}`} />
        ))}
      </div>
      {book.ratings.length > 1 && (
        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#8B0000] flex items-center justify-center">
          <span className="text-[7px] text-cream font-bold">{book.ratings.length}</span>
        </div>
      )}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
        <div className="bg-black/80 backdrop-blur-sm rounded px-2 py-1 whitespace-nowrap">
          <p className="text-[8px] text-white font-medium">{book.title}</p>
          <p className="text-[7px] text-white/50">{book.author}</p>
          <p className="text-[7px] text-amber-400/70">{book.ratings.length} avis</p>
        </div>
      </div>
    </motion.div>
  );
}

function BookPublicDetail({ book, onClose }: { book: PublicBookEntry; onClose: () => void }) {
  const avgRating = book.ratings.reduce((s, r) => s + r.rating, 0) / book.ratings.length;
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-night/90 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative z-10 w-full max-w-[320px]" initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }} transition={{ type: "spring", damping: 20 }}>
        <div className="bg-[#E8C840] rounded-lg overflow-hidden shadow-[4px_6px_20px_rgba(0,0,0,0.5)]">
          <div className="pt-5 px-4 pb-4">
            <div className="float-right ml-3 mb-2">
              <div className="w-16 h-24 rounded-sm overflow-hidden shadow-md border border-[#C4A830]/50">
                {book.cover ? (
                  <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-amber-700 flex items-center justify-center"><span className="text-xl">📕</span></div>
                )}
              </div>
            </div>
            <div className="border-b border-[#2A2000]/40 pb-1 mb-1">
              <p className="text-[#2A2000] text-sm font-bold leading-tight font-serif">{book.title}</p>
              <p className="text-[#2A2000]/60 text-xs font-serif">{book.author}</p>
            </div>
            <div className="flex items-center gap-2 mt-2 mb-3">
              <StarRating rating={avgRating} size="md" />
              <span className="text-[#2A2000]/50 text-xs font-mono">{avgRating.toFixed(1)} / 5</span>
              <span className="text-[#2A2000]/30 text-[10px]">({book.ratings.length} avis)</span>
            </div>
            <div className="border-t-2 border-b border-[#2A2000]/30 h-1 my-2" />
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {book.ratings.map((r: PublicRating, i: number) => (
                <div key={i} className="p-2 bg-[#2A2000]/5 rounded">
                  <div className="flex items-center justify-between">
                    <span className="text-[#2A2000]/70 text-xs font-medium">{r.user}</span>
                    <StarRating rating={r.rating} />
                  </div>
                  {r.review && <p className="text-[#2A2000]/50 text-[11px] mt-1 font-serif italic">{r.review}</p>}
                  <p className="text-[#2A2000]/25 text-[9px] mt-1 font-mono">{new Date(r.date).toLocaleDateString("fr-FR")}</p>
                </div>
              ))}
            </div>
            <motion.button onClick={onClose} className="w-full mt-3 py-2 rounded-md bg-[#2A2000] text-[#E8C840] text-xs font-medium cursor-pointer font-mono" whileTap={{ scale: 0.95 }}>
              Fermer
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function BookstorePage() {
  const [books, setBooks] = useState<PublicBookEntry[]>([]);
  const [selectedBook, setSelectedBook] = useState<PublicBookEntry | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setBooks(JSON.parse(stored));
  }, []);

  if (!mounted) return null;

  const sorted = [...books].sort((a, b) => {
    const lastA = a.ratings[a.ratings.length - 1]?.date || "";
    const lastB = b.ratings[b.ratings.length - 1]?.date || "";
    return lastB.localeCompare(lastA);
  });

  const rows: PublicBookEntry[][] = [];
  for (let i = 0; i < sorted.length; i += 5) {
    rows.push(sorted.slice(i, i + 5));
  }

  return (
    <div className="fixed inset-0 bg-night">
      <div className="absolute top-4 left-4 z-30">
        <Link href="/" className="text-cream/40 hover:text-cream transition-colors text-sm">←</Link>
      </div>

      <div className="relative w-full h-full overflow-hidden">
        <img src="/assets/shelf-public.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/5" />

        {sorted.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <p className="text-cream/40 text-sm font-serif">La librairie est vide</p>
            <p className="text-cream/25 text-[10px] max-w-[180px] text-center">Les livres publiés par la communauté apparaîtront ici</p>
          </div>
        ) : (
          <>
            {shelfPositions.map((pos, shelfIndex) => {
              const shelfBooks = rows[shelfIndex] || [];
              return (
                <div
                  key={shelfIndex}
                  className="absolute left-0 right-0 flex items-end justify-center gap-1 sm:gap-1.5 px-[12%]"
                  style={{ top: pos.top, height: pos.height, paddingBottom: "1%" }}
                >
                  {shelfBooks.map((book, i) => (
                    <BookOnShelf key={book.bookId} book={book} onClick={() => setSelectedBook(book)} index={shelfIndex * 5 + i} />
                  ))}
                </div>
              );
            })}
          </>
        )}
      </div>

      <AnimatePresence>
        {selectedBook && <BookPublicDetail book={selectedBook} onClose={() => setSelectedBook(null)} />}
      </AnimatePresence>
    </div>
  );
}
