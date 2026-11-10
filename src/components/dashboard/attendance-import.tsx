"use client";

import * as XLSX from "xlsx";
import { FileUp, Loader2, X } from "lucide-react";
import { useState } from "react";

type SessionOption = { id: string; label: string };
type ImportRow = { email: string; name: string; start: string; end: string; seconds: number };

const t = {
  open: "استيراد قائمة",
  title: "استيراد قائمة المشاركين",
  help: "ارفع ملف سجل Google Meet (xlsx أو csv) المُصدَّر من لوحة الإدارة. سيتم جمع مرات الدخول لكل شخص في سجل واحد.",
  session: "الدورة / الجلسة",
  choose: "اختر الجلسة",
  file: "الملف",
  run: "استيراد",
  cancel: "إغلاق",
  read: "تمت قراءة",
  rows: "صفًا",
  people: "مشاركًا مختلفًا",
  replace: "ستُستبدل بيانات الحضور الحالية لهذه الجلسة بهذه القائمة.",
  error: "تعذر استيراد القائمة.",
} as const;

function cell(row: Record<string, unknown>, ...names: string[]) {
  const keys = Object.keys(row);
  for (const name of names) {
    const key = keys.find((item) => item.trim().toLowerCase() === name.toLowerCase());
    if (key !== undefined && row[key] !== undefined && row[key] !== null && row[key] !== "") return row[key];
  }
  return "";
}

function asText(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  return String(value ?? "").trim();
}

async function readFile(file: File): Promise<ImportRow[]> {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  const rows: ImportRow[] = [];
  for (const row of raw) {
    const event = asText(cell(row, "Event", "الحدث"));
    if (event && event.toLowerCase() !== "endpoint left") continue;
    rows.push({
      email: asText(cell(row, "Actor", "Email", "البريد")),
      name: asText(cell(row, "Actor name", "Name", "الاسم")),
      start: asText(cell(row, "Start time", "Start")),
      end: asText(cell(row, "Date", "End time", "End")),
      seconds: Number(cell(row, "Duration (seconds)", "Duration")) || 0,
    });
  }
  return rows;
}

export function AttendanceImport({ sessions }: { sessions: SessionOption[] }) {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState(sessions.length === 1 ? sessions[0].id : "");
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const people = new Set(rows.map((row) => row.email.trim().toLowerCase() || row.name.trim().toLowerCase()).filter(Boolean)).size;

  async function pickFile(file: File | undefined) {
    setError("");
    setRows([]);
    setFileName("");
    if (!file) return;
    try {
      const parsed = await readFile(file);
      if (!parsed.length) throw new Error("لم يتم العثور على صفوف في الملف.");
      setRows(parsed);
      setFileName(file.name);
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : t.error);
    }
  }

  async function submit() {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/admin/attendance/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, rows }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.message === "string" ? result.message : t.error);
      window.alert(typeof result.message === "string" ? result.message : "تم الاستيراد.");
      window.location.reload();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t.error);
      setPending(false);
    }
  }

  return <>
    <button type="button" onClick={() => setOpen(true)} className="flex h-11 items-center gap-2 rounded-xl border border-[#dce5eb] bg-white px-4 text-[9px] font-bold text-[#536b7b] transition hover:border-[#8eb8d2] hover:bg-[#f8fbfd]"><FileUp size={14} />{t.open}</button>
    {open && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071d2f]/40 p-4 backdrop-blur-sm" role="presentation" onMouseDown={() => !pending && setOpen(false)}>
      <section role="dialog" aria-modal="true" aria-label={t.title} className="w-full max-w-lg rounded-3xl border border-[#dce5eb] bg-white p-6 text-right shadow-[0_24px_70px_rgba(7,29,47,.18)]" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div><h2 className="text-base font-bold text-[#071d2f]">{t.title}</h2><p className="mt-2 text-[11px] leading-6 text-[#607686]">{t.help}</p></div>
          <button type="button" onClick={() => setOpen(false)} disabled={pending} aria-label={t.cancel} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#dce5eb] text-[#607686]"><X size={16} /></button>
        </div>
        <label className="mt-5 block text-[10px] font-bold text-[#617585]" htmlFor="attendance-import-session">{t.session}</label>
        <select id="attendance-import-session" value={sessionId} onChange={(event) => setSessionId(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#dfe7ec] bg-white px-3 text-[11px] font-bold text-[#29485d]">
          <option value="">{t.choose}</option>
          {sessions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
        <label className="mt-4 block text-[10px] font-bold text-[#617585]" htmlFor="attendance-import-file">{t.file}</label>
        <input id="attendance-import-file" type="file" accept=".xlsx,.xls,.csv" onChange={(event) => void pickFile(event.target.files?.[0])} className="mt-2 block w-full rounded-xl border border-[#dfe7ec] bg-[#f8fafb] p-2 text-[11px]" />
        {rows.length > 0 && <p className="mt-3 text-[11px] leading-6 text-[#168a65]">{t.read} {rows.length} {t.rows} ({people} {t.people}) — {fileName}</p>}
        {rows.length > 0 && <p className="mt-1 text-[10px] leading-5 text-[#8a6d1d]">{t.replace}</p>}
        {error && <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] leading-5 text-[#C32828]">{error}</p>}
        <div className="mt-5 flex justify-start gap-2">
          <button type="button" onClick={() => void submit()} disabled={pending || !sessionId || !rows.length} className="flex h-11 items-center gap-2 rounded-xl bg-[#102f47] px-5 text-[11px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{pending && <Loader2 size={14} className="animate-spin" />}{t.run}</button>
          <button type="button" onClick={() => setOpen(false)} disabled={pending} className="h-11 rounded-xl border border-[#dce5eb] px-5 text-[11px] font-bold text-[#536b7b]">{t.cancel}</button>
        </div>
      </section>
    </div>}
  </>;
}
