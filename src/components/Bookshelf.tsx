"use client";

/* eslint-disable @next/next/no-img-element */
import { motion } from "framer-motion";

export type BookStatus = "reading" | "read" | "to-read";

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  rating?: number;
  bookmark?: number;
  totalPages?: number;
  review?: string;
  addedAt?: string;
  status?: BookStatus;
}

export interface PublicRating {
  user: string;
  rating: number;
  review?: string;
  date: string;
}

export interface PublicBookEntry {
  bookId: string;
  title: string;
  author: string;
  cover: string;
  totalPages?: number;
  ratings: PublicRating[];
}

export type TicketColor = "yellow" | "pink";

interface BookshelfProps {
  books: Book[];
  onBookClick: (book: Book) => void;
  shelfStyle?: "wood" | "fantasy";
}

const shelfBackgrounds: Record<string, string> = {
  wood: "/assets/shelf-wood.jpg",
  fantasy: "/assets/shelf-fantasy.jpg",
};

const shelfPositions = [
  { top: "2%", height: "16.5%" },
  { top: "20%", height: "16.5%" },
  { top: "38%", height: "16.5%" },
  { top: "56.5%", height: "16.5%" },
  { top: "75%", height: "16.5%" },
];

function BookOnShelf({ book, onClick, index }: { book: Book; onClick: () => void; index: number }) {
  const hasBookmark = book.bookmark && book.bookmark > 0;

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
      <div className="relative w-[52px] h-[78px] sm:w-[62px] sm:h-[92px] rounded-[2px] overflow-hidden shadow-[2px_3px_8px_rgba(0,0,0,0.5)]">
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

      {hasBookmark && (
        <div className="absolute -top-2.5 right-0.5 w-2.5 h-5 bg-red-500 shadow-sm" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 75%, 0 100%)" }} />
      )}

      {book.rating && (
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex gap-[2px]">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={`block w-1 h-1 rounded-full ${i < book.rating! ? "bg-amber-400" : "bg-white/15"}`} />
          ))}
        </div>
      )}

      <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
        <div className="bg-black/80 backdrop-blur-sm rounded px-2 py-1 whitespace-nowrap">
          <p className="text-[8px] text-white font-medium">{book.title}</p>
          <p className="text-[7px] text-white/50">{book.author}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Bookshelf({ books, onBookClick, shelfStyle = "wood" }: BookshelfProps) {
  const bgImage = shelfBackgrounds[shelfStyle];

  const rows: Book[][] = [];
  for (let i = 0; i < books.length; i += 5) {
    rows.push(books.slice(i, i + 5));
  }

  return (
    <div className="relative w-full h-full">
      <div className="relative w-full h-full overflow-hidden">
        <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/5" />

        {shelfPositions.map((pos, shelfIndex) => {
          const shelfBooks = rows[shelfIndex] || [];
          return (
            <div
              key={shelfIndex}
              className="absolute left-0 right-0 flex items-end justify-center gap-1 sm:gap-1.5 px-[12%]"
              style={{ top: pos.top, height: pos.height, paddingBottom: "1%" }}
            >
              {shelfBooks.map((book, i) => (
                <BookOnShelf key={book.id} book={book} onClick={() => onBookClick(book)} index={shelfIndex * 5 + i} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
