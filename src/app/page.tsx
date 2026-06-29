"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import * as store from "@/lib/store";
import type { Guest, Data } from "@/lib/store";

/* ----------------------------- types & data ----------------------------- */

const MEKEY = "magrin_me6";

const DAYS = [
  { id: "sam1", dow: "Samedi", d: "1" },
  { id: "dim2", dow: "Dimanche", d: "2" },
  { id: "lun3", dow: "Lundi", d: "3" },
  { id: "mar4", dow: "Mardi", d: "4" },
  { id: "mer5", dow: "Mercredi", d: "5" },
  { id: "jeu6", dow: "Jeudi", d: "6" },
  { id: "ven7", dow: "Vendredi", d: "7" },
  { id: "sam8", dow: "Samedi", d: "8" },
  { id: "dim9", dow: "Dimanche", d: "9" },
];
const WEEK_HEADERS = ["L", "M", "M", "J", "V", "S", "D"];

const SLOTS = [
  { id: "matin", label: "Matin", icon: "🌅" },
  { id: "aprem", label: "Après-midi", icon: "🌞" },
  { id: "soir", label: "Soir", icon: "🌙" },
];

/* ------------------------------- helpers -------------------------------- */

// Parse a CSS string ("prop:val; prop:val") into a React style object so the
// design's inline styles can be copied verbatim.
function css(s: string): CSSProperties {
  const out: Record<string, string> = {};
  s.split(";").forEach((decl) => {
    const i = decl.indexOf(":");
    if (i === -1) return;
    const rawKey = decl.slice(0, i).trim();
    const val = decl.slice(i + 1).trim();
    if (!rawKey || !val) return;
    const key = rawKey.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    out[key] = val;
  });
  return out as CSSProperties;
}

function initials(name: string): string {
  const p = (name || "").trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return "?";
  if (p.length === 1) return p[0][0].toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}
