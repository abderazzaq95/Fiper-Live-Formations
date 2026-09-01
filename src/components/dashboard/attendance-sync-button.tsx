"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";

export function AttendanceSyncButton({ label }: { label: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function sync() {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/admin/attendance/sync", { method: "POST" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.message === "string" ? result.message : "تعذر مزامنة الحضور.");
      window.alert(typeof result.message === "string" ? result.message : "تمت مزامنة الحضور.");
      window.location.reload();
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : "تعذر مزامنة الحضور.");
    } finally {
      setPending(false);
    }
  }

  return <div className="flex flex-col items-end gap-1"><button type="button" onClick={() => void sync()} disabled={pending} className="flex h-11 items-center gap-2 rounded-xl border border-[#dce5eb] bg-white px-4 text-[9px] font-bold text-[#536b7b] transition hover:border-[#8eb8d2] hover:bg-[#f8fbfd] disabled:cursor-wait disabled:opacity-60">{pending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}{pending ? "جارٍ المزامنة..." : label}</button>{error && <span role="alert" className="max-w-64 text-right text-[8px] leading-4 text-[#C32828]">{error}</span>}</div>;
}