"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

const FURNITURE_KEY = "side-furniture";

const roomAngles = ["/assets/room-angle-0.png", "/assets/room-angle-1.png"];

interface PlacedItem {
  id: string;
  catalogId: string;
  x: number;
  y: number;
  rotation: number; // 0-3
  scale: number;
}

interface CatalogItem {
  id: string;
  name: string;
  angles: [string, string, string, string]; // 4 rotation images
  thumb: string;
  width: number;
  height: number;
  link?: string; // if set, clicking navigates here instead of selecting
}

const catalog: CatalogItem[] = [
  {
    id: "couch",
    name: "Canapé",
    angles: ["/assets/couch-0.png", "/assets/couch-1.png", "/assets/couch-2.png", "/assets/couch-3.png"],
    thumb: "/assets/couch-0.png",
    width: 150,
    height: 100,
  },
  {
    id: "turntable",
    name: "Platine",
    angles: ["/assets/turntable-0.png", "/assets/turntable-1.png", "/assets/turntable-2.png", "/assets/turntable-3.png"],
    thumb: "/assets/turntable-0.png",
    width: 110,
    height: 90,
  },
  {
    id: "books",
    name: "Livres",
    angles: ["/assets/books-0.png", "/assets/books-1.png", "/assets/books-2.png", "/assets/books-0.png"],
    thumb: "/assets/books-0.png",
    width: 120,
    height: 80,
    link: "/library",
  },
];

