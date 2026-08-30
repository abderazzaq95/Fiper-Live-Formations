"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, Bell, BookOpen, CalendarRange, ChevronDown, Eye, LayoutDashboard, MailCheck, Menu, Plus, Search, Settings, UsersRound } from "lucide-react";
import { FiperLogo } from "@/components/brand/fiper-logo";
import type { DashboardIdentity } from "@/lib/auth";

const navigation = [
  { label: "نظرة عامة", href: "/admin", icon: LayoutDashboard },
  { label: "الدورات", href: "/admin/courses", icon: BookOpen },
  { label: "التسجيلات", href: "/admin/registrations", icon: UsersRound, count: "346" },
  { label: "الحضور", href: "/admin/attendance", icon: CalendarRange },
  { label: "التواصل", href: "/admin/communications", icon: MailCheck, count: "3" },
  { label: "التقارير", href: "/admin/reports", icon: BarChart3 },
];

export function AdminShell({ children, identity }: { children: React.ReactNode; identity: DashboardIdentity }) {
  const pathname = usePathname();
  const initials = identity.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <div dir="rtl" className="min-h-screen bg-[#f3f6f8] text-[#102536]">
      <aside className="fixed inset-y-0 right-0 z-40 hidden w-[252px] flex-col border-l border-white/6 bg-[#031a2d] px-4 py-5 lg:flex">
        <div className="px-2"><FiperLogo href="/admin" /></div>
        <div className="mt-8 flex-1">
          <p className="px-3 text-[9px] font-bold tracking-wider text-[#54758d]">مساحة العمل</p>
          <nav className="mt-3 space-y-1.5" aria-label="لوحة التحكم">
            {navigation.map(({ label, href, icon: Icon, count }) => {
              const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
              return (
                <Link key={href} href={href} className={`flex h-12 items-center gap-3 rounded-xl px-3 text-xs font-semibold transition ${active ? "bg-[#0d3554] text-white shadow-[inset_3px_0_0_#C32828]" : "text-[#88a2b5] hover:bg-white/5 hover:text-white"}`}>
                  <Icon size={18} className={active ? "text-[#C32828]" : ""} />
                  <span>{label}</span>
                  {count && <span className="latin mr-auto rounded-full bg-white/8 px-2 py-1 text-[9px] text-[#9bb4c6]">{count}</span>}
                </Link>
              );
            })}
          </nav>
          <p className="mt-8 px-3 text-[9px] font-bold tracking-wider text-[#54758d]">الإدارة</p>
          <nav className="mt-3 space-y-1.5">
            <Link href="/admin/settings" className="flex h-12 items-center gap-3 rounded-xl px-3 text-xs font-semibold text-[#88a2b5] transition hover:bg-white/5 hover:text-white"><Settings size={18} /> الإعدادات والتكاملات</Link>
          </nav>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C32828] text-xs font-bold text-white">{initials}</span>
            <span className="min-w-0"><strong className="block truncate text-[11px] text-white">{identity.name}</strong><small className="latin mt-1 block text-[9px] text-[#65849b]">{identity.role.toUpperCase()}</small></span>
            <ChevronDown size={14} className="mr-auto text-[#65849b]" />
          </div>
        </div>
      </aside>

      <div className="lg:pr-[252px]">
        <header className="sticky top-0 z-30 flex h-[74px] items-center border-b border-[#dce5eb] bg-white/92 px-4 backdrop-blur-xl sm:px-7">
          <button className="ml-3 flex h-10 w-10 items-center justify-center rounded-xl border border-[#dce5eb] lg:hidden" aria-label="فتح القائمة"><Menu size={19} /></button>
          <div className="relative hidden w-full max-w-sm md:block">
            <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7e94a5]" />
            <input aria-label="البحث" placeholder="ابحث عن دورة أو مسجل..." className="h-11 w-full rounded-xl border border-[#dce5eb] bg-[#f7f9fa] pr-11 pl-4 text-xs placeholder:text-[#9aabb7] focus:border-[#9ebfd5] focus:outline-none" />
          </div>
          <div className="mr-auto flex items-center gap-2.5">
            <Link href="/" target="_blank" className="hidden h-10 items-center gap-2 rounded-xl border border-[#dce5eb] bg-white px-4 text-[10px] font-bold text-[#476075] transition hover:bg-[#f5f8fa] sm:flex"><Eye size={15} /> معاينة الصفحة</Link>
            <Link href="/admin/courses/new" className="flex h-10 items-center gap-2 rounded-xl bg-[#C32828] px-4 text-[10px] font-bold text-white shadow-[0_8px_20px_rgba(195,40,40,.18)] transition hover:bg-[#A92121]"><Plus size={16} /> دورة جديدة</Link>
            <div className="relative"><button type="button" aria-label="الإشعارات" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((open) => !open)} className={`relative flex h-10 w-10 items-center justify-center rounded-xl border bg-white text-[#476075] transition ${notificationsOpen ? "border-[#8eb8d2] bg-[#f3f8fb]" : "border-[#dce5eb]"}`}><Bell size={16} /><span className="absolute left-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#C32828]" /></button>{notificationsOpen && <div className="absolute left-0 top-12 z-50 w-72 rounded-2xl border border-[#dce5eb] bg-white p-4 text-right shadow-[0_18px_45px_rgba(15,42,61,.16)]"><div className="flex items-center justify-between"><strong className="text-[11px]">الإشعارات</strong><button type="button" onClick={() => setNotificationsOpen(false)} className="text-[9px] text-[#1779b5]">إغلاق</button></div><p className="mt-4 rounded-xl bg-[#f5f8fa] p-4 text-[9px] leading-5 text-[#718695]">لا توجد إشعارات جديدة الآن.</p></div>}</div>
          </div>
        </header>
        <main className="min-h-[calc(100vh-74px)] p-4 sm:p-7 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
