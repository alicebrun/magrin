import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/* ------------------------------- types ---------------------------------- */

export type Guest = {
  id: string;
  name: string;
  password: string;
  coming: string;
  arrival: string | null;
  departure: string | null;
  trainStatus: string;
  trainDay: string | null;
  trainTime: string;
  trainCity: string;
};
export type Evening = { chef: string; theme: string; photo?: string; members: string[] };
export type Message = { id: string; guestId: string; text: string; ts: number };
export type Data = { guests: Guest[]; evenings: Record<string, Evening>; messages: Message[] };

export const emptyData = (): Data => ({ guests: [], evenings: {}, messages: [] });

/* --------------------------- supabase client ---------------------------- */

// La clé "publishable" est publique par conception (protégée par les règles RLS de la base).
// On la met en valeur par défaut pour que le partage marche partout sans config supplémentaire.
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://psbxaoxubacycgweqvpi.supabase.co";
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_fwQfCzaRftwDWQpwR0pWEw_7be7wiJ6";
export const isRemote = !!(URL && ANON);
const sb: SupabaseClient | null = isRemote ? createClient(URL!, ANON!) : null;
/** Client Supabase brut (pour le temps réel / présence sur la carte). Null si non configuré. */
export const supabase = sb;

/* ----------------------------- row mapping ------------------------------ */

type GuestRow = {
  id: string;
  name: string;
  password: string;
  coming: string | null;
  arrival: string | null;
  departure: string | null;
  train_status: string | null;
  train_day: string | null;
  train_time: string | null;
  train_city: string | null;
};
type EveningRow = { day: string; chef: string | null; theme: string | null; photo: string | null; members: string[] | null };
type MessageRow = { id: string; guest_id: string | null; text: string | null; ts: number | string | null };

const rowToGuest = (r: GuestRow): Guest => ({
  id: r.id,
  name: r.name,
  password: r.password || "",
  coming: r.coming || "oui",
  arrival: r.arrival,
  departure: r.departure,
  trainStatus: r.train_status || "pas",
  trainDay: r.train_day,
  trainTime: r.train_time || "",
  trainCity: r.train_city || "",
});
const guestToRow = (g: Guest): GuestRow => ({
  id: g.id,
  name: g.name,
  password: g.password,
  coming: g.coming,
  arrival: g.arrival,
  departure: g.departure,
  train_status: g.trainStatus,
  train_day: g.trainDay,
  train_time: g.trainTime,
  train_city: g.trainCity,
});

const PATCH_COLS: Record<string, string> = {
  name: "name",
  password: "password",
  coming: "coming",
  arrival: "arrival",
  departure: "departure",
  trainStatus: "train_status",
  trainDay: "train_day",
  trainTime: "train_time",
  trainCity: "train_city",
};

/* --------------------------- local fallback ----------------------------- */

const KEY = "magrin_v7";

function seedLocal(): Data {
  const guests: Guest[] = [
    {
      id: "alice",
      name: "Alice",
      password: "magrin",
      coming: "oui",
      arrival: "sam1",
      departure: "dim9",
      trainStatus: "pas",
      trainDay: null,
      trainTime: "",
      trainCity: "",
    },
  ];
  const evenings: Record<string, Evening> = {
    "lun3-soir": { chef: "alice", theme: "Soirée Mythologie Grecque", photo: "/assets/ev-mytho.png", members: [] },
    "mer5-soir": { chef: "alice", theme: "Film en plein air", photo: "/assets/ev-cinema.png", members: [] },
    "jeu6-aprem": { chef: "alice", theme: "Cours d'astronomie", photo: "/assets/ev-astro.png", members: [] },
    "sam8-soir": { chef: "alice", theme: "Festival", photo: "/assets/ev-festival.png", members: [] },
  };
  return { guests, evenings, messages: [] };
}
function readLocal(): Data {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw) as Data;
      if (d && d.guests) return d;
    }
  } catch {}
  const seeded = seedLocal();
  writeLocal(seeded);
  return seeded;
}
function writeLocal(d: Data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {}
}

