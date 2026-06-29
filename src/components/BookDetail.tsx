"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
/* eslint-disable @next/next/no-img-element */
import type { Book, BookStatus, PublicBookEntry } from "./Bookshelf";

interface BookDetailProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (book: Book) => void;
  onRemove: (bookId: string) => void;
  ticketColor?: string;
}

const statusOptions: { value: BookStatus; label: string }[] = [
  { value: "to-read", label: "À lire" },
  { value: "reading", label: "En cours" },
  { value: "read", label: "Lu" },
];

export default function BookDetail({
  book,
  isOpen,
  onClose,
  onUpdate,
  onRemove,
}: BookDetailProps) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [status, setStatus] = useState<BookStatus>("to-read");
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (book && isOpen) {
      setRating(book.rating || 0);
      setReview(book.review || "");
      setStatus(book.status || "to-read");
      setShowRemoveConfirm(false);
      setShowPublishConfirm(false);
      setPublished(false);
    }
  }, [book, isOpen]);

  const handleSave = () => {
    if (!book) return;
    onUpdate({ ...book, rating, review, status });
    onClose();
  };

  const handleRemove = () => {
    if (!book) return;
    onRemove(book.id);
    setShowRemoveConfirm(false);
    onClose();
  };

  const handlePublish = () => {
    if (!book || !rating) return;
    const stored = localStorage.getItem("side-public-books");
    const publicBooks: PublicBookEntry[] = stored ? JSON.parse(stored) : [];
    const existing = publicBooks.find((b) => b.bookId === book.id);
    const newRating = { user: "Toi", rating, review: review || undefined, date: new Date().toISOString() };
    if (existing) {
      const idx = existing.ratings.findIndex((r) => r.user === "Toi");
      if (idx >= 0) existing.ratings[idx] = newRating;
      else existing.ratings.push(newRating);
    } else {
      publicBooks.push({ bookId: book.id, title: book.title, author: book.author, cover: book.cover, totalPages: book.totalPages, ratings: [newRating] });
    }
    localStorage.setItem("side-public-books", JSON.stringify(publicBooks));
    setPublished(true);
    setShowPublishConfirm(false);
  };

  return (
    <AnimatePresence>
      {isOpen && book && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-night/60 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            className="relative z-10 w-full max-w-[300px] flex flex-col items-center"
            initial={{ scale: 0.8, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 40 }}
            transition={{ type: "spring", damping: 20 }}
          >
            {/* Cover */}
            <div className="relative">
              <img
                src={book.cover}
                alt={book.title}
                className="w-40 h-auto rounded-md shadow-[4px_8px_30px_rgba(0,0,0,0.7)]"
              />
            </div>

            {/* Title & Author */}
            <h2 className="text-white text-lg mt-5 text-center leading-tight" style={{ fontFamily: "'Courier New', monospace" }}>{book.title}</h2>
            <p className="text-white/50 text-sm mt-1" style={{ fontFamily: "'Courier New', monospace" }}>{book.author}</p>

            {/* Status */}
            <div className="flex gap-4 mt-6">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatus(opt.value)}
                  className={`px-6 py-3 rounded-full text-base cursor-pointer transition-colors ${
                    status === opt.value
                      ? "bg-white text-night shadow-lg"
                      : "bg-white/20 text-white/80 hover:bg-white/30"
                  }`}
                  style={{ fontFamily: "'Courier New', monospace" }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Rating */}
            <div className="flex gap-5 mt-6">
              {Array.from({ length: 5 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setRating(i + 1)}
                  className="cursor-pointer text-3xl"
                >
                  <span className={i < rating ? "text-warm" : "text-white/25"}>★</span>
                </button>
              ))}
            </div>

            {/* Review */}
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Ton avis..."
              rows={2}
              className="mt-6 w-full bg-white/10 rounded-lg px-4 py-3 text-white text-base placeholder:text-white/30 focus:outline-none resize-none border border-white/20"
              style={{ fontFamily: "'Courier New', monospace" }}
            />

            {/* Actions */}
            <div className="flex gap-3 mt-6 w-full">
              <button
                onClick={handleSave}
                className="flex-1 py-3.5 rounded-lg bg-white text-night text-base cursor-pointer"
                style={{ fontFamily: "'Courier New', monospace" }}
              >
                Sauvegarder
              </button>
              <button
                onClick={() => setShowRemoveConfirm(true)}
                className="px-5 py-3.5 rounded-lg bg-red-500/20 text-red-300 text-base cursor-pointer border border-red-500/20"
                style={{ fontFamily: "'Courier New', monospace" }}
              >
                ✕
              </button>
            </div>

            {/* Remove confirmation */}
            <AnimatePresence>
              {showRemoveConfirm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 p-2 bg-red-500/10 rounded-lg text-center w-full"
                >
                  <p className="text-cream/40 text-[10px] mb-1.5">Retirer ce livre ?</p>
                  <div className="flex gap-2 justify-center">
                    <button onClick={handleRemove} className="px-3 py-1 bg-red-500 text-white text-[10px] rounded-md cursor-pointer">Oui</button>
                    <button onClick={() => setShowRemoveConfirm(false)} className="px-3 py-1 bg-cream/10 text-cream/40 text-[10px] rounded-md cursor-pointer">Non</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Publish */}
            <button
              onClick={() => { if (rating) setShowPublishConfirm(true); }}
              className={`mt-5 w-full py-3 rounded-lg border border-dashed text-base cursor-pointer ${
                published
                  ? "border-green-400/50 text-green-300"
                  : rating
                    ? "border-white/30 text-white/60 hover:text-white/80"
                    : "border-white/10 text-white/20 cursor-not-allowed"
              }`}
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              {published ? "✓ Publié" : rating ? "Publier dans la librairie publique" : "Note pour publier"}
            </button>

            <AnimatePresence>
              {showPublishConfirm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 p-2 bg-cream/5 rounded-lg text-center w-full border border-cream/10"
                >
                  <p className="text-cream/40 text-[10px] mb-1.5">Publier sur la librairie publique ?</p>
                  <div className="flex gap-2 justify-center">
                    <button onClick={handlePublish} className="px-3 py-1 bg-cream/80 text-night text-[10px] rounded-md cursor-pointer">Oui</button>
                    <button onClick={() => setShowPublishConfirm(false)} className="px-3 py-1 bg-cream/10 text-cream/40 text-[10px] rounded-md cursor-pointer">Non</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