export default function ApartmentPage() {
  const [placed, setPlaced] = useState<PlacedItem[]>([]);
  const [showCatalog, setShowCatalog] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [roomAngle, setRoomAngle] = useState(0);
  const [roomDragging, setRoomDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragOffsetRef = useRef(0);
  const roomAngleRef = useRef(0);
  const roomDragStart = useRef<{ x: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const didDragRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const savedFurniture = localStorage.getItem(FURNITURE_KEY);
      if (savedFurniture) setPlaced(JSON.parse(savedFurniture));
    } catch { /* */ }
    const savedAngle = localStorage.getItem("side-room-angle");
    if (savedAngle) setRoomAngle(parseInt(savedAngle) || 0);
  }, []);

  const saveFurniture = useCallback((items: PlacedItem[]) => {
    setPlaced(items);
    localStorage.setItem(FURNITURE_KEY, JSON.stringify(items));
  }, []);

  const addFromCatalog = (catalogItem: CatalogItem) => {
    const newItem: PlacedItem = {
      id: `${catalogItem.id}-${Date.now()}`,
      catalogId: catalogItem.id,
      x: 50, y: 65, rotation: 0, scale: 1,
    };
    saveFurniture([...placed, newItem]);
    setShowCatalog(false);
    setSelected(newItem.id);
  };

  const rotateFurniture = (id: string) => {
    saveFurniture(placed.map(p =>
      p.id === id ? { ...p, rotation: (p.rotation + 1) % 4 } : p
    ));
  };

  const removeFurniture = (id: string) => {
    saveFurniture(placed.filter(p => p.id !== id));
    setSelected(null);
  };

  const scaleFurniture = (id: string, delta: number) => {
    saveFurniture(placed.map(p =>
      p.id === id ? { ...p, scale: Math.max(0.5, Math.min(3, p.scale + delta)) } : p
    ));
  };

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    e.preventDefault();
    didDragRef.current = false;
    setSelected(id);
    setDragging(id);
  };

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!dragging || !containerRef.current) return;
    didDragRef.current = true;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPlaced(prev => prev.map(p =>
      p.id === dragging ? { ...p, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } : p
    ));
  }, [dragging]);

  const handlePointerUp = useCallback(() => {
    if (dragging) {
      setDragging(null);
      setPlaced(prev => {
        localStorage.setItem(FURNITURE_KEY, JSON.stringify(prev));
        return prev;
      });
    }
  }, [dragging]);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      return () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };
    }
  }, [dragging, handlePointerMove, handlePointerUp]);

  const handleRoomPointerDown = (e: React.PointerEvent) => {
    if (dragging || selected) return;
    roomDragStart.current = { x: e.clientX };
    dragOffsetRef.current = 0;
    roomAngleRef.current = roomAngle;
    setDragOffset(0);
    setRoomDragging(true);
  };

  useEffect(() => {
    if (!roomDragging) return;
    const onMove = (e: PointerEvent) => {
      if (!roomDragStart.current) return;
      const dx = e.clientX - roomDragStart.current.x;
      dragOffsetRef.current = dx;
      setDragOffset(dx);
    };
    const onUp = () => {
      setRoomDragging(false);
      const off = dragOffsetRef.current;
      if (Math.abs(off) > 60) {
        const dir = off > 0 ? -1 : 1;
        const next = (roomAngleRef.current + dir + roomAngles.length) % roomAngles.length;
        setRoomAngle(next);
        roomAngleRef.current = next;
        localStorage.setItem("side-room-angle", String(next));
      }
      setDragOffset(0);
      dragOffsetRef.current = 0;
      roomDragStart.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [roomDragging]);

  const bgImage = roomAngles[roomAngle] || roomAngles[0];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden bg-[#1a1520] touch-none select-none"
      onClick={() => setSelected(null)}
      onPointerDown={handleRoomPointerDown}
    >
      <img
        src={bgImage}
        alt=""
        className="absolute inset-0 w-full h-full object-contain transition-transform duration-200 pointer-events-none"
        style={{
          transform: roomDragging ? `translateX(${dragOffset * 0.3}px)` : undefined,
        }}
      />

      {/* Placed furniture */}
      {placed.map((item) => {
        const cat = catalog.find(c => c.id === item.catalogId);
        if (!cat) return null;
        const isSelected = selected === item.id;
        const angleSrc = cat.angles[item.rotation % 4];

        return (
          <div
            key={item.id}
            className={`absolute cursor-grab active:cursor-grabbing ${dragging === item.id ? "z-30" : "z-10"}`}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            onPointerDown={(e) => { e.stopPropagation(); handlePointerDown(e, item.id); }}
            onClick={(e) => { e.stopPropagation(); if (didDragRef.current) return; if (cat.link) { router.push(cat.link); } else { setSelected(item.id); } }}
          >
            <div className="absolute -bottom-2 left-[10%] right-[10%] h-[6px] rounded-full bg-black/20 blur-md" />

            <img
              src={angleSrc}
              alt=""
              className={`object-contain select-none pointer-events-none mix-blend-multiply ${isSelected ? "drop-shadow-[0_0_8px_rgba(255,207,86,0.5)]" : "drop-shadow-lg"}`}
              style={{
                width: cat.width * item.scale,
                height: cat.height * item.scale,
              }}
              draggable={false}
            />

            {isSelected && !dragging && (
              <div
                className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-1.5 z-40"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); scaleFurniture(item.id, -0.15); }}
                  className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm border border-cream/20 text-cream text-xs flex items-center justify-center cursor-pointer hover:bg-black/80"
                >
                  −
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); scaleFurniture(item.id, 0.15); }}
                  className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm border border-cream/20 text-cream text-xs flex items-center justify-center cursor-pointer hover:bg-black/80"
                >
                  +
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); rotateFurniture(item.id); }}
                  className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm border border-cream/20 text-cream text-xs flex items-center justify-center cursor-pointer hover:bg-black/80"
                >
                  ↻
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFurniture(item.id); }}
                  className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm border border-red-500/30 text-red-400 text-xs flex items-center justify-center cursor-pointer hover:bg-black/80"
                >
                  ✕
                </button>
              </div>
            )}

            {isSelected && (
              <div className="absolute -inset-2 border-2 border-warm/40 border-dashed rounded-lg pointer-events-none" />
            )}
          </div>
        );
      })}

      <Link href="/">
        <div className="absolute top-4 left-4 z-20 text-cream/50 hover:text-cream text-sm cursor-pointer drop-shadow-md">←</div>
      </Link>

      {/* Room angle indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {roomAngles.map((_, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === roomAngle ? "bg-cream/60" : "bg-cream/15"}`} />
        ))}
      </div>

      <button
        className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm border border-cream/10 flex items-center justify-center text-cream/50 hover:text-cream cursor-pointer text-lg"
        onClick={(e) => { e.stopPropagation(); setShowCatalog(!showCatalog); }}
      >+</button>

      <AnimatePresence>
        {showCatalog && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 right-4 z-30 bg-black/60 backdrop-blur-md border border-cream/10 rounded-lg p-3 min-w-[140px]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-cream/40 text-[9px] mb-2 uppercase tracking-wider">Meubles</p>
            {catalog.map((item) => (
              <button key={item.id} onClick={() => addFromCatalog(item)}
                className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-cream/5 cursor-pointer transition-colors">
                <img src={item.thumb} alt="" className="w-10 h-7 object-contain" />
                <span className="text-cream/70 text-xs">{item.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
