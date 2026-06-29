"use client";

/* eslint-disable @next/next/no-img-element */
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import Bookshelf, { type Book, type TicketColor } from "@/components/Bookshelf";
import BookDetail from "@/components/BookDetail";

interface GoogleBookResult {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    imageLinks?: { thumbnail?: string };
    pageCount?: number;
  };
}

const demoBooks: Book[] = [
  {
    id: "demo-1",
    title: "L'Étranger",
    author: "Albert Camus",
    cover: "https://books.google.com/books/content?id=dUBqAAAAMAAJ&printsec=frontcover&img=1&zoom=1",
    rating: 5,
    totalPages: 185,
    status: "read",
  },
  {
    id: "demo-2",
    title: "Atomic Habits",
    author: "James Clear",
    cover: "https://books.google.com/books/content?id=lFhbDwAAQBAJ&printsec=frontcover&img=1&zoom=1",
    rating: 4,
    totalPages: 306,
    status: "reading",
  },
];

const STORAGE_KEY = "side-books";
const TICKET_COLOR_KEY = "side-ticket-color";

const ticketImages: Record<TicketColor, string> = {
  yellow: "/assets/ticket-yellow.png",
  pink: "/assets/ticket-pink.png",
};

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [ticketColor, setTicketColor] = useState<TicketColor>("yellow");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GoogleBookResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [borrowerName, setBorrowerName] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setBooks(JSON.parse(saved));
    } else {
      setBooks(demoBooks);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoBooks));
    }
    const savedColor = localStorage.getItem(TICKET_COLOR_KEY) as TicketColor | null;
    if (savedColor) setTicketColor(savedColor);
    const savedName = localStorage.getItem("side-borrower-name");
    if (savedName) setBorrowerName(savedName);
  }, []);

  // Google Books search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=6&langRestrict=fr`);
        const data = await res.json();
        setSearchResults(data.items || []);
      } catch {
        setSearchResults([]);
      }
      setSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const saveBooks = (newBooks: Book[]) => {
    setBooks(newBooks);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newBooks));
  };

  const toggleTicketColor = () => {
    const next: TicketColor = ticketColor === "yellow" ? "pink" : "yellow";
    setTicketColor(next);
    localStorage.setItem(TICKET_COLOR_KEY, next);
  };

  const handleAddBook = (book: Book) => {
    if (books.some((b) => b.id === book.id)) return;
    saveBooks([...books, { ...book, status: "to-read" }]);
  };

  const handleUpdateBook = (updatedBook: Book) => {
    saveBooks(books.map((b) => (b.id === updatedBook.id ? updatedBook : b)));
  };

  const handleRemoveBook = (bookId: string) => {
    saveBooks(books.filter((b) => b.id !== bookId));
  };

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setDetailOpen(true);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-night">
      {/* Back arrow */}
      <div className="absolute top-4 left-4 z-30">
        <Link href="/apartment" className="text-cream/40 hover:text-cream transition-colors text-sm">
          ←
        </Link>
      </div>

      {/* Bookshelf — full screen with book covers */}
      <div className="flex-1 overflow-hidden">
        <Bookshelf
          books={books}
          onBookClick={handleBookClick}
        />
      </div>

      {/* Library ticket button — bottom right */}
      <div className="absolute bottom-28 right-4 z-30">
        <motion.button
          onClick={() => setSearchOpen(true)}
          className="relative cursor-pointer"
          whileHover={{ scale: 1.05, rotate: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <img
            src={ticketImages[ticketColor]}
            alt=""
            className="w-14 h-auto rounded-sm shadow-[2px_4px_12px_rgba(0,0,0,0.5)]"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[#2A2000]/40 text-lg">+</span>
          </div>
        </motion.button>
      </div>

      {/* Ticket expanded */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-night/40 z-0" onClick={() => { setSearchOpen(false); setSearchQuery(""); setSearchResults([]); }} />
            <motion.div className="relative z-10 w-full max-w-[280px]" initial={{ scale: 0.5, y: 100, rotate: 5 }} animate={{ scale: 1, y: 0, rotate: 0 }} exit={{ scale: 0.5, y: 100, rotate: -5 }} transition={{ type: "spring", damping: 18 }}>
              <div className="relative overflow-hidden rounded-lg shadow-[4px_6px_25px_rgba(0,0,0,0.6)]">
                <img src={ticketImages[ticketColor]} alt="" className="w-full pointer-events-none" />
                {/* TON NOM — clickable to type your name */}
                <div className="absolute left-[8%] right-[40%] z-10" style={{ top: "37%", height: "6%" }}>
                  <input type="text" value={borrowerName} onChange={(e) => { setBorrowerName(e.target.value); localStorage.setItem("side-borrower-name", e.target.value); }} placeholder="" className="w-full h-full bg-transparent text-[#2A2000] text-[11px] focus:outline-none font-mono tracking-wide cursor-text" />
                </div>
                {/* Search — on TITLE/AUTHOR area */}
                <div className="absolute left-[8%] right-[8%] bottom-[4%] overflow-y-auto z-10" style={{ top: "49%" }}>
                  <div className="flex flex-col h-full">
                    <input type="text" placeholder="titre ou auteur..." className="w-full bg-[#e6c0c2]/80 rounded px-1.5 py-1 text-[#2A2000] text-[11px] placeholder:text-[#2A2000]/30 focus:outline-none font-mono" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
                    <div className="flex-1 overflow-y-auto mt-1 divide-y divide-[#2A2000]/15 bg-[#e6c0c2]/90 rounded">
                      {searchResults.map((result) => (
                        <button key={result.id} onClick={() => { handleAddBook({ id: result.id, title: result.volumeInfo.title, author: result.volumeInfo.authors?.[0] || "Auteur inconnu", cover: (result.volumeInfo.imageLinks?.thumbnail || "").replace("http://", "https://"), totalPages: result.volumeInfo.pageCount }); setSearchOpen(false); setSearchQuery(""); setSearchResults([]); }} className="flex items-center gap-2 w-full py-2 px-1 hover:bg-[#2A2000]/8 cursor-pointer transition-colors text-left">
                          {result.volumeInfo.imageLinks?.thumbnail && <img src={result.volumeInfo.imageLinks.thumbnail.replace("http://", "https://")} alt="" className="w-8 h-11 object-cover rounded-sm flex-shrink-0 shadow-sm" />}
                          <div className="min-w-0">
                            <p className="text-[#2A2000] text-[10px] font-medium leading-tight truncate font-mono">{result.volumeInfo.title}</p>
                            <p className="text-[#2A2000]/40 text-[8px] truncate font-mono mt-0.5">{result.volumeInfo.authors?.[0]}</p>
                          </div>
                        </button>
                      ))}
                      {searchQuery && searchResults.length === 0 && !searching && <p className="text-[#2A2000]/20 text-[9px] text-center mt-4 font-mono">aucun résultat</p>}
                      {searching && <p className="text-[#2A2000]/20 text-[9px] text-center mt-4 font-mono">recherche...</p>}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BookDetail
        book={selectedBook}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        onUpdate={handleUpdateBook}
        onRemove={handleRemoveBook}
        ticketColor={ticketColor}
      />
    </div>
  );
}
