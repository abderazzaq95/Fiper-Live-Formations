"use client";

import { useEffect, useState } from "react";

function getRemaining(target: string) {
  const distance = Math.max(0, new Date(target).getTime() - Date.now());
  return {
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor((distance / 3_600_000) % 24),
    minutes: Math.floor((distance / 60_000) % 60),
    seconds: Math.floor((distance / 1_000) % 60),
  };
}

export function Countdown({ target }: { target: string }) {
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => setRemaining(getRemaining(target));
    update();
    const timer = window.setInterval(update, 1_000);
    return () => window.clearInterval(timer);
  }, [target]);

  const items = [
    { label: "يوم", value: remaining.days },
    { label: "ساعة", value: remaining.hours },
    { label: "دقيقة", value: remaining.minutes },
    { label: "ثانية", value: remaining.seconds },
  ];

  return (
    <div className="grid grid-cols-4 gap-1 sm:gap-2" aria-label="الوقت المتبقي لانطلاق الدورة">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-white/10 bg-[#031a2d]/75 px-1.5 py-2 text-center sm:px-2 sm:py-3">
          <span className="latin block text-lg font-bold tracking-[-0.04em] text-white sm:text-2xl">
            {String(item.value).padStart(2, "0")}
          </span>
          <span className="mt-1 block text-[9px] font-medium text-[#7594ab] sm:text-[11px]">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