function dayNum(id: string | null): number | null {
  if (!id) return null;
  const i = DAYS.findIndex((D) => D.id === id);
  return i < 0 ? null : i + 1;
}
function coverStyle(photo: string | undefined, seedStr: string): CSSProperties {
  const layout: CSSProperties = {
    aspectRatio: "1/1.04",
    borderRadius: "1px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "14px",
  };
  if (photo) {
    return {
      ...layout,
      backgroundImage: "linear-gradient(rgba(0,0,0,.16), rgba(0,0,0,.34)), url(" + photo + ")",
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  const palette = [
    "linear-gradient(150deg,#243a52,#3a2f54)",
    "linear-gradient(150deg,#2f4a2a,#46612c)",
    "linear-gradient(150deg,#6b3f2a,#9d5b3a)",
    "linear-gradient(150deg,#3b3357,#5b4a6e)",
    "linear-gradient(150deg,#2A3A19,#4f6b2e)",
    "linear-gradient(150deg,#7a5a1f,#b07d2b)",
  ];
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) h = (h * 31 + seedStr.charCodeAt(i)) >>> 0;
  return { ...layout, background: palette[h % palette.length] };
}

type CalCell = { num: number; style: CSSProperties; disabled: boolean; onClick: () => void };
function buildCal(
  arrId: string | null,
  depId: string | null,
  setRange: (a: string | null, d: string | null) => void,
): { calCells: CalCell[]; summary: string } {
  const arrNum = dayNum(arrId),
    depNum = dayNum(depId);
  const cells: { num: number; type: string }[] = [];
  [27, 28, 29, 30, 31].forEach((n) => cells.push({ num: n, type: "prev" }));
  for (let n = 1; n <= 31; n++) cells.push({ num: n, type: "aug" });
  let nx = 1;
  while (cells.length % 7 !== 0) cells.push({ num: nx++, type: "next" });
  const onPick = (n: number) => {
    if (arrNum === null || depNum !== null || (depNum === null && n < arrNum)) setRange(DAYS[n - 1].id, null);
    else if (n === arrNum) setRange(null, null);
    else setRange(arrId, DAYS[n - 1].id);
  };
  const base: CSSProperties = {
    width: "100%",
    aspectRatio: "1/1",
    border: "none",
    borderRadius: "50%",
    fontFamily: "'Space Mono',monospace",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0",
  };
  const calCells: CalCell[] = cells.map((c) => {
    const selectable = c.type === "aug" && c.num >= 1 && c.num <= 9;
    const isArr = selectable && c.num === arrNum;
    const isDep = selectable && c.num === depNum;
    const inRange = selectable && arrNum !== null && depNum !== null && c.num > arrNum && c.num < depNum;
    let style: CSSProperties;
    if (c.type !== "aug") style = { ...base, background: "transparent", color: "rgba(36,40,28,.22)", cursor: "default" };
    else if (!selectable) style = { ...base, background: "transparent", color: "rgba(36,40,28,.28)", cursor: "default" };
    else if (isArr || isDep) style = { ...base, background: "#3E5226", color: "#F3EEDF", fontWeight: "700", cursor: "pointer" };
    else if (inRange) style = { ...base, background: "rgba(62,82,38,.16)", color: "#3E5226", borderRadius: "4px", cursor: "pointer" };
    else style = { ...base, background: "rgba(62,82,38,.06)", color: "#241B16", cursor: "pointer" };
    return { num: c.num, style, disabled: !selectable, onClick: selectable ? () => onPick(c.num) : () => {} };
  });
  let summary = "Choisis tes dates.";
  if (arrNum !== null && depNum !== null) summary = "✓ Du " + arrNum + " au " + depNum + " août — " + (depNum - arrNum + 1) + " jours sur place.";
  else if (arrNum !== null) summary = "Arrivée le " + arrNum + " août — clique ton jour de départ.";
  return { calCells, summary };
}

function tabStyle(active: boolean): CSSProperties {
  return {
    fontFamily: "'Space Mono',monospace",
    fontSize: "12px",
    letterSpacing: ".1em",
    textTransform: "uppercase",
    padding: "9px 16px",
    borderRadius: "5px",
    cursor: "pointer",
    border: "none",
    background: active ? "#6E8B3A" : "transparent",
    color: active ? "#F3EEDF" : "rgba(243,238,223,.66)",
  };
}
function chipStyle(sel: boolean): CSSProperties {
  return {
    fontFamily: "'Space Mono',monospace",
    fontSize: "11px",
    letterSpacing: ".06em",
    padding: "7px 11px",
    borderRadius: "2px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    border: "1px solid rgba(62,82,38,.5)",
    textTransform: "uppercase",
    background: sel ? "#3E5226" : "rgba(255,255,255,.6)",
    color: sel ? "#F3EEDF" : "#3E5226",
  };
}
function obDot(active: boolean, done: boolean): CSSProperties {
  return {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Space Mono',monospace",
    fontSize: "12px",
    flexShrink: 0,
    background: active || done ? "#3E5226" : "rgba(62,82,38,.15)",
    color: active || done ? "#F3EEDF" : "rgba(62,82,38,.6)",
  };
}
// Lit un fichier image, le redimensionne/compresse, et renvoie une data-URL JPEG légère.
function fileToDataURL(file: File, maxDim = 900, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("img"));
      img.onload = () => {
        let { width, height } = img;
        if (width >= height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > width && height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function bottomTabStyle(active: boolean): CSSProperties {
  return {
    flex: "1",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Space Mono',monospace",
    fontSize: "11px",
    letterSpacing: ".1em",
    textTransform: "uppercase",
    border: "none",
    background: active ? "#3E5226" : "transparent",
    color: active ? "#F3EEDF" : "rgba(243,238,223,.6)",
    cursor: "pointer",
  };
}
function ctaStyle(disabled: boolean, grow: boolean): CSSProperties {
  return {
    flex: grow ? "1" : "none",
    fontFamily: "'Space Mono',monospace",
    fontSize: "13px",
    letterSpacing: ".1em",
    textTransform: "uppercase",
    padding: "14px 20px",
    border: "none",
    borderRadius: "3px",
    cursor: disabled ? "not-allowed" : "pointer",
    background: disabled ? "rgba(62,82,38,.3)" : "#3E5226",
    color: "#F3EEDF",
    width: grow ? "auto" : "100%",
  };
}

/* ------------------------------ component -------------------------------- */

export default function MagrinHome() {
  const [data, setData] = useState<Data | null>(null);
  const [meId, setMeId] = useState<string | null>(null);
  const [modalStep, setModalStep] = useState<"invite" | "onboard" | "login" | null>(null);
  const [obStep, setObStep] = useState<1 | 2 | 3>(1);
  const [obName, setObName] = useState("");
  const [obPwd, setObPwd] = useState("");
  const [obArr, setObArr] = useState<string | null>(null);
  const [obDep, setObDep] = useState<string | null>(null);
  const [loginName, setLoginName] = useState("");
  const [loginPwd, setLoginPwd] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [activeTab, setActiveTab] = useState<"carte" | "planning" | "social" | "classement" | "coins">("planning");
  const [chefDraftKey, setChefDraftKey] = useState<string | null>(null);
  const [chefDraftTheme, setChefDraftTheme] = useState("");
  const [chefDraftPhoto, setChefDraftPhoto] = useState<string | null>(null);
  const [showQuestForm, setShowQuestForm] = useState(false);
  const [newQuestTitle, setNewQuestTitle] = useState("");
  const [newQuestPoints, setNewQuestPoints] = useState("5");
  const [newQuestSlots, setNewQuestSlots] = useState("");
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [peers, setPeers] = useState<Record<string, { name: string; initials: string; x: number; y: number; ts: number }>>({});

  useEffect(() => {
    let alive = true;
    const refresh = () => {
      store.fetchData().then((d) => {
        if (alive) setData(d);
      });
    };
    refresh();
    const unsub = store.subscribe(refresh);

    try {
      const m = localStorage.getItem(MEKEY);
      if (m) setMeId(m);
    } catch {}

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalStep(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      alive = false;
      unsub();
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // optimistic local update — the store persists separately and realtime reconciles
  const applyLocal = (mutator: (d: Data) => void) => {
    setData((prev) => {
      const copy: Data = JSON.parse(JSON.stringify(prev ?? store.emptyData()));
      mutator(copy);
      return copy;
    });
  };
  const login = (id: string) => {
    try {
      localStorage.setItem(MEKEY, id);
    } catch {}
    setMeId(id);
  };
  const logout = () => {
    try {
      localStorage.removeItem(MEKEY);
    } catch {}
    setMeId(null);
  };

  const guest = (id: string): Guest | null => (data ? data.guests.find((g) => g.id === id) || null : null);
  const me: Guest | null = data && meId ? data.guests.find((g) => g.id === meId) || null : null;
  const hasMe = !!me;

  const setMe = (patch: Partial<Guest>) => {
    if (!meId) return;
    applyLocal((d) => {
      const g = d.guests.find((x) => x.id === meId);
      if (g) Object.assign(g, patch);
    });
    store.patchGuest(meId, patch);
  };
  const createAccount = () => {
    const name = obName.trim();
    if (!name || obPwd.length < 3 || !obArr) return;
    const id = "g" + Date.now();
    const newGuest: Guest = {
      id,
      name,
      password: obPwd,
      coming: "oui",
      arrival: obArr,
      departure: obDep,
      trainStatus: "pas",
      trainDay: null,
      trainTime: "",
      trainCity: "",
    };
    applyLocal((d) => {
      d.guests.push(newGuest);
    });
    store.upsertGuest(newGuest);
    login(id);
    setModalStep(null);
    setObStep(1);
    setObName("");
    setObPwd("");
    setObArr(null);
    setObDep(null);
    setActiveTab("planning");
  };
  const doLogin = async () => {
    const g = await store.findGuestByCredentials(loginName, loginPwd);
    if (!g) {
      setLoginErr("Nom ou mot de passe incorrect.");
      return;
    }
    applyLocal((d) => {
      if (!d.guests.find((x) => x.id === g.id)) d.guests.push(g);
    });
    login(g.id);
    setModalStep(null);
    setLoginName("");
    setLoginPwd("");
    setLoginErr("");
  };
  const becomeChef = (key: string, theme: string, photo: string | null) => {
    if (!meId) return;
    const t = (theme || "").trim() || "Surprise";
    const ev: { chef: string; theme: string; members: string[]; photo?: string } = { chef: meId, theme: t, members: [] };
    if (photo) ev.photo = photo;
    applyLocal((d) => {
      d.evenings[key] = ev;
    });
    store.upsertEvening(key, ev);
    setChefDraftKey(null);
    setChefDraftTheme("");
    setChefDraftPhoto(null);
  };
  // Le/la chef·fe change ou ajoute la photo d'un créneau déjà créé.
  const setEveningPhoto = (key: string, photo: string) => {
    const ev = data?.evenings[key];
    if (!ev || ev.chef !== meId) return;
    const next = { ...ev, photo };
    applyLocal((d) => {
      if (d.evenings[key]) d.evenings[key] = next;
    });
    store.upsertEvening(key, next);
  };
  // Le/la chef·fe supprime son créneau.
  const removeEvening = (key: string) => {
    const ev = data?.evenings[key];
    if (!ev || ev.chef !== meId) return;
    applyLocal((d) => {
      delete d.evenings[key];
    });
    store.deleteEvening(key);
  };
  const onPickPhoto = async (file: File | undefined, cb: (url: string) => void) => {
    if (!file) return;
    try {
      cb(await fileToDataURL(file));
    } catch {}
  };
  const joinTeam = (day: string) => {
    if (!meId) return;
    const ev = data?.evenings[day];
    if (!ev || ev.chef === meId || ev.members.includes(meId)) return;
    const next = { ...ev, members: [...ev.members, meId] };
    applyLocal((d) => {
      if (d.evenings[day]) d.evenings[day] = next;
    });
    store.upsertEvening(day, next);
  };
  const leaveTeam = (day: string) => {
    if (!meId) return;
    const ev = data?.evenings[day];
    if (!ev) return;
    const next = { ...ev, members: ev.members.filter((x) => x !== meId) };
    applyLocal((d) => {
      if (d.evenings[day]) d.evenings[day] = next;
    });
    store.upsertEvening(day, next);
  };
  const claimQuest = (questId: string, photo: string | null) => {
    if (!meId) return;
    const q = data?.quests?.find((x) => x.id === questId);
    if (!q) return;
    if (q.claims.some((c) => c.guestId === meId)) return;
    if (q.slots != null && q.claims.length >= q.slots) return;
    const next = { ...q, claims: [...q.claims, { guestId: meId, photo: photo || undefined, ts: Date.now() }] };
    applyLocal((d) => {
      const qq = d.quests?.find((x) => x.id === questId);
      if (qq) qq.claims = next.claims;
    });
    store.upsertQuest(next);
  };
  const addQuest = () => {
    if (!meId) return;
    const title = newQuestTitle.trim();
    if (!title) return;
    const points = Math.max(1, Math.min(50, parseInt(newQuestPoints, 10) || 5));
    const slotsNum = parseInt(newQuestSlots, 10);
    const slots = newQuestSlots.trim() && slotsNum > 0 ? slotsNum : null;
    const q = { id: "q" + Date.now(), title, points, slots, createdBy: meId, claims: [] as { guestId: string; photo?: string; ts: number }[] };
    applyLocal((d) => {
      if (!d.quests) d.quests = [];
      d.quests.push(q);
    });
    store.upsertQuest(q);
    setNewQuestTitle("");
    setNewQuestPoints("5");
    setNewQuestSlots("");
    setShowQuestForm(false);
  };
  const removeQuest = (id: string) => {
    const q = data?.quests?.find((x) => x.id === id);
    if (!q || q.createdBy !== meId) return;
    applyLocal((d) => {
      d.quests = (d.quests || []).filter((x) => x.id !== id);
    });
    store.deleteQuest(id);
  };
  const sendChat = () => {
    const t = chatInput.trim();
    if (!t || !meId) return;
    const m = { id: "m" + Date.now(), guestId: meId, text: t, ts: Date.now() };
    applyLocal((d) => {
      if (!d.messages) d.messages = [];
      d.messages.push(m);
    });
    store.insertMessage(m);
    setChatInput("");
  };

  /* --------------------------- derived values --------------------------- */

  const guestsArr = data?.guests || [];
  const evenings = data?.evenings || {};
  const tab = activeTab;

  const ob = buildCal(obArr, obDep, (a, d) => {
    setObArr(a);
    setObDep(d);
  });
  const meCal = hasMe ? buildCal(me!.arrival, me!.departure, (a, d) => setMe({ arrival: a, departure: d })) : { calCells: [], summary: "" };

  // attendance per day
  const att: Record<number, number> = {};
  let peakDay: number | null = null,
    peakN = 0;
  DAYS.forEach((D, i) => {
    const d = i + 1;
    let n = 0;
    guestsArr.forEach((g) => {
      if (g.coming !== "oui" || g.arrival == null) return;
      const a = dayNum(g.arrival),
        dep = dayNum(g.departure);
      if (a !== null && d >= a && (dep == null || d <= dep)) n++;
    });
    att[d] = n;
    if (n > peakN) {
      peakN = n;
      peakDay = d;
    }
  });
  const attCells: { num: number; type: string }[] = [];
  [27, 28, 29, 30, 31].forEach((num) => attCells.push({ num, type: "prev" }));
  for (let num = 1; num <= 31; num++) attCells.push({ num, type: "aug" });
  let anx = 1;
  while (attCells.length % 7 !== 0) attCells.push({ num: anx++, type: "next" });
  const attBase: CSSProperties = {
    width: "100%",
    aspectRatio: "1/1",
    borderRadius: "50%",
    fontFamily: "'Space Mono',monospace",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  const attendanceCells = attCells.map((c) => {
    const selectable = c.type === "aug" && c.num >= 1 && c.num <= 9;
    if (!selectable) return { num: "", label: "", title: "", style: { ...attBase, background: "transparent", color: "rgba(36,40,28,.18)" } };
    const n = att[c.num] || 0;
    const t = n / Math.max(peakN, 1);
    const bg = n === 0 ? "rgba(62,82,38,.06)" : "rgba(62,82,38," + (0.2 + 0.6 * t).toFixed(2) + ")";
    const col = n > 0 && t > 0.55 ? "#F3EEDF" : "#3E5226";
    return {
      num: c.num,
      label: String(n),
      title: n + " convive" + (n > 1 ? "s" : "") + " le " + c.num + " août",
      style: { ...attBase, background: bg, color: col, fontWeight: n === peakN && n > 0 ? "700" : "400" } as CSSProperties,
    };
  });
  const attendancePeak = peakN > 0 ? "Pic : " + peakN + " convive" + (peakN > 1 ? "s" : "") + " le " + peakDay + " août" : "Pas encore de présences.";

  // planning days — 3 créneaux par jour (matin / après-midi / soir)
  const days = DAYS.map((D) => ({
    id: D.id,
    dow: D.dow,
    d: D.d,
    slots: SLOTS.map((S) => {
      const key = D.id + "-" + S.id;
      const ev = evenings[key];
      const filled = !!ev && !!ev.chef;
      const chef = filled ? guest(ev!.chef) : null;
      const memberObjs = filled ? ((ev!.members || []).map((id) => guest(id)).filter(Boolean) as Guest[]) : [];
      const youAreChef = filled && hasMe && ev!.chef === me!.id;
      const youAreMember = filled && hasMe && (ev!.members || []).includes(me!.id);
      const isDrafting = chefDraftKey === key;
      return {
        key,
        slotLabel: S.label,
        slotIcon: S.icon,
        theme: filled ? ev!.theme : "",
        coverStyle: filled ? coverStyle(ev!.photo, key + (ev!.theme || "")) : ({} as CSSProperties),
        hasPhoto: filled && !!ev!.photo,
        chefName: chef ? chef.name : "",
        chefInitials: chef ? initials(chef.name) : "",
        members: memberObjs.map((g) => ({ name: g.name, initials: initials(g.name) })),
        filled,
        youAreChef,
        youAreMember,
        showJoin: filled && !youAreChef && !youAreMember,
        showOpenCTA: !filled && !isDrafting,
        showDraft: !filled && isDrafting,
      };
    }),
  }));

  // ----- classement (points) -----
  const parseMin = (t: string): number | null => {
    const m = /^(\d{1,2})[:hH.](\d{2})$/.exec((t || "").trim());
    if (!m) return null;
    const h = +m[1], mi = +m[2];
    if (h > 23 || mi > 59) return null;
    return h * 60 + mi;
  };
  // bonus rapidité : +5 / +3 / +1 aux 3 trains les plus tôt
  const speedBonus: Record<string, number> = {};
  guestsArr
    .filter((g) => g.coming === "oui" && g.trainStatus === "reserve" && parseMin(g.trainTime) !== null)
    .map((g) => ({ id: g.id, t: parseMin(g.trainTime)! }))
    .sort((a, b) => a.t - b.t)
    .forEach((g, i) => {
      const pts = [5, 3, 1][i];
      if (pts) speedBonus[g.id] = pts;
    });
  const ranking = guestsArr
    .filter((g) => g.coming === "oui")
    .map((g) => {
      const orga = Object.values(evenings).filter((ev) => ev && ev.chef === g.id).length;
      const teams = Object.values(evenings).filter((ev) => ev && ev.chef !== g.id && (ev.members || []).includes(g.id)).length;
      const trainPts = g.trainStatus === "reserve" && g.trainDay ? 5 : 0;
      const speed = speedBonus[g.id] || 0;
      const questPts = (data?.quests || []).reduce((sum, q) => sum + (q.claims.some((c) => c.guestId === g.id) ? q.points : 0), 0);
      const total = orga * 10 + teams * 4 + trainPts + speed + questPts;
      return { id: g.id, name: g.name, initials: initials(g.name), orga, teams, trainPts, speed, questPts, total };
    })
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));

  // covoiturage
  const cov: Record<string, Guest[]> = {};
  guestsArr
    .filter((g) => g.coming === "oui" && g.trainStatus === "reserve" && g.trainDay)
    .forEach((g) => {
      (cov[g.trainDay!] = cov[g.trainDay!] || []).push(g);
    });
  const carDays = DAYS.filter((D) => cov[D.id]).map((D) => ({
    dayLabel: D.dow + " " + D.d + " août",
    riders: cov[D.id].map((g) => ({ name: g.name, initials: initials(g.name), time: g.trainTime || "—", city: g.trainCity || "—" })),
  }));

  // roster
  const coming = guestsArr.filter((g) => g.coming === "oui");
  const fmtDates = (g: Guest) => {
    const a = dayNum(g.arrival),
      d = dayNum(g.departure);
    if (a && d) return a + "–" + d + " août";
    if (a) return "dès le " + a + " août";
    return "dates à venir";
  };
  const roster = coming.map((g) => ({
    name: g.name,
    initials: initials(g.name),
    dates: fmtDates(g),
    bg: hasMe && g.id === me!.id ? "#3E5226" : "#6E8B3A",
  }));

  // chat
  const chatMsgs = (data?.messages || []).map((m) => {
    const g = guest(m.guestId);
    const dt = new Date(m.ts);
    const hh = String(dt.getHours()).padStart(2, "0"),
      mm = String(dt.getMinutes()).padStart(2, "0");
    return {
      name: g ? g.name : "?",
      initials: g ? initials(g.name) : "?",
      text: m.text,
      time: hh + ":" + mm,
      bg: hasMe && g && g.id === me!.id ? "#3E5226" : "#6E8B3A",
    };
  });

  const trainDayChips = DAYS.map((D) => ({
    label: D.dow.slice(0, 3) + " " + D.d,
    onClick: () => setMe({ trainDay: D.id }),
    style: chipStyle(hasMe && me!.trainDay === D.id),
  }));
  const trainReserved = hasMe && me!.trainStatus === "reserve";

  useEffect(() => {
    if (tab === "carte") chatEndRef.current?.scrollIntoView({ block: "nearest" });
  }, [chatMsgs.length, tab]);

  // Carte interactive : présence en temps réel (avatars qui se baladent)
  useEffect(() => {
    if (tab !== "carte" || !hasMe || !store.supabase) return;
    const sb = store.supabase;
    const myId = me!.id;
    const myName = me!.name;
    const myInit = initials(me!.name);
    const ch = sb.channel("magrin-map", { config: { broadcast: { self: false } } });
    ch.on("broadcast", { event: "cursor" }, ({ payload }) => {
      const p = payload as { id: string; name?: string; initials?: string; x?: number; y?: number; active?: boolean };
      if (!p || p.id === myId) return;
      setPeers((prev) => {
        const next = { ...prev };
        if (p.active === false) delete next[p.id];
        else next[p.id] = { name: p.name || "", initials: p.initials || "?", x: p.x || 0, y: p.y || 0, ts: Date.now() };
        return next;
      });
    }).subscribe();

    const el = mapRef.current;
    let last = 0;
    const onMove = (e: PointerEvent) => {
      if (!el) return;
      const now = Date.now();
      if (now - last < 45) return;
      last = now;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      if (x < 0 || x > 1 || y < 0 || y > 1) return;
      ch.send({ type: "broadcast", event: "cursor", payload: { id: myId, name: myName, initials: myInit, x, y, active: true } });
    };
    const onLeave = () => ch.send({ type: "broadcast", event: "cursor", payload: { id: myId, active: false } });
    el?.addEventListener("pointermove", onMove);
    el?.addEventListener("pointerleave", onLeave);

    const interval = window.setInterval(() => {
      setPeers((prev) => {
        const now = Date.now();
        let changed = false;
        const next = { ...prev };
        for (const k in next) if (now - next[k].ts > 6000) { delete next[k]; changed = true; }
        return changed ? next : prev;
      });
    }, 2000);

    return () => {
      el?.removeEventListener("pointermove", onMove);
      el?.removeEventListener("pointerleave", onLeave);
      window.clearInterval(interval);
      ch.send({ type: "broadcast", event: "cursor", payload: { id: myId, active: false } });
      sb.removeChannel(ch);
      setPeers({});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, hasMe, meId]);

  /* -------------------------------- render ------------------------------- */

  return (
    <div
      style={css(
        "height:100vh; overflow:hidden; display:flex; flex-direction:column; font-family:'Cormorant Garamond',serif; color:#241B16; background:#E7E1CE; position:relative;",
      )}
    >
      {/* ============ LOGGED OUT : HERO ============ */}
      {!hasMe && (
        <div style={css("position:absolute; inset:0; overflow:hidden; background:#5b6b4a;")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/meadow-clean3.jpg"
            alt="Prairie de montagne en fleurs"
            style={css("position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center 50%;")}
          />
          <div style={css("position:absolute; inset:0; background:linear-gradient(to bottom, rgba(30,40,30,.06), rgba(30,40,30,.18));")} />

          <div style={css("position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:0 20px;")}>
            <div style={css("display:flex; align-items:center; gap:clamp(14px,2.4vw,34px); color:#fbfaf5;")}>
              <span className="mgr-hero-star" style={css("font-family:'DM Serif Display',serif; font-size:clamp(28px,5vw,64px); line-height:1; opacity:.92; transform:translateY(-.18em);")}>✳</span>
              <span className="mgr-hero-title" style={css("font-family:'DM Serif Display',serif; font-size:clamp(62px,12vw,148px); line-height:.9; letter-spacing:.01em; text-shadow:0 2px 18px rgba(20,30,20,.35);")}>magrin.</span>
              <span className="mgr-hero-star" style={css("font-family:'DM Serif Display',serif; font-size:clamp(28px,5vw,64px); line-height:1; opacity:.92; transform:translateY(-.18em);")}>✳</span>
            </div>

            <button
              onClick={() => setModalStep("invite")}
              aria-label="Ouvrir l'invitation"
              className="mgr-arrow"
              style={css(
                "margin-top:clamp(18px,3vw,34px); width:clamp(64px,7vw,86px); height:clamp(64px,7vw,86px); border-radius:50%; border:1.5px solid rgba(251,250,245,.9); background:rgba(251,250,245,.1); backdrop-filter:blur(2px); color:#fbfaf5; cursor:pointer; display:flex; align-items:center; justify-content:center; font-family:'Space Mono',monospace; font-size:15px;",
              )}
            >
              →
            </button>

            <div style={css("margin-top:clamp(16px,2.4vw,24px); font-family:'Space Mono',monospace; font-size:clamp(10px,1.3vw,12px); letter-spacing:.28em; text-transform:uppercase; color:rgba(251,250,245,.92); text-shadow:0 1px 10px rgba(20,30,20,.4);")}>
              1 — 9 août 2026 · Magrin
            </div>

            <button
              onClick={() => {
                setModalStep("login");
                setLoginErr("");
              }}
              className="mgr-ul"
              style={css("margin-top:28px; background:none; border:none; cursor:pointer; font-family:'Space Mono',monospace; font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:rgba(251,250,245,.85); text-decoration:underline; text-underline-offset:4px;")}
            >
              Déjà inscrit·e ? Se connecter
            </button>
          </div>
        </div>
      )}

      {/* ============ LOGGED IN : APP ============ */}
      {hasMe && (
        <>
          <div className="mgr-header" style={css("flex-shrink:0; display:flex; align-items:center; justify-content:space-between; gap:14px; padding:0 clamp(14px,3vw,28px); height:62px; background:#2A3A19; color:#F3EEDF; box-shadow:0 2px 16px rgba(0,0,0,.18); z-index:20;")}>
            <span className="mgr-logo" style={css("font-family:'DM Serif Display',serif; font-size:24px; line-height:1;")}>
              magrin<span style={css("color:#C9D596;")}>.</span>
            </span>
            <nav className="mgr-topnav" style={css("display:flex; gap:6px;")}>
              <button onClick={() => setActiveTab("carte")} style={tabStyle(tab === "carte")}>Carte</button>
              <button onClick={() => setActiveTab("planning")} style={tabStyle(tab === "planning")}>Planning</button>
              <button onClick={() => setActiveTab("social")} style={tabStyle(tab === "social")}>Social</button>
              <button onClick={() => setActiveTab("classement")} style={tabStyle(tab === "classement")}>Classement</button>
              <button onClick={() => setActiveTab("coins")} style={tabStyle(tab === "coins")}>🪙 Coins</button>
            </nav>
            <div style={css("display:flex; align-items:center; gap:10px;")}>
              <span style={css("width:34px; height:34px; border-radius:50%; background:#6E8B3A; color:#F3EEDF; display:flex; align-items:center; justify-content:center; font-family:'Space Mono',monospace; font-size:12px;")}>{initials(me!.name)}</span>
              <button onClick={logout} title="Se déconnecter" className="mgr-quit" style={css("background:none; border:none; cursor:pointer; font-family:'Space Mono',monospace; font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:rgba(243,238,223,.65);")}>Quitter</button>
            </div>
          </div>

          <div className="mgr-scroll" style={css("flex:1; min-height:0; overflow-y:auto; background:#E7E1CE;")}>
            {/* ----- TAB CARTE ----- */}
            {tab === "carte" && (
              <div style={css("max-width:1180px; margin:0 auto; padding:40px clamp(16px,3vw,28px) 56px")}>
                <div style={css("font-family:'Space Mono',monospace; font-size:11px; letter-spacing:.26em; color:#6E8B3A; text-transform:uppercase;")}>Le domaine</div>
                <h2 style={css("font-family:'DM Serif Display',serif; font-size:clamp(28px,4.6vw,44px); margin:6px 0 18px; line-height:1.05;")}>La carte de la ferme</h2>

                <div style={css("display:flex; flex-wrap:wrap; gap:24px; align-items:stretch;")}>
                  <div style={css("flex:1 1 420px; min-width:300px; max-width:720px;")}>
                    <p style={css("font-size:18px; line-height:1.4; color:rgba(36,40,28,.75); margin:0 0 10px;")}>Vue du ciel — le lac, le tennis, la maison, la piscine, le bar… et la guinguette au bord de l&apos;eau.</p>
                    <div style={css("display:flex; align-items:center; gap:8px; margin:0 0 14px; font-family:'Space Mono',monospace; font-size:11px; letter-spacing:.08em; color:#6E8B3A;")}>
                      <span style={css("width:8px; height:8px; border-radius:50%; background:#6E8B3A; display:inline-block;")} />
                      {Object.keys(peers).length > 0
                        ? `👀 ${Object.keys(peers).length} ami·e${Object.keys(peers).length > 1 ? "s" : ""} sur la carte en ce moment`
                        : "Balade-toi sur la carte — les autres te voient en direct 👀"}
                    </div>

                    <div ref={mapRef} style={{ ...css("position:relative; width:100%; aspect-ratio:736/770; border-radius:8px; overflow:hidden; box-shadow:0 20px 50px -28px rgba(0,0,0,.6); border:1px solid rgba(62,82,38,.25);"), touchAction: "none" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/farm-aerial.png" alt="Vue aérienne de la ferme de Magrin" style={css("position:absolute; inset:0; width:100%; height:100%; object-fit:cover;")} />

                  <div style={css("position:absolute; left:14%; top:23%; transform:translate(-50%,-50%); display:flex; flex-direction:column; align-items:center; gap:5px;")}>
                    <span style={css("background:rgba(36,58,86,.92); color:#eaf2fb; font-family:'Space Mono',monospace; font-size:10px; letter-spacing:.1em; text-transform:uppercase; padding:4px 10px; border-radius:999px; white-space:nowrap; box-shadow:0 2px 8px rgba(0,0,0,.5);")}>Le lac</span>
                    <span style={css("width:13px; height:13px; border-radius:50%; background:#79A9D0; border:2px solid #fff; box-shadow:0 1px 5px rgba(0,0,0,.6);")} />
                  </div>
                  <div style={css("position:absolute; left:19%; top:30%; transform:translate(-50%,-50%); display:flex; flex-direction:column; align-items:center; gap:5px; z-index:3;")}>
                    <span style={css("background:#C98A2B; color:#3a2408; font-family:'Space Mono',monospace; font-size:10px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; padding:5px 11px; border-radius:999px; white-space:nowrap; box-shadow:0 3px 10px rgba(0,0,0,.55);")}>✶ La guinguette</span>
                    <span style={css("width:15px; height:15px; border-radius:50%; background:#E9C46A; border:2px solid #fff; box-shadow:0 1px 6px rgba(0,0,0,.6);")} />
                  </div>
                  <div style={css("position:absolute; left:81%; top:55%; transform:translate(-50%,-50%); display:flex; flex-direction:column; align-items:center; gap:5px;")}>
                    <span style={css("background:rgba(42,58,25,.92); color:#F3EEDF; font-family:'Space Mono',monospace; font-size:10px; letter-spacing:.1em; text-transform:uppercase; padding:4px 10px; border-radius:999px; white-space:nowrap; box-shadow:0 2px 8px rgba(0,0,0,.5);")}>Tennis</span>
                    <span style={css("width:13px; height:13px; border-radius:50%; background:#C9D596; border:2px solid #fff; box-shadow:0 1px 5px rgba(0,0,0,.6);")} />
                  </div>
                  <div style={css("position:absolute; left:57%; top:69%; transform:translate(-50%,-50%); display:flex; flex-direction:column; align-items:center; gap:5px; z-index:4;")}>
                    <span style={css("background:rgba(42,58,25,.92); color:#F3EEDF; font-family:'Space Mono',monospace; font-size:10px; letter-spacing:.1em; text-transform:uppercase; padding:4px 10px; border-radius:999px; white-space:nowrap; box-shadow:0 2px 8px rgba(0,0,0,.5);")}>La grande maison</span>
                    <span style={css("width:13px; height:13px; border-radius:50%; background:#C9D596; border:2px solid #fff; box-shadow:0 1px 5px rgba(0,0,0,.6);")} />
                  </div>
                  <div style={css("position:absolute; left:54%; top:81%; transform:translate(-50%,-50%); display:flex; flex-direction:column; align-items:center; gap:5px; z-index:3;")}>
                    <span style={css("background:rgba(36,58,86,.92); color:#eaf2fb; font-family:'Space Mono',monospace; font-size:10px; letter-spacing:.1em; text-transform:uppercase; padding:4px 10px; border-radius:999px; white-space:nowrap; box-shadow:0 2px 8px rgba(0,0,0,.5);")}>La piscine</span>
                    <span style={css("width:13px; height:13px; border-radius:50%; background:#79A9D0; border:2px solid #fff; box-shadow:0 1px 5px rgba(0,0,0,.6);")} />
                  </div>
                  <div style={css("position:absolute; left:69%; top:91%; transform:translate(-50%,-50%); display:flex; flex-direction:column; align-items:center; gap:5px;")}>
                    <span style={css("background:#C98A2B; color:#3a2408; font-family:'Space Mono',monospace; font-size:10px; letter-spacing:.08em; text-transform:uppercase; padding:4px 10px; border-radius:999px; white-space:nowrap; box-shadow:0 2px 8px rgba(0,0,0,.5);")}>Le bar</span>
                    <span style={css("width:13px; height:13px; border-radius:50%; background:#E9C46A; border:2px solid #fff; box-shadow:0 1px 5px rgba(0,0,0,.6);")} />
                  </div>
                  {/* avatars des amis en temps réel */}
                  {Object.entries(peers).map(([id, p]) => (
                    <div
                      key={id}
                      style={{
                        position: "absolute",
                        left: `${p.x * 100}%`,
                        top: `${p.y * 100}%`,
                        transform: "translate(-50%,-50%)",
                        zIndex: 7,
                        pointerEvents: "none",
                        transition: "left .08s linear, top .08s linear",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "1px",
                      }}
                    >
                      <span style={css("width:28px; height:28px; border-radius:50%; background:#C98A2B; color:#3a2408; display:flex; align-items:center; justify-content:center; font-family:'Space Mono',monospace; font-size:10px; border:2px solid #fff; box-shadow:0 2px 8px rgba(0,0,0,.55);")}>{p.initials}</span>
                      <span style={css("font-family:'Caveat',cursive; font-size:15px; color:#fff; text-shadow:0 1px 4px rgba(0,0,0,.85); white-space:nowrap;")}>{p.name}</span>
                    </div>
                  ))}

                  <div style={css("position:absolute; right:12px; bottom:11px; font-family:'Space Mono',monospace; font-size:9px; letter-spacing:.16em; color:rgba(255,255,255,.9); text-transform:uppercase; background:rgba(0,0,0,.35); padding:3px 8px; border-radius:4px;")}>La ferme de Magrin · vue du ciel</div>
                </div>

                  </div>

                  {/* chat à droite de la carte */}
                  <div style={css("flex:1 1 320px; min-width:280px; display:flex; flex-direction:column;")}>
                    <div style={css("font-family:'Space Mono',monospace; font-size:11px; letter-spacing:.22em; color:#6E8B3A; text-transform:uppercase; margin:0 0 12px;")}>💬 Le fil · {(data?.messages || []).length} messages</div>
                    <div style={css("flex:1; background:#fff; border:1px solid rgba(62,82,38,.16); border-radius:6px; padding:18px; box-shadow:0 18px 44px -30px rgba(0,0,0,.5); display:flex; flex-direction:column;")}>
                      <div style={css("flex:1; display:flex; flex-direction:column; gap:16px; min-height:220px; max-height:560px; overflow-y:auto; padding-right:4px; margin-bottom:16px;")}>
                        {chatMsgs.map((m, i) => (
                          <div key={i} style={css("display:flex; gap:11px; align-items:flex-start;")}>
                            <span style={{ ...css("width:36px; height:36px; border-radius:50%; color:#F3EEDF; display:flex; align-items:center; justify-content:center; font-family:'Space Mono',monospace; font-size:12px; flex-shrink:0;"), background: m.bg }}>{m.initials}</span>
                            <div style={css("flex:1; min-width:0;")}>
                              <div style={css("display:flex; gap:8px; align-items:baseline; margin-bottom:2px;")}>
                                <span style={css("font-family:'DM Serif Display',serif; font-size:18px; color:#2A3A19;")}>{m.name}</span>
                                <span style={css("font-family:'Space Mono',monospace; font-size:10px; color:rgba(36,40,28,.4);")}>{m.time}</span>
                              </div>
                              <div style={css("font-size:18px; line-height:1.4; color:rgba(36,40,28,.85); word-break:break-word;")}>{m.text}</div>
                            </div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>
                      <div style={css("display:flex; gap:10px; border-top:1px solid rgba(62,82,38,.14); padding-top:14px;")}>
                        <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") sendChat(); }} placeholder="Écris un message…" style={css("flex:1; min-width:0; font-family:'Cormorant Garamond',serif; font-size:18px; padding:11px 14px; border:1px solid rgba(62,82,38,.3); border-radius:4px; background:#F3EEDF; color:#241B16; outline:none;")} />
                        <button onClick={sendChat} disabled={!chatInput.trim()} style={{ fontFamily: "'Space Mono',monospace", fontSize: "12px", letterSpacing: ".08em", textTransform: "uppercase", padding: "0 18px", border: "none", borderRadius: "4px", cursor: chatInput.trim() ? "pointer" : "not-allowed", background: chatInput.trim() ? "#3E5226" : "rgba(62,82,38,.3)", color: "#F3EEDF", whiteSpace: "nowrap" }}>Envoyer</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kit de survie de Magrin */}
                <h3 style={css("font-family:'DM Serif Display',serif; font-size:clamp(22px,3vw,30px); margin:42px 0 16px;")}>🎒 Ton kit de survie de Magrin</h3>
                <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); gap:16px;")}>
                  <div style={css("background:#fff; border:1px solid rgba(62,82,38,.16); border-radius:5px; padding:22px; box-shadow:0 14px 30px -22px rgba(0,0,0,.4);")}>
                    <div style={css("font-family:'Space Mono',monospace; font-size:10px; letter-spacing:.16em; color:#6E8B3A; text-transform:uppercase; margin-bottom:10px;")}>📍 L&apos;adresse</div>
                    <div style={css("font-family:'DM Serif Display',serif; font-size:22px; line-height:1.15;")}>En Sayssinel</div>
                    <div style={css("font-size:18px; line-height:1.4; color:rgba(36,40,28,.78); margin-top:6px;")}>149 chemin de Saint Salvy<br />Magrin · Tarn</div>
                  </div>
                  <div style={css("background:#fff; border:1px solid rgba(62,82,38,.16); border-radius:5px; padding:22px; box-shadow:0 14px 30px -22px rgba(0,0,0,.4);")}>
                    <div style={css("font-family:'Space Mono',monospace; font-size:10px; letter-spacing:.16em; color:#6E8B3A; text-transform:uppercase; margin-bottom:10px;")}>🚆 Le train à prendre</div>
                    <div style={css("font-family:'DM Serif Display',serif; font-size:22px; line-height:1.15;")}>Damiatte–Saint-Paul</div>
                    <div style={css("font-size:18px; line-height:1.4; color:rgba(36,40,28,.78); margin-top:6px;")}>Ligne Toulouse ↔ Castres / Mazamet. On vient te chercher — renseigne ton train dans Social.</div>
                  </div>
                  <div style={css("background:#fff; border:1px solid rgba(62,82,38,.16); border-radius:5px; padding:22px; box-shadow:0 14px 30px -22px rgba(0,0,0,.4);")}>
                    <div style={css("font-family:'Space Mono',monospace; font-size:10px; letter-spacing:.16em; color:#6E8B3A; text-transform:uppercase; margin-bottom:10px;")}>🧳 Dans la valise</div>
                    <div style={css("font-family:'DM Serif Display',serif; font-size:22px; line-height:1.15;")}>Le nécessaire</div>
                    <div style={css("font-size:18px; line-height:1.4; color:rgba(36,40,28,.78); margin-top:6px;")}>Maillot de bain, tenue de tennis, et une tenue pour les soirées à thème.</div>
                  </div>
                  <div style={css("background:#3E5226; color:#F3EEDF; border-radius:5px; padding:22px; box-shadow:0 14px 30px -22px rgba(0,0,0,.5);")}>
                    <div style={css("font-family:'Space Mono',monospace; font-size:10px; letter-spacing:.16em; color:#C9D596; text-transform:uppercase; margin-bottom:10px;")}>🏖️ Surtout</div>
                    <div style={css("font-family:'DM Serif Display',serif; font-size:22px; line-height:1.15;")}>N&apos;oublie pas ta serviette !</div>
                    <div style={css("font-size:18px; line-height:1.45; color:rgba(243,238,223,.86); margin-top:6px;")}>Piscine, lac, soleil… ta serviette est indispensable.</div>
                  </div>
                </div>
              </div>
            )}

            {/* ----- TAB PLANNING ----- */}
            {tab === "planning" && (
              <div style={css("position:relative; min-height:100%; background:#FBF7EE; overflow:hidden;")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/g-bee.png" alt="" className="mgr-garnish" style={css("position:absolute; top:30px; left:36px; width:92px; opacity:.96; pointer-events:none;")} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/g-leaf.png" alt="" style={css("position:absolute; bottom:8px; left:-26px; width:120px; opacity:.92; pointer-events:none; transform:rotate(-8deg);")} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/g-leaf.png" alt="" style={css("position:absolute; bottom:14px; right:-30px; width:130px; opacity:.92; pointer-events:none; transform:scaleX(-1) rotate(-6deg);")} />

                <div style={css("position:relative; display:flex; align-items:center; justify-content:center; gap:16px; padding:34px 20px 6px;")}>
                  <span style={css("font-family:'Caveat',cursive; font-weight:700; font-size:clamp(46px,7vw,76px); line-height:.9; color:#1d1b17;")}>Planning</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/g-hen.png" alt="" style={css("width:clamp(56px,7vw,92px); margin-top:6px;")} />
                </div>
                <div className="mgr-sponsor" style={css("position:absolute; top:34px; right:30px; display:flex; align-items:center; gap:10px;")}>
                  <span style={css("font-family:'Caveat',cursive; font-size:24px; color:#3a3733;")}>sponsored by</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/g-ghost.png" alt="" style={css("height:48px;")} />
                </div>

                <p style={css("text-align:center; font-family:'Caveat',cursive; font-size:23px; color:#6E8B3A; margin:0 0 6px;")}>Sur un créneau libre (matin, après-midi ou soir), propose une activité ou une soirée et deviens chef·fe — ou rejoins une équipe.</p>

                <div className="mgr-scroll-x" style={css("position:relative; display:flex; overflow-x:auto; padding:14px clamp(10px,2vw,24px) 60px; scroll-snap-type:x proximity;")}>
                  {days.map((day) => (
                    <div key={day.id} style={css("flex:0 0 clamp(192px,16vw,240px); scroll-snap-align:start; border-left:1px solid rgba(40,34,24,.16); padding:0 10px; min-height:560px; display:flex; flex-direction:column; gap:10px;")}>
                      <div style={css("text-align:center; font-family:'Caveat',cursive; font-weight:600; font-size:28px; color:#1d1b17; padding:8px 0 0;")}>{day.dow} {day.d}</div>

                      {day.slots.map((slot) => (
                        <div key={slot.key} style={css("background:#fff; border:1px solid rgba(0,0,0,.06); border-radius:4px; padding:9px; box-shadow:0 8px 20px -16px rgba(0,0,0,.55);")}>
                          <div style={css("font-family:'Space Mono',monospace; font-size:8.5px; letter-spacing:.12em; text-transform:uppercase; color:#6E8B3A; text-align:center; margin-bottom:6px;")}>{slot.slotIcon} {slot.slotLabel}</div>

                          {slot.filled && (
                            <div>
                              <div style={{ ...slot.coverStyle, aspectRatio: "auto", height: "140px", borderRadius: "2px", alignItems: "flex-end" }}>
                                <span style={css("font-family:'Gochi Hand',cursive; font-size:20px; line-height:1.05; color:#fff; text-shadow:0 2px 10px rgba(0,0,0,.75); padding:8px;")}>{slot.theme}</span>
                              </div>
                              <div style={css("display:flex; align-items:center; gap:6px; margin-top:7px; margin-bottom:6px;")}>
                                <span style={css("width:24px; height:24px; border-radius:50%; background:#3E5226; color:#F3EEDF; display:flex; align-items:center; justify-content:center; font-family:'Space Mono',monospace; font-size:9px; flex-shrink:0;")}>{slot.chefInitials}</span>
                                <span style={css("font-family:'Caveat',cursive; font-size:18px; line-height:1; color:#3a3733;")}>par {slot.chefName}</span>
                              </div>
                              {slot.members.length > 0 && (
                                <div style={css("display:flex; flex-wrap:wrap; gap:3px; margin-bottom:8px;")}>
                                  {slot.members.map((mb, i) => (
                                    <span key={i} title={mb.name} style={css("width:20px; height:20px; border-radius:50%; background:rgba(62,82,38,.14); color:#3E5226; display:flex; align-items:center; justify-content:center; font-family:'Space Mono',monospace; font-size:8px;")}>{mb.initials}</span>
                                  ))}
                                </div>
                              )}
                              {slot.showJoin && (
                                <button onClick={() => joinTeam(slot.key)} className="mgr-join" style={css("width:100%; font-family:'Space Mono',monospace; font-size:9px; letter-spacing:.1em; text-transform:uppercase; padding:7px; border:1px solid #3E5226; border-radius:3px; background:#3E5226; color:#F3EEDF; cursor:pointer;")}>Rejoindre</button>
                              )}
                              {slot.youAreMember && (
                                <button onClick={() => leaveTeam(slot.key)} style={css("width:100%; font-family:'Space Mono',monospace; font-size:9px; letter-spacing:.1em; text-transform:uppercase; padding:7px; border:1px solid rgba(62,82,38,.4); border-radius:3px; background:transparent; color:rgba(36,40,28,.6); cursor:pointer;")}>✓ quitter</button>
                              )}
                              {slot.youAreChef && (
                                <div style={css("display:flex; flex-direction:column; gap:5px;")}>
                                  <div style={css("font-family:'Space Mono',monospace; font-size:8.5px; letter-spacing:.08em; text-transform:uppercase; padding:6px; border:1px dashed #6B7A2C; border-radius:3px; color:#5a6724; text-align:center;")}>★ Chef·fe</div>
                                  <label style={css("display:flex; align-items:center; justify-content:center; gap:4px; font-family:'Space Mono',monospace; font-size:8px; letter-spacing:.04em; text-transform:uppercase; color:#6E8B3A; cursor:pointer;")}>
                                    📷 {slot.hasPhoto ? "Changer la photo" : "Ajouter une photo"}
                                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => onPickPhoto(e.target.files?.[0], (url) => setEveningPhoto(slot.key, url))} />
                                  </label>
                                  <button onClick={() => { if (window.confirm("Supprimer ce créneau ?")) removeEvening(slot.key); }} style={css("font-family:'Space Mono',monospace; font-size:8px; letter-spacing:.06em; text-transform:uppercase; padding:5px; border:none; border-radius:3px; background:transparent; color:#9d3b2a; cursor:pointer;")}>🗑 Supprimer</button>
                                </div>
                              )}
                            </div>
                          )}

                          {!slot.filled && slot.showOpenCTA && (
                            <div style={css("display:flex; flex-direction:column; align-items:center; text-align:center; gap:7px; padding:6px 4px;")}>
                              <div style={css("font-family:'Caveat',cursive; font-size:20px; color:rgba(36,40,28,.5); line-height:.9;")}>libre</div>
                              <button onClick={() => { setChefDraftKey(slot.key); setChefDraftTheme(""); setChefDraftPhoto(null); }} className="mgr-prop" style={css("font-family:'Space Mono',monospace; font-size:8.5px; letter-spacing:.1em; text-transform:uppercase; padding:8px 12px; border:none; border-radius:3px; background:#6E8B3A; color:#F3EEDF; cursor:pointer;")}>+ Proposer</button>
                            </div>
                          )}

                          {!slot.filled && slot.showDraft && (
                            <div style={css("display:flex; flex-direction:column; gap:7px;")}>
                              <input value={chefDraftTheme} onChange={(e) => setChefDraftTheme(e.target.value)} placeholder="Activité ou soirée…" autoFocus style={css("width:100%; font-family:'Cormorant Garamond',serif; font-size:15px; padding:7px; border:1px solid rgba(62,82,38,.4); border-radius:3px; outline:none; text-align:center;")} />
                              {chefDraftPhoto ? (
                                <div style={{ ...css("position:relative; width:100%; height:120px; border-radius:3px; background-size:cover; background-position:center;"), backgroundImage: `url(${chefDraftPhoto})` }}>
                                  <button onClick={() => setChefDraftPhoto(null)} title="Retirer la photo" style={css("position:absolute; top:3px; right:3px; width:20px; height:20px; border-radius:50%; border:none; background:rgba(0,0,0,.6); color:#fff; font-size:11px; line-height:1; cursor:pointer;")}>✕</button>
                                </div>
                              ) : (
                                <label style={css("display:flex; align-items:center; justify-content:center; gap:5px; font-family:'Space Mono',monospace; font-size:8.5px; letter-spacing:.05em; text-transform:uppercase; padding:7px; border:1px dashed rgba(62,82,38,.45); border-radius:3px; color:#6E8B3A; cursor:pointer;")}>
                                  📷 Photo
                                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => onPickPhoto(e.target.files?.[0], setChefDraftPhoto)} />
                                </label>
                              )}
                              <div style={css("display:flex; gap:6px;")}>
                                <button onClick={() => becomeChef(slot.key, chefDraftTheme, chefDraftPhoto)} style={css("flex:1; font-family:'Space Mono',monospace; font-size:9px; letter-spacing:.06em; text-transform:uppercase; padding:8px; border:none; border-radius:3px; background:#3E5226; color:#F3EEDF; cursor:pointer;")}>Valider</button>
                                <button onClick={() => { setChefDraftKey(null); setChefDraftTheme(""); setChefDraftPhoto(null); }} style={css("font-family:'Space Mono',monospace; font-size:9px; padding:8px 10px; border:1px solid rgba(62,82,38,.3); border-radius:3px; background:transparent; color:rgba(36,40,28,.55); cursor:pointer;")}>✕</button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ----- TAB SOCIAL ----- */}
            {tab === "social" && (
              <div style={css("max-width:1080px; margin:0 auto; padding:40px clamp(16px,3vw,28px) 56px")}>
                <div style={css("font-family:'Space Mono',monospace; font-size:11px; letter-spacing:.26em; color:#6E8B3A; text-transform:uppercase;")}>Entre nous</div>
                <h2 style={css("font-family:'DM Serif Display',serif; font-size:clamp(28px,4.6vw,44px); margin:6px 0 24px; line-height:1.05;")}>Ta fiche &amp; le covoiturage</h2>

                {/* ta fiche */}
                <div style={css("background:#fff; border:1px solid rgba(62,82,38,.18); border-radius:6px; padding:26px 24px; box-shadow:0 18px 44px -30px rgba(0,0,0,.5); margin-bottom:30px;")}>
                  <div style={css("font-family:'DM Serif Display',serif; font-size:26px; margin-bottom:4px;")}>Salut {me!.name} 👋</div>
                  <div style={css("font-size:18px; color:#3E5226; font-style:italic; margin-bottom:20px;")}>{meCal.summary}</div>

                  <div style={css("font-family:'Space Mono',monospace; font-size:11px; letter-spacing:.18em; color:#6E8B3A; text-transform:uppercase; margin-bottom:12px;")}>Tes dates &amp; la fréquentation · août 2026</div>
                  <div style={css("display:flex; flex-wrap:wrap; gap:18px; margin-bottom:24px;")}>
                    <div style={css("flex:1; min-width:280px; background:#F3EEDF; border:1px solid rgba(62,82,38,.16); border-radius:6px; padding:16px;")}>
                      <div style={css("text-align:center; font-family:'DM Serif Display',serif; font-size:20px; margin-bottom:2px;")}>Tes dates</div>
                      <div style={css("text-align:center; font-family:'Space Mono',monospace; font-size:9px; letter-spacing:.1em; color:rgba(36,40,28,.45); text-transform:uppercase; margin-bottom:10px;")}>clique arrivée puis départ</div>
                      <div style={css("display:grid; grid-template-columns:repeat(7,1fr); gap:2px; margin-bottom:5px;")}>
                        {WEEK_HEADERS.map((w, i) => (
                          <div key={i} style={css("text-align:center; font-family:'Space Mono',monospace; font-size:10px; color:rgba(36,40,28,.4); text-transform:uppercase; padding:3px 0;")}>{w}</div>
                        ))}
                      </div>
                      <div style={css("display:grid; grid-template-columns:repeat(7,1fr); gap:2px;")}>
                        {meCal.calCells.map((c, i) => (
                          <button key={i} onClick={c.onClick} disabled={c.disabled} style={c.style}>{c.num}</button>
                        ))}
                      </div>
                    </div>

                    <div style={css("flex:1; min-width:280px; background:#F3EEDF; border:1px solid rgba(62,82,38,.16); border-radius:6px; padding:16px;")}>
                      <div style={css("text-align:center; font-family:'DM Serif Display',serif; font-size:20px; margin-bottom:2px;")}>Qui sera là</div>
                      <div style={css("text-align:center; font-family:'Space Mono',monospace; font-size:9px; letter-spacing:.1em; color:rgba(36,40,28,.45); text-transform:uppercase; margin-bottom:10px;")}>nb de convives par jour</div>
                      <div style={css("display:grid; grid-template-columns:repeat(7,1fr); gap:2px; margin-bottom:5px;")}>
                        {WEEK_HEADERS.map((w, i) => (
                          <div key={i} style={css("text-align:center; font-family:'Space Mono',monospace; font-size:10px; color:rgba(36,40,28,.4); text-transform:uppercase; padding:3px 0;")}>{w}</div>
                        ))}
                      </div>
                      <div style={css("display:grid; grid-template-columns:repeat(7,1fr); gap:2px;")}>
                        {attendanceCells.map((c, i) => (
                          <div key={i} title={c.title} style={c.style}>{c.label}</div>
                        ))}
                      </div>
                      <div style={css("margin-top:10px; font-family:'Cormorant Garamond',serif; font-size:16px; color:#3E5226; text-align:center;")}>{attendancePeak}</div>
                    </div>
                  </div>

                  <div style={css("font-family:'Space Mono',monospace; font-size:11px; letter-spacing:.18em; color:#6E8B3A; text-transform:uppercase; margin-bottom:8px;")}>Ton train · pour le covoiturage</div>
                  <div style={css("font-size:16px; color:rgba(36,40,28,.65); font-style:italic; margin-bottom:12px;")}>Arrivée à Damiatte–Saint-Paul.</div>
                  <div style={css("display:flex; gap:10px; margin-bottom:16px; flex-wrap:wrap;")}>
                    <button onClick={() => setMe({ trainStatus: "pas" })} style={chipStyle(hasMe && me!.trainStatus === "pas")}>Pas encore réservé</button>
                    <button onClick={() => setMe({ trainStatus: "reserve" })} style={chipStyle(trainReserved)}>C&apos;est réservé !</button>
                  </div>
                  {trainReserved && (
                    <div style={css("background:#F3EEDF; border:1px solid rgba(62,82,38,.18); border-radius:4px; padding:16px; display:flex; flex-wrap:wrap; gap:18px;")}>
                      <div style={css("flex:1; min-width:180px;")}>
                        <div style={css("font-family:'Space Mono',monospace; font-size:10px; letter-spacing:.16em; color:rgba(36,40,28,.5); text-transform:uppercase; margin-bottom:8px;")}>Jour d&apos;arrivée en gare</div>
                        <div style={css("display:flex; flex-wrap:wrap; gap:6px;")}>
                          {trainDayChips.map((c, i) => (
                            <button key={i} onClick={c.onClick} style={c.style}>{c.label}</button>
                          ))}
                        </div>
                      </div>
                      <div style={css("min-width:110px;")}>
                        <div style={css("font-family:'Space Mono',monospace; font-size:10px; letter-spacing:.16em; color:rgba(36,40,28,.5); text-transform:uppercase; margin-bottom:8px;")}>Heure</div>
                        <input value={me!.trainTime || ""} onChange={(e) => setMe({ trainTime: e.target.value })} placeholder="12:48" style={css("width:90px; font-family:'Space Mono',monospace; font-size:16px; padding:8px 10px; border:1px solid rgba(62,82,38,.3); border-radius:3px; background:#fff; outline:none;")} />
                      </div>
                      <div style={css("min-width:130px;")}>
                        <div style={css("font-family:'Space Mono',monospace; font-size:10px; letter-spacing:.16em; color:rgba(36,40,28,.5); text-transform:uppercase; margin-bottom:8px;")}>Depuis</div>
                        <input value={me!.trainCity || ""} onChange={(e) => setMe({ trainCity: e.target.value })} placeholder="Paris…" style={css("width:130px; font-family:'Cormorant Garamond',serif; font-size:18px; padding:8px 10px; border:1px solid rgba(62,82,38,.3); border-radius:3px; background:#fff; outline:none;")} />
                      </div>
                    </div>
                  )}
                </div>

                {/* covoiturage */}
                <div style={css("background:#6B7A2C; color:#F3EEDF; border-radius:6px; padding:26px 24px; margin-bottom:30px;")}>
                  <div style={css("font-family:'Space Mono',monospace; font-size:11px; letter-spacing:.26em; color:#EDE8C9; text-transform:uppercase; margin-bottom:6px;")}>Covoiturage</div>
                  <h3 style={css("font-family:'DM Serif Display',serif; font-size:clamp(22px,3vw,30px); margin:0 0 16px;")}>Qui arrive quand en gare</h3>
                  {carDays.length === 0 && (
                    <div style={css("background:rgba(243,238,223,.12); border:1px dashed rgba(243,238,223,.4); border-radius:5px; padding:24px; font-size:18px; font-style:italic; color:rgba(243,238,223,.85);")}>Personne n&apos;a encore renseigné son train. Renseigne le tien dans ta fiche ci-dessus.</div>
                  )}
                  {carDays.length > 0 && (
                    <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:14px;")}>
                      {carDays.map((cd, i) => (
                        <div key={i} style={css("background:#FBF6EA; color:#241B16; border-radius:5px; padding:18px;")}>
                          <div style={css("font-family:'DM Serif Display',serif; font-size:21px; border-bottom:1px dashed rgba(62,82,38,.3); padding-bottom:9px; margin-bottom:12px;")}>{cd.dayLabel}</div>
                          <div style={css("display:flex; flex-direction:column; gap:12px;")}>
                            {cd.riders.map((r, j) => (
                              <div key={j} style={css("display:flex; align-items:center; gap:12px;")}>
                                <span style={css("width:34px; height:34px; border-radius:50%; background:#3E5226; color:#F3EEDF; display:flex; align-items:center; justify-content:center; font-family:'Space Mono',monospace; font-size:12px; flex-shrink:0;")}>{r.initials}</span>
                                <div style={css("flex:1;")}>
                                  <div style={css("font-size:19px; font-weight:600; line-height:1.05;")}>{r.name}</div>
                                  <div style={css("font-family:'Space Mono',monospace; font-size:11px; color:rgba(36,40,28,.6);")}>{r.time} · depuis {r.city}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* roster */}
                <div style={css("font-family:'Space Mono',monospace; font-size:11px; letter-spacing:.22em; color:#6E8B3A; text-transform:uppercase; margin-bottom:14px;")}>Les convives · {coming.length} confirmé·es</div>
                <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:12px;")}>
                  {roster.map((p, i) => (
                    <div key={i} style={css("display:flex; align-items:center; gap:12px; background:#fff; border:1px solid rgba(62,82,38,.14); border-radius:999px; padding:8px 16px 8px 8px;")}>
                      <span style={{ ...css("width:38px; height:38px; border-radius:50%; color:#F3EEDF; display:flex; align-items:center; justify-content:center; font-family:'Space Mono',monospace; font-size:13px; flex-shrink:0;"), background: p.bg }}>{p.initials}</span>
                      <div style={css("flex:1;")}>
                        <div style={css("font-size:19px; font-weight:600; line-height:1.05;")}>{p.name}</div>
                        <div style={css("font-family:'Space Mono',monospace; font-size:10.5px; color:rgba(36,40,28,.55);")}>{p.dates}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ----- TAB CLASSEMENT ----- */}
            {tab === "classement" && (
              <div style={css("max-width:760px; margin:0 auto; padding:40px clamp(16px,3vw,28px) 56px")}>
                <div style={css("font-family:'Space Mono',monospace; font-size:11px; letter-spacing:.26em; color:#6E8B3A; text-transform:uppercase;")}>Entre nous</div>
                <h2 style={css("font-family:'DM Serif Display',serif; font-size:clamp(28px,4.6vw,44px); margin:6px 0 4px; line-height:1.05;")}>Le classement 🏆</h2>
                <p style={css("font-size:19px; line-height:1.45; max-width:560px; color:rgba(36,40,28,.75); margin:0 0 22px;")}>Plus tu participes, plus tu gagnes de 🪙. Organise des créneaux, rejoins des équipes, et réserve ton train tôt !</p>

                <div style={css("display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:10px; margin-bottom:26px;")}>
                  <div style={css("background:#fff; border:1px solid rgba(62,82,38,.16); border-radius:6px; padding:14px;")}>
                    <div style={css("font-family:'DM Serif Display',serif; font-size:20px;")}>🍽️ +10 🪙</div>
                    <div style={css("font-size:15px; color:rgba(36,40,28,.7);")}>par créneau organisé (chef·fe)</div>
                  </div>
                  <div style={css("background:#fff; border:1px solid rgba(62,82,38,.16); border-radius:6px; padding:14px;")}>
                    <div style={css("font-family:'DM Serif Display',serif; font-size:20px;")}>🤝 +4 🪙</div>
                    <div style={css("font-size:15px; color:rgba(36,40,28,.7);")}>par équipe rejointe</div>
                  </div>
                  <div style={css("background:#fff; border:1px solid rgba(62,82,38,.16); border-radius:6px; padding:14px;")}>
                    <div style={css("font-family:'DM Serif Display',serif; font-size:20px;")}>🚗 +5 🪙</div>
                    <div style={css("font-size:15px; color:rgba(36,40,28,.7);")}>train renseigné (covoit)</div>
                  </div>
                  <div style={css("background:#fff; border:1px solid rgba(62,82,38,.16); border-radius:6px; padding:14px;")}>
                    <div style={css("font-family:'DM Serif Display',serif; font-size:20px;")}>⚡ +5/3/1 🪙</div>
                    <div style={css("font-size:15px; color:rgba(36,40,28,.7);")}>aux 3 trains réservés les plus tôt</div>
                  </div>
                </div>

                {ranking.length === 0 ? (
                  <div style={css("background:#fff; border:1px dashed rgba(62,82,38,.3); border-radius:6px; padding:24px; font-size:18px; font-style:italic; color:rgba(36,40,28,.6);")}>Pas encore de participant·es. Inscris-toi et lance-toi !</div>
                ) : (
                  <div style={css("display:flex; flex-direction:column; gap:10px;")}>
                    {ranking.map((r, i) => {
                      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "#" + (i + 1);
                      const isMe = hasMe && r.id === me!.id;
                      return (
                        <div key={r.id} style={{ ...css("display:flex; align-items:center; gap:14px; border-radius:10px; padding:14px 16px; border:1px solid rgba(62,82,38,.16);"), background: isMe ? "#EDE0C2" : "#fff", boxShadow: i < 3 ? "0 14px 30px -22px rgba(0,0,0,.45)" : "none" }}>
                          <div style={css("width:38px; text-align:center; font-family:'DM Serif Display',serif; font-size:22px; flex-shrink:0;")}>{medal}</div>
                          <span style={css("width:42px; height:42px; border-radius:50%; background:#6E8B3A; color:#F3EEDF; display:flex; align-items:center; justify-content:center; font-family:'Space Mono',monospace; font-size:14px; flex-shrink:0;")}>{r.initials}</span>
                          <div style={css("flex:1; min-width:0;")}>
                            <div style={css("font-size:20px; font-weight:600; line-height:1.1;")}>{r.name}{isMe ? " · toi" : ""}</div>
                            <div style={css("display:flex; flex-wrap:wrap; gap:8px; margin-top:3px; font-family:'Space Mono',monospace; font-size:11px; color:rgba(36,40,28,.6);")}>
                              {r.orga > 0 && <span>🍽️ {r.orga}</span>}
                              {r.teams > 0 && <span>🤝 {r.teams}</span>}
                              {r.trainPts > 0 && <span>🚗</span>}
                              {r.speed > 0 && <span>⚡ +{r.speed}</span>}
                              {r.questPts > 0 && <span>🪙 +{r.questPts}</span>}
                              {r.total === 0 && <span>en attente de 🪙…</span>}
                            </div>
                          </div>
                          <div style={css("text-align:right; flex-shrink:0;")}>
                            <div style={css("font-family:'DM Serif Display',serif; font-size:26px; line-height:1; color:#3E5226;")}>{r.total}</div>
                            <div style={css("font-family:'Space Mono',monospace; font-size:9px; letter-spacing:.14em; text-transform:uppercase; color:rgba(36,40,28,.45);")}>🪙 coins</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ----- TAB COINS (quêtes) ----- */}
            {tab === "coins" && (
              <div style={css("max-width:760px; margin:0 auto; padding:40px clamp(16px,3vw,28px) 56px")}>
                <div style={css("font-family:'Space Mono',monospace; font-size:11px; letter-spacing:.26em; color:#6E8B3A; text-transform:uppercase;")}>Get some coins</div>
                <h2 style={css("font-family:'DM Serif Display',serif; font-size:clamp(28px,4.6vw,44px); margin:6px 0 4px; line-height:1.05;")}>Les quêtes 🪙</h2>
                <p style={css("font-size:19px; line-height:1.45; max-width:560px; color:rgba(36,40,28,.75); margin:0 0 22px;")}>Fais une quête, prends une photo en preuve 📷, et empoche des 🪙 (ça compte dans le classement). Tu peux aussi créer ta propre quête si tu as fait un truc bien !</p>

                {!showQuestForm ? (
                  <button onClick={() => setShowQuestForm(true)} className="mgr-prop" style={css("font-family:'Space Mono',monospace; font-size:11px; letter-spacing:.1em; text-transform:uppercase; padding:11px 18px; border:none; border-radius:4px; background:#6E8B3A; color:#F3EEDF; cursor:pointer; margin-bottom:22px;")}>+ Créer une quête</button>
                ) : (
                  <div style={css("background:#fff; border:1px solid rgba(62,82,38,.18); border-radius:8px; padding:18px; margin-bottom:22px; display:flex; flex-direction:column; gap:10px;")}>
                    <input value={newQuestTitle} onChange={(e) => setNewQuestTitle(e.target.value)} placeholder="Titre de la quête (ex : sortir les poubelles)" style={css("width:100%; font-family:'Cormorant Garamond',serif; font-size:18px; padding:10px 12px; border:1px solid rgba(62,82,38,.3); border-radius:4px; outline:none;")} />
                    <div style={css("display:flex; gap:10px; flex-wrap:wrap;")}>
                      <label style={css("flex:1; min-width:120px; font-family:'Space Mono',monospace; font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:#6E8B3A;")}>
                        🪙 Points
                        <input type="number" min="1" max="50" value={newQuestPoints} onChange={(e) => setNewQuestPoints(e.target.value)} style={css("display:block; width:100%; margin-top:4px; font-family:'Space Mono',monospace; font-size:16px; padding:8px 10px; border:1px solid rgba(62,82,38,.3); border-radius:4px; outline:none; color:#241B16;")} />
                      </label>
                      <label style={css("flex:1; min-width:120px; font-family:'Space Mono',monospace; font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:#6E8B3A;")}>
                        Places (vide = illimité)
                        <input type="number" min="1" value={newQuestSlots} onChange={(e) => setNewQuestSlots(e.target.value)} placeholder="∞" style={css("display:block; width:100%; margin-top:4px; font-family:'Space Mono',monospace; font-size:16px; padding:8px 10px; border:1px solid rgba(62,82,38,.3); border-radius:4px; outline:none; color:#241B16;")} />
                      </label>
                    </div>
                    <div style={css("display:flex; gap:8px;")}>
                      <button onClick={addQuest} disabled={!newQuestTitle.trim()} style={ctaStyle(!newQuestTitle.trim(), true)}>Créer la quête</button>
                      <button onClick={() => setShowQuestForm(false)} style={css("font-family:'Space Mono',monospace; font-size:11px; padding:10px 14px; border:1px solid rgba(62,82,38,.3); border-radius:4px; background:transparent; color:rgba(36,40,28,.6); cursor:pointer;")}>Annuler</button>
                    </div>
                  </div>
                )}

                <div style={css("display:flex; flex-direction:column; gap:12px;")}>
                  {(data?.quests || []).map((q) => {
                    const claimed = hasMe && q.claims.some((c) => c.guestId === me!.id);
                    const full = q.slots != null && q.claims.length >= q.slots;
                    const progress = q.slots != null ? `${q.claims.length}/${q.slots} fait${q.claims.length > 1 ? "s" : ""}` : `${q.claims.length} fait${q.claims.length > 1 ? "s" : ""}`;
                    return (
                      <div key={q.id} style={css("background:#fff; border:1px solid rgba(62,82,38,.16); border-radius:8px; padding:16px 18px; box-shadow:0 14px 30px -24px rgba(0,0,0,.4);")}>
                        <div style={css("display:flex; align-items:flex-start; gap:12px;")}>
                          <div style={css("flex:1; min-width:0;")}>
                            <div style={css("font-family:'DM Serif Display',serif; font-size:21px; line-height:1.15;")}>{q.title}</div>
                            <div style={css("font-family:'Space Mono',monospace; font-size:11px; letter-spacing:.06em; color:rgba(36,40,28,.55); margin-top:3px;")}>🪙 +{q.points} · {progress}</div>
                          </div>
                          {q.createdBy && hasMe && q.createdBy === me!.id && (
                            <button onClick={() => { if (window.confirm("Supprimer cette quête ?")) removeQuest(q.id); }} title="Supprimer" style={css("background:none; border:none; cursor:pointer; font-size:14px; color:#9d3b2a; flex-shrink:0;")}>🗑</button>
                          )}
                        </div>

                        {q.claims.length > 0 && (
                          <div style={css("display:flex; flex-wrap:wrap; gap:6px; margin-top:12px;")}>
                            {q.claims.map((c, i) => {
                              const g = guest(c.guestId);
                              const ini = g ? initials(g.name) : "?";
                              return c.photo ? (
                                <div key={i} title={g ? g.name : ""} style={{ ...css("position:relative; width:54px; height:54px; border-radius:6px; background-size:cover; background-position:center; border:2px solid #fff; box-shadow:0 2px 8px rgba(0,0,0,.25);"), backgroundImage: `url(${c.photo})` }}>
                                  <span style={css("position:absolute; bottom:-4px; right:-4px; width:20px; height:20px; border-radius:50%; background:#3E5226; color:#F3EEDF; display:flex; align-items:center; justify-content:center; font-family:'Space Mono',monospace; font-size:8px; border:2px solid #fff;")}>{ini}</span>
                                </div>
                              ) : (
                                <span key={i} title={g ? g.name : ""} style={css("width:34px; height:34px; border-radius:50%; background:#6E8B3A; color:#F3EEDF; display:flex; align-items:center; justify-content:center; font-family:'Space Mono',monospace; font-size:11px;")}>{ini}</span>
                              );
                            })}
                          </div>
                        )}

                        <div style={css("margin-top:14px;")}>
                          {claimed ? (
                            <div style={css("font-family:'Space Mono',monospace; font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:#3E5226;")}>✓ Quête validée — 🪙 +{q.points}</div>
                          ) : full ? (
                            <div style={css("font-family:'Space Mono',monospace; font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:rgba(36,40,28,.45);")}>Complet — plus de place</div>
                          ) : (
                            <label className="mgr-prop" style={css("display:inline-flex; align-items:center; gap:6px; font-family:'Space Mono',monospace; font-size:11px; letter-spacing:.08em; text-transform:uppercase; padding:10px 16px; border:none; border-radius:4px; background:#3E5226; color:#F3EEDF; cursor:pointer;")}>
                              📷 Faire cette quête
                              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => onPickPhoto(e.target.files?.[0], (url) => claimQuest(q.id, url))} />
                            </label>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {(data?.quests || []).length === 0 && (
                    <div style={css("background:#fff; border:1px dashed rgba(62,82,38,.3); border-radius:6px; padding:24px; font-size:18px; font-style:italic; color:rgba(36,40,28,.6);")}>Aucune quête pour l&apos;instant. Crée la première !</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* bottom tab bar — phone only */}
          <div className="mgr-bottomnav" style={css("position:fixed; left:0; right:0; bottom:0; height:60px; background:#2A3A19; box-shadow:0 -2px 16px rgba(0,0,0,.22); z-index:30;")}>
            <button onClick={() => setActiveTab("carte")} style={bottomTabStyle(tab === "carte")}>Carte</button>
            <button onClick={() => setActiveTab("planning")} style={bottomTabStyle(tab === "planning")}>Planning</button>
            <button onClick={() => setActiveTab("social")} style={bottomTabStyle(tab === "social")}>Social</button>
            <button onClick={() => setActiveTab("classement")} style={bottomTabStyle(tab === "classement")}>🏆</button>
            <button onClick={() => setActiveTab("coins")} style={bottomTabStyle(tab === "coins")}>🪙</button>
          </div>
        </>
      )}

      {/* ============ MODAL : INVITATION ============ */}
      {modalStep === "invite" && (
        <div onClick={() => setModalStep(null)} style={css("position:fixed; inset:0; z-index:100; background:rgba(28,40,18,.66); backdrop-filter:blur(5px); display:flex; align-items:center; justify-content:center; padding:24px;")}>
          <div onClick={(e) => e.stopPropagation()} style={css("position:relative; width:100%; max-width:540px;")}>
            <div style={css("position:absolute; top:-30px; left:4%; right:4%; height:120px; background:#5b6a39; border-radius:6px 6px 0 0;")} />
            <div style={css("position:absolute; top:-30px; left:4%; right:4%; height:96px; background:#697a45; clip-path:polygon(0 0, 50% 100%, 100% 0);")} />
            <div style={css("position:relative; z-index:2; background:#F3EEDF; border-radius:4px; margin:46px 10px 0; padding:40px 36px 30px; box-shadow:0 40px 90px -30px rgba(0,0,0,.7); border:1px solid rgba(62,82,38,.18); background-image:radial-gradient(rgba(62,82,38,.04) 1px, transparent 1px); background-size:18px 18px;")}>
              <button onClick={() => setModalStep(null)} className="mgr-close" style={css("position:absolute; top:14px; right:14px; width:34px; height:34px; border-radius:50%; border:1px solid rgba(62,82,38,.3); background:transparent; color:#3E5226; font-size:15px; cursor:pointer; line-height:1; display:flex; align-items:center; justify-content:center;")}>✕</button>
              <div style={css("font-family:'Space Mono',monospace; font-size:10.5px; letter-spacing:.26em; color:#6E8B3A; text-transform:uppercase; margin-bottom:14px;")}>Sur invitation · 30 convives</div>
              <h3 style={css("font-family:'DM Serif Display',serif; font-size:clamp(28px,5vw,38px); margin:0 0 14px; line-height:1.04; color:#2A3A19;")}>Bienvenue à Magrin</h3>
              <p style={css("font-size:19px; line-height:1.5; color:rgba(36,40,28,.82); margin:0 0 22px;")}>On t&apos;attend à la ferme pour une semaine entre nous. Soirées à thème chaque soir, piscine, tennis et grandes tablées. Tu en es&nbsp;?</p>
              <div style={css("display:flex; gap:26px; flex-wrap:wrap; border-top:1px dashed rgba(62,82,38,.32); padding-top:16px; margin-bottom:24px;")}>
                <div>
                  <div style={css("font-family:'Space Mono',monospace; font-size:9.5px; letter-spacing:.16em; color:rgba(36,40,28,.5); text-transform:uppercase; margin-bottom:4px;")}>Quand</div>
                  <div style={css("font-family:'DM Serif Display',serif; font-size:20px; color:#2A3A19;")}>1 — 9 août 2026</div>
                </div>
                <div>
                  <div style={css("font-family:'Space Mono',monospace; font-size:9.5px; letter-spacing:.16em; color:rgba(36,40,28,.5); text-transform:uppercase; margin-bottom:4px;")}>Où</div>
                  <div style={css("font-family:'DM Serif Display',serif; font-size:20px; color:#2A3A19;")}>La ferme · Magrin, Tarn</div>
                </div>
              </div>
              <div style={css("display:flex; gap:12px; flex-wrap:wrap;")}>
                <button onClick={() => { setModalStep("onboard"); setObStep(1); }} className="mgr-yes" style={css("flex:2; min-width:160px; font-family:'Space Mono',monospace; font-size:13px; letter-spacing:.1em; text-transform:uppercase; padding:15px 18px; border:none; border-radius:3px; background:#3E5226; color:#F3EEDF; cursor:pointer;")}>Je viens →</button>
                <button onClick={() => setModalStep(null)} className="mgr-no" style={css("flex:1; min-width:130px; font-family:'Space Mono',monospace; font-size:13px; letter-spacing:.1em; text-transform:uppercase; padding:15px 18px; border:1.5px solid rgba(62,82,38,.5); border-radius:3px; background:transparent; color:#3E5226; cursor:pointer;")}>Je viens pas</button>
              </div>
              <div style={css("text-align:center; margin-top:16px;")}>
                <button onClick={() => { setModalStep("login"); setLoginErr(""); }} style={css("background:none; border:none; cursor:pointer; font-family:'Space Mono',monospace; font-size:10.5px; letter-spacing:.1em; text-transform:uppercase; color:rgba(62,82,38,.7); text-decoration:underline; text-underline-offset:3px;")}>Déjà un compte ? Se connecter</button>
              </div>
            </div>
            <div style={css("position:relative; z-index:3; margin-top:-40px; height:70px; background:#5b6a39; border-radius:0 0 6px 6px; clip-path:polygon(0 0, 50% 64%, 100% 0, 100% 100%, 0 100%); box-shadow:0 20px 40px -22px rgba(0,0,0,.6);")} />
          </div>
        </div>
      )}

      {/* ============ MODAL : ONBOARDING ============ */}
      {modalStep === "onboard" && (
        <div onClick={() => setModalStep(null)} style={css("position:fixed; inset:0; z-index:100; background:rgba(28,40,18,.66); backdrop-filter:blur(5px); display:flex; align-items:center; justify-content:center; padding:24px;")}>
          <div onClick={(e) => e.stopPropagation()} style={css("position:relative; width:100%; max-width:500px; background:#F3EEDF; border-radius:6px; padding:34px 34px 30px; box-shadow:0 40px 90px -30px rgba(0,0,0,.7); border:1px solid rgba(62,82,38,.18);")}>
            <button onClick={() => setModalStep(null)} className="mgr-close" style={css("position:absolute; top:14px; right:14px; width:32px; height:32px; border-radius:50%; border:1px solid rgba(62,82,38,.3); background:transparent; color:#3E5226; font-size:14px; cursor:pointer; line-height:1; display:flex; align-items:center; justify-content:center;")}>✕</button>

            <div style={css("display:flex; align-items:center; gap:8px; margin-bottom:22px;")}>
              <span style={obDot(obStep === 1, obStep > 1)}>1</span>
              <span style={css("flex:1; height:1px; background:rgba(62,82,38,.25);")} />
              <span style={obDot(obStep === 2, obStep > 2)}>2</span>
              <span style={css("flex:1; height:1px; background:rgba(62,82,38,.25);")} />
              <span style={obDot(obStep === 3, false)}>3</span>
            </div>

            {obStep === 1 && (
              <div>
                <div style={css("font-family:'Space Mono',monospace; font-size:10.5px; letter-spacing:.2em; color:#6E8B3A; text-transform:uppercase; margin-bottom:8px;")}>Étape 1 — Ton prénom</div>
                <h3 style={css("font-family:'DM Serif Display',serif; font-size:30px; margin:0 0 8px; color:#2A3A19;")}>Comment tu t&apos;appelles ?</h3>
                <input value={obName} onChange={(e) => setObName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && obName.trim()) setObStep(2); }} placeholder="Ton prénom…" style={css("width:100%; font-family:'DM Serif Display',serif; font-size:24px; padding:14px 16px; border:1.5px solid rgba(62,82,38,.3); border-radius:4px; background:#fff; color:#241B16; outline:none; margin-bottom:22px;")} />
                <button onClick={() => setObStep(2)} disabled={!obName.trim()} style={ctaStyle(!obName.trim(), false)}>Continuer →</button>
              </div>
            )}

            {obStep === 2 && (
              <div>
                <div style={css("font-family:'Space Mono',monospace; font-size:10.5px; letter-spacing:.2em; color:#6E8B3A; text-transform:uppercase; margin-bottom:8px;")}>Étape 2 — Tes dates</div>
                <h3 style={css("font-family:'DM Serif Display',serif; font-size:30px; margin:0 0 4px; color:#2A3A19;")}>Quand viens-tu ?</h3>
                <p style={css("font-size:17px; color:rgba(36,40,28,.7); margin:0 0 16px; font-style:italic;")}>Clique ton arrivée puis ton départ. Dates ouvertes : du 1ᵉʳ au 9 août.</p>
                <div style={css("background:#fff; border:1px solid rgba(62,82,38,.16); border-radius:6px; padding:16px; margin-bottom:8px;")}>
                  <div style={css("text-align:center; font-family:'DM Serif Display',serif; font-size:20px; margin-bottom:10px;")}>Août 2026</div>
                  <div style={css("display:grid; grid-template-columns:repeat(7,1fr); gap:2px; margin-bottom:5px;")}>
                    {WEEK_HEADERS.map((w, i) => (
                      <div key={i} style={css("text-align:center; font-family:'Space Mono',monospace; font-size:10px; color:rgba(36,40,28,.4); text-transform:uppercase; padding:3px 0;")}>{w}</div>
                    ))}
                  </div>
                  <div style={css("display:grid; grid-template-columns:repeat(7,1fr); gap:2px;")}>
                    {ob.calCells.map((c, i) => (
                      <button key={i} onClick={c.onClick} disabled={c.disabled} style={c.style}>{c.num}</button>
                    ))}
                  </div>
                </div>
                <div style={css("font-family:'Cormorant Garamond',serif; font-size:18px; color:#3E5226; min-height:26px; margin-bottom:18px;")}>{ob.summary}</div>
                <div style={css("display:flex; gap:10px;")}>
                  <button onClick={() => setObStep(1)} style={css("font-family:'Space Mono',monospace; font-size:12px; letter-spacing:.1em; text-transform:uppercase; padding:14px 18px; border:1.5px solid rgba(62,82,38,.4); border-radius:3px; background:transparent; color:#3E5226; cursor:pointer;")}>← Retour</button>
                  <button onClick={() => setObStep(3)} disabled={!obArr} style={ctaStyle(!obArr, true)}>Continuer →</button>
                </div>
              </div>
            )}

            {obStep === 3 && (
              <div>
                <div style={css("font-family:'Space Mono',monospace; font-size:10.5px; letter-spacing:.2em; color:#6E8B3A; text-transform:uppercase; margin-bottom:8px;")}>Étape 3 — Mot de passe</div>
                <h3 style={css("font-family:'DM Serif Display',serif; font-size:30px; margin:0 0 8px; color:#2A3A19;")}>Choisis un mot de passe</h3>
                <p style={css("font-size:18px; color:rgba(36,40,28,.7); margin:0 0 18px; font-style:italic;")}>Pour retrouver ta fiche plus tard. Au moins 3 caractères — pas besoin d&apos;email.</p>
                <input value={obPwd} onChange={(e) => setObPwd(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") createAccount(); }} type="password" placeholder="••••••" style={css("width:100%; font-family:'Space Mono',monospace; font-size:20px; padding:14px 16px; border:1.5px solid rgba(62,82,38,.3); border-radius:4px; background:#fff; color:#241B16; outline:none; margin-bottom:22px;")} />
                <div style={css("display:flex; gap:10px;")}>
                  <button onClick={() => setObStep(2)} style={css("font-family:'Space Mono',monospace; font-size:12px; letter-spacing:.1em; text-transform:uppercase; padding:14px 18px; border:1.5px solid rgba(62,82,38,.4); border-radius:3px; background:transparent; color:#3E5226; cursor:pointer;")}>← Retour</button>
                  <button onClick={createAccount} disabled={obPwd.length < 3} style={ctaStyle(obPwd.length < 3, true)}>Créer mon compte ✓</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============ MODAL : LOGIN ============ */}
      {modalStep === "login" && (
        <div onClick={() => setModalStep(null)} style={css("position:fixed; inset:0; z-index:100; background:rgba(28,40,18,.66); backdrop-filter:blur(5px); display:flex; align-items:center; justify-content:center; padding:24px;")}>
          <div onClick={(e) => e.stopPropagation()} style={css("position:relative; width:100%; max-width:440px; background:#F3EEDF; border-radius:6px; padding:34px 34px 30px; box-shadow:0 40px 90px -30px rgba(0,0,0,.7); border:1px solid rgba(62,82,38,.18);")}>
            <button onClick={() => setModalStep(null)} className="mgr-close" style={css("position:absolute; top:14px; right:14px; width:32px; height:32px; border-radius:50%; border:1px solid rgba(62,82,38,.3); background:transparent; color:#3E5226; font-size:14px; cursor:pointer; line-height:1; display:flex; align-items:center; justify-content:center;")}>✕</button>
            <div style={css("font-family:'Space Mono',monospace; font-size:10.5px; letter-spacing:.2em; color:#6E8B3A; text-transform:uppercase; margin-bottom:8px;")}>Se connecter</div>
            <h3 style={css("font-family:'DM Serif Display',serif; font-size:30px; margin:0 0 18px; color:#2A3A19;")}>Content de te revoir</h3>
            <input value={loginName} onChange={(e) => setLoginName(e.target.value)} placeholder="Ton prénom" style={css("width:100%; font-family:'DM Serif Display',serif; font-size:21px; padding:12px 14px; border:1.5px solid rgba(62,82,38,.3); border-radius:4px; background:#fff; outline:none; margin-bottom:10px;")} />
            <input value={loginPwd} onChange={(e) => setLoginPwd(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") doLogin(); }} type="password" placeholder="Mot de passe" style={css("width:100%; font-family:'Space Mono',monospace; font-size:18px; padding:12px 14px; border:1.5px solid rgba(62,82,38,.3); border-radius:4px; background:#fff; outline:none; margin-bottom:10px;")} />
            {loginErr && <div style={css("font-size:16px; color:#9d3b2a; margin-bottom:12px;")}>{loginErr}</div>}
            <button onClick={doLogin} className="mgr-dark" style={css("width:100%; font-family:'Space Mono',monospace; font-size:13px; letter-spacing:.1em; text-transform:uppercase; padding:14px; border:none; border-radius:3px; background:#3E5226; color:#F3EEDF; cursor:pointer; margin-top:6px;")}>Se connecter →</button>
            <div style={css("text-align:center; margin-top:14px;")}>
              <button onClick={() => { setModalStep("onboard"); setObStep(1); }} style={css("background:none; border:none; cursor:pointer; font-family:'Space Mono',monospace; font-size:10.5px; letter-spacing:.1em; text-transform:uppercase; color:rgba(62,82,38,.7); text-decoration:underline; text-underline-offset:3px;")}>Pas encore de compte ? Je m&apos;inscris</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
