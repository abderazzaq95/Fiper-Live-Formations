"use client";

import { useState } from "react";
import { CalendarDays, Clock3, MonitorPlay, Users } from "lucide-react";
import { Countdown } from "@/components/public/countdown";

type PreviewAgendaItem = { time: string; title: string; text: string };

type CourseInterfacePreviewProps = {
  title: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  registrations: number;
  startsAt: string;
  agenda: PreviewAgendaItem[];
};

const tabs = [
  { id: "details", label: "التفاصيل" },
  { id: "agenda", label: "المحاور" },
  { id: "countdown", label: "العد التنازلي" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function CourseInterfacePreview({ title, date, time, duration, location, registrations, startsAt, agenda }: CourseInterfacePreviewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("details");

  return (
    <div className="overflow-hidden border border-white/10 bg-[#15181c]/95 shadow-[0_32px_90px_rgba(0,0,0,.28)]" dir="rtl">
      <div className="flex items-center justify-between border-b border-white/8 px-5 py-4 sm:px-7">
        <div className="flex items-center gap-2" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-[#d53838]" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        </div>
        <span className="latin text-[9px] font-medium tracking-[.16em] text-white/35">FIPER LIVE / SESSION</span>
      </div>

      <div className="px-5 pt-6 sm:px-7">
        <p className="text-[10px] font-extrabold text-[#e64a4a]">الدورة القادمة</p>
        <h3 className="mt-2 text-balance text-lg font-extrabold leading-8 text-white">{title}</h3>
        <div className="mt-6 flex gap-6 border-b border-white/8">
          {tabs.map((tab) => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`relative pb-3 text-[10px] font-bold transition ${activeTab === tab.id ? "text-white" : "text-white/40 hover:text-white/70"}`}>
              {tab.label}
              {activeTab === tab.id && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-[#d53838]" />}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[285px] px-5 py-7 sm:px-7">
        {activeTab === "details" && (
          <div className="grid grid-cols-2 gap-x-7 gap-y-7">
            {[
              { icon: CalendarDays, label: "التاريخ", value: date },
              { icon: Clock3, label: "الوقت", value: `${time} · ${duration}` },
              { icon: MonitorPlay, label: "الحضور", value: location },
              { icon: Users, label: "أكدوا حضورهم", value: String(registrations), latin: true },
            ].map(({ icon: Icon, label, value, latin }) => (
              <div key={label} className="border-r border-white/10 pr-4">
                <Icon size={15} className="text-[#df4141]" />
                <span className="mt-3 block text-[9px] font-medium text-white/35">{label}</span>
                <strong className={`${latin ? "latin" : ""} mt-1.5 block text-pretty text-xs font-bold leading-6 text-white/90`}>{value}</strong>
              </div>
            ))}
          </div>
        )}

        {activeTab === "agenda" && (
          <ol className="divide-y divide-white/8">
            {agenda.slice(0, 4).map((item, index) => (
              <li key={`${item.title}-${index}`} className="flex items-center gap-4 py-3 first:pt-0">
                <span className="latin text-[10px] font-extrabold text-[#df4141]">{String(index + 1).padStart(2, "0")}</span>
                <span className="text-pretty text-[11px] font-bold text-white/85">{item.title}</span>
                <span className="mr-auto shrink-0 text-[9px] font-medium text-white/30">{item.time}</span>
              </li>
            ))}
          </ol>
        )}

        {activeTab === "countdown" && (
          <div className="flex min-h-[220px] flex-col justify-center">
            <p className="mb-5 text-center text-[10px] font-medium text-white/35">متبقي على انطلاق البث المباشر</p>
            <Countdown target={startsAt} />
          </div>
        )}
      </div>

      <a href="#register" className="flex items-center justify-between border-t border-white/8 bg-[#d53838] px-6 py-4 text-xs font-extrabold text-white transition hover:bg-[#e13c3c]">
        <span>احجز مقعدك المجاني</span><span aria-hidden="true">←</span>
      </a>
    </div>
  );
}
