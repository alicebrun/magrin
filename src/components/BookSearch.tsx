"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useRef } from "react";
/* eslint-disable @next/next/no-img-element */
import type { Book } from "./Bookshelf";

interface BookSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBook: (book: Book) => void;
}

interface GoogleBookResult {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    pageCount?: number;
    publishedDate?: string;
  };
}

export default function BookSearch({ isOpen, onClose, onAddBook }: BookSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GoogleBookResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchBooks = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=8&langRestrict=fr`
      );
      const data = await res.json();
      setResults(data.items || []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, []);

  // Debounced search
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleChange = (value: string) => {
    setQuery(value);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => searchBooks(value), 400);
  };

  const handleAdd = (result: GoogleBookResult) => {
    const cover =
      result.volumeInfo.imageLinks?.thumbnail?.replace("http://", "https://") ||
      result.volumeInfo.imageLinks?.smallThumbnail?.replace("http://", "https://") ||
      "";

    const book: Book = {
      id: result.id,
      title: result.volumeInfo.title,
      author: result.volumeInfo.authors?.join(", ") || "Auteur inconnu",
      cover,
      totalPages: result.volumeInfo.pageCount,
      addedAt: new Date().toISOString(),
    };

    onAddBook(book);
    setQuery("");
    setResults([]);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-night/80 backdrop-blur-sm" onClick={onClose} />

          {/* Search panel */}
          <motion.div
            className="relative z-10 w-full max-w-md bg-night-light border border-cream/10 rounded-t-2xl sm:rounded-2xl p-5 max-h-[80vh] flex flex-col"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
          >
            {/* Handle bar (mobile) */}
            <div className="w-10 h-1 bg-cream/20 rounded-full mx-auto mb-4 sm:hidden" />

            <h2 className="text-cream font-medium text-lg mb-3">Ajouter un livre</h2>

            {/* Search input */}
            <div className="relative mb-4">
              <input
                type="text"
                value={query}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Chercher un titre, un auteur..."
                className="w-full bg-night border border-cream/10 rounded-lg px-4 py-3 text-cream placeholder:text-cream/30 text-sm focus:outline-none focus:border-warm/40 transition-colors"
                autoFocus
              />
              {loading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <motion.div
                    className="w-4 h-4 border-2 border-warm/40 border-t-warm rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              )}
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto hide-scrollbar space-y-2">
              {results.map((result) => {
                const cover =
                  result.volumeInfo.imageLinks?.thumbnail?.replace("http://", "https://") || "";

                return (
                  <motion.button
                    key={result.id}
                    className="w-full flex gap-3 p-3 rounded-lg hover:bg-cream/5 transition-colors text-left cursor-pointer"
                    onClick={() => handleAdd(result)}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Cover thumbnail */}
                    <div className="w-10 h-14 rounded-sm overflow-hidden bg-night flex-shrink-0 shadow-md">
                      {cover ? (
                        <img
                          src={cover}
                          alt={result.volumeInfo.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-coral/30 flex items-center justify-center">
                          <span className="text-[8px] text-cream/50">📕</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-cream text-sm font-medium truncate">
                        {result.volumeInfo.title}
                      </p>
                      <p className="text-cream/40 text-xs truncate">
                        {result.volumeInfo.authors?.join(", ") || "Auteur inconnu"}
                      </p>
                      {result.volumeInfo.pageCount && (
                        <p className="text-cream/25 text-[10px] mt-0.5">
                          {result.volumeInfo.pageCount} pages
                        </p>
                      )}
                    </div>

                    {/* Add indicator */}
                    <div className="flex-shrink-0 self-center text-warm/50 text-lg">+</div>
                  </motion.button>
                );
              })}

              {query.length >= 2 && results.length === 0 && !loading && (
                <p className="text-center text-cream/30 text-sm py-8">
                  Aucun résultat pour &quot;{query}&quot;
                </p>
              )}

              {query.length < 2 && (
                <div className="text-center text-cream/20 text-sm py-8">
                  <p className="text-2xl mb-2">📚</p>
                  <p>Cherche un livre à ajouter à ton étagère</p>
                </div>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="mt-4 w-full py-2.5 rounded-lg bg-cream/5 text-cream/50 text-sm hover:bg-cream/10 transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
