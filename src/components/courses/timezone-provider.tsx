"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const labels: Record<string, string> = {
  "Asia/Baghdad": "بغداد",
  "Asia/Riyadh": "الرياض",
  "Asia/Dubai": "دبي",
  "Asia/Muscat": "مسقط",
  "Asia/Beirut": "بيروت",
  "Asia/Amman": "عمّان",
  "Europe/Istanbul": "إسطنبول",
  "Africa/Casablanca": "الدار البيضاء",
  "Europe/Berlin": "برلين",
  "Europe/Paris": "باريس",
  "Europe/London": "لندن",
};

const options = Object.entries(labels).map(([value, label]) => ({ value, label }));

type TimezoneState = { timezone: string | null; automatic: boolean; setTimezone: (value: string) => void };
const TimezoneContext = createContext<TimezoneState | null>(null);

export function TimezoneProvider({ children }: { children: ReactNode }) {
  const [timezone, setSelectedTimezone] = useState<string | null>(null);
  const [automatic, setAutomatic] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setSelectedTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Baghdad"), 0);
    return () => window.clearTimeout(timer);
  }, []);
  const value = useMemo(() => ({ timezone, automatic, setTimezone: (next: string) => { if (next === "auto") { setAutomatic(true); setSelectedTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Baghdad"); } else { setAutomatic(false); setSelectedTimezone(next); } } }), [timezone, automatic]);
  return <TimezoneContext.Provider value={value}>{children}</TimezoneContext.Provider>;
}

export function useAcademyTimezone() {
  const context = useContext(TimezoneContext);
  if (!context) throw new Error("useAcademyTimezone must be used inside TimezoneProvider");
  return context;
}

export function TimezoneSelector({ className = "" }: { className?: string }) {
  const { timezone, automatic, setTimezone } = useAcademyTimezone();
  return <label className={`flex items-center gap-2 text-xs font-semibold ${className}`}><span>التوقيت</span><select aria-label="اختر المنطقة الزمنية" value={automatic ? "auto" : timezone ?? "auto"} onChange={(event) => setTimezone(event.target.value)} className="h-10 rounded-xl border border-[#d9e2e7] bg-white px-3 text-[#071d2f] focus:border-[#c32828] focus:outline-none focus:ring-2 focus:ring-[#c32828]/20"><option value="auto">توقيتك المحلي</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

export function LocalizedCourseTime({ iso, courseTimezone, part = "time", dark = false }: { iso: string; courseTimezone?: string; part?: "date" | "time" | "full"; dark?: boolean }) {
  const { timezone, automatic } = useAcademyTimezone();
  const resolved = timezone || courseTimezone || "UTC";
  const date = new Date(iso);
  const dateText = new Intl.DateTimeFormat("ar", { timeZone: resolved, day: "numeric", month: "long", year: "numeric" }).format(date);
  const timeText = new Intl.DateTimeFormat("ar", { timeZone: resolved, hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
  const city = labels[resolved] || resolved.split("/").at(-1)?.replaceAll("_", " ") || resolved;
  const label = automatic ? `بتوقيتك المحلي (${city})` : `بتوقيت ${city}`;
  const main = part === "date" ? dateText : part === "time" ? timeText : `${dateText}، ${timeText}`;
  return <span><span className="font-semibold">{main}</span><span className={`mt-1 block text-xs ${dark ? "text-[#8daac1]" : "text-[#788894]"}`}>{timezone ? label : "جاري تحديد توقيتك المحلي"}</span></span>;
}