/* ------------------------------- reads ---------------------------------- */

export async function fetchData(): Promise<Data> {
  if (sb) {
    const [g, e, m] = await Promise.all([
      sb.from("guests").select("*"),
      sb.from("evenings").select("*"),
      sb.from("messages").select("*").order("ts", { ascending: true }),
    ]);
    const guests = ((g.data as GuestRow[]) || []).map(rowToGuest);
    const evenings: Record<string, Evening> = {};
    ((e.data as EveningRow[]) || []).forEach((r) => {
      if (!r.chef) return;
      evenings[r.day] = { chef: r.chef, theme: r.theme || "", photo: r.photo || undefined, members: r.members || [] };
    });
    const messages = ((m.data as MessageRow[]) || []).map((r) => ({
      id: r.id,
      guestId: r.guest_id || "",
      text: r.text || "",
      ts: Number(r.ts) || 0,
    }));
    return { guests, evenings, messages };
  }
  return readLocal();
}

export function subscribe(onChange: () => void): () => void {
  if (sb) {
    const ch = sb
      .channel("magrin-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "guests" }, onChange)
      .on("postgres_changes", { event: "*", schema: "public", table: "evenings" }, onChange)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, onChange)
      .subscribe();
    return () => {
      sb.removeChannel(ch);
    };
  }
  const handler = (ev: StorageEvent) => {
    if (ev.key === KEY) onChange();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", handler);
  return () => {
    if (typeof window !== "undefined") window.removeEventListener("storage", handler);
  };
}

/* ------------------------------- writes --------------------------------- */

export async function upsertGuest(g: Guest): Promise<void> {
  if (sb) {
    await sb.from("guests").upsert(guestToRow(g));
    return;
  }
  const d = readLocal();
  const i = d.guests.findIndex((x) => x.id === g.id);
  if (i >= 0) d.guests[i] = g;
  else d.guests.push(g);
  writeLocal(d);
}

export async function patchGuest(id: string, patch: Partial<Guest>): Promise<void> {
  if (sb) {
    const row: Record<string, unknown> = {};
    (Object.keys(patch) as (keyof Guest)[]).forEach((k) => {
      const col = PATCH_COLS[k as string];
      if (col) row[col] = patch[k];
    });
    if (Object.keys(row).length) await sb.from("guests").update(row).eq("id", id);
    return;
  }
  const d = readLocal();
  const g = d.guests.find((x) => x.id === id);
  if (g) Object.assign(g, patch);
  writeLocal(d);
}

export async function upsertEvening(day: string, ev: Evening): Promise<void> {
  if (sb) {
    await sb.from("evenings").upsert({ day, chef: ev.chef, theme: ev.theme, photo: ev.photo ?? null, members: ev.members });
    return;
  }
  const d = readLocal();
  d.evenings[day] = ev;
  writeLocal(d);
}

export async function deleteEvening(day: string): Promise<void> {
  if (sb) {
    await sb.from("evenings").delete().eq("day", day);
    return;
  }
  const d = readLocal();
  delete d.evenings[day];
  writeLocal(d);
}

export async function insertMessage(m: Message): Promise<void> {
  if (sb) {
    await sb.from("messages").insert({ id: m.id, guest_id: m.guestId, text: m.text, ts: m.ts });
    return;
  }
  const d = readLocal();
  if (!d.messages) d.messages = [];
  d.messages.push(m);
  writeLocal(d);
}

/** Find a guest by name + password (used for login). Always reads fresh. */
export async function findGuestByCredentials(name: string, password: string): Promise<Guest | null> {
  const n = name.trim().toLowerCase();
  if (sb) {
    const { data } = await sb.from("guests").select("*");
    const rows = (data as GuestRow[]) || [];
    const row = rows.find((r) => (r.name || "").trim().toLowerCase() === n && (r.password || "") === password);
    return row ? rowToGuest(row) : null;
  }
  const d = readLocal();
  return d.guests.find((g) => g.name.trim().toLowerCase() === n && (g.password || "") === password) || null;
}
