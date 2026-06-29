"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const places = [
  {
    id: "library",
    name: "La Librairie",
    emoji: "📚",
    description: "Les livres partagés par la communauté",
    color: "from-warm/20 to-warm/5",
    borderColor: "border-warm/20",
    available: true,
    image: null,
  },
  {
    id: "cinema",
    name: "Le Cinéma",
    emoji: "🎬",
    description: "Les films et séries du quartier",
    color: "from-coral/20 to-coral/5",
    borderColor: "border-coral/20",
    available: false,
    image: "/assets/cinema.jpg",
  },
  {
    id: "vinyl",
    name: "Le Disquaire",
    emoji: "🎵",
    description: "Les albums et playlists en vitrine",
    color: "from-sky/20 to-sky/5",
    borderColor: "border-sky/20",
    available: false,
    image: "/assets/cassettes.jpg",
  },
  {
    id: "podcast",
    name: "Le Bar à Podcasts",
    emoji: "🎙️",
    description: "Les épisodes du moment",
    color: "from-emerald-500/20 to-emerald-500/5",
    borderColor: "border-emerald-500/20",
    available: false,
    image: null,
  },
];

export default function StreetPage() {
  return (
    <div className="min-h-screen bg-night overflow-y-auto hide-scrollbar">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-night/90 backdrop-blur-md border-b border-cream/5">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/">
            <motion.button
              className="text-cream/40 hover:text-cream transition-colors text-sm cursor-pointer"
              whileTap={{ scale: 0.95 }}
            >
              ← Mon immeuble
            </motion.button>
          </Link>
          <h1 className="text-cream font-medium text-sm">La Rue</h1>
          <div className="w-16" />
        </div>
      </div>

      {/* Street illustration header */}
      <div className="max-w-md mx-auto px-6 pt-8 pb-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl mb-3"
        >
          🏘️
        </motion.div>
        <h2 className="text-cream font-medium text-lg">Ton quartier</h2>
        <p className="text-cream/30 text-xs mt-1">
          Balade-toi et découvre ce que la communauté partage
        </p>
      </div>

      {/* Places */}
      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {places.map((place, i) => (
          <motion.div
            key={place.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div
              className={`relative overflow-hidden rounded-xl ${
                place.available ? "cursor-pointer" : "opacity-50"
              }`}
            >
              {/* Background image or gradient */}
              {place.image ? (
                <div className="relative h-32 sm:h-40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={place.image} alt={place.name} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-cream font-medium text-sm">{place.name}</h3>
                    <p className="text-cream/50 text-xs">{place.description}</p>
                  </div>
                  {!place.available && (
                    <div className="absolute top-3 right-3">
                      <span className="text-[10px] text-cream/60 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
                        bientôt
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className={`relative bg-gradient-to-r ${place.color} border ${place.borderColor} p-4`}>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{place.emoji}</span>
                    <div className="flex-1">
                      <h3 className="text-cream font-medium text-sm">{place.name}</h3>
                      <p className="text-cream/40 text-xs">{place.description}</p>
                    </div>
                    {place.available ? (
                      <motion.span
                        className="text-cream/30 text-sm"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    ) : (
                      <span className="text-[10px] text-cream/20 bg-cream/5 px-2 py-0.5 rounded-full">
                        bientôt
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Coming soon overlay */}
              {!place.available && (
                <div className="absolute inset-0 bg-night/30 rounded-xl" />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-night/90 backdrop-blur-md border-t border-cream/5">
        <div className="max-w-md mx-auto flex justify-around py-2">
          <Link href="/" className="flex flex-col items-center gap-0.5 text-cream/30 hover:text-cream/60 transition-colors">
            <span className="text-lg">🏢</span>
            <span className="text-[9px]">Immeuble</span>
          </Link>
          <Link href="/library" className="flex flex-col items-center gap-0.5 text-cream/30 hover:text-cream/60 transition-colors">
            <span className="text-lg">📚</span>
            <span className="text-[9px]">Bibli</span>
          </Link>
          <div className="flex flex-col items-center gap-0.5 text-warm">
            <span className="text-lg">🏘️</span>
            <span className="text-[9px]">La rue</span>
          </div>
        </div>
      </div>
    </div>
  );
}
