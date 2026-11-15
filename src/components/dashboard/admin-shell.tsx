"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, Bell, BookOpen, CalendarRange, ChevronDown, Eye, LayoutDashboard, MailCheck, Menu, Moon, Plus, Search, Settings, Sun, UsersRound, X } from "lucide-react";
import { FiperLogo } from "@/components/brand/fiper-logo";
import { createClient } from "@/lib/supabase/client";
import type { DashboardIdentity } from "@/lib/auth";

const THEME_KEY = "fiper_admin_theme";

const navigation = [
  { label: "نظرة عامة", href: "/admin", icon: LayoutDashboard },
  { label: "الدورات", href: "/admin/courses", icon: BookOpen },
  { label: "التسجيلات", href: "/admin/registrations", icon: UsersRound },
  { label: "الحضور", href: "/admin/attendance", icon: CalendarRange },
  { label: "التواصل", href: "/admin/communications", icon: MailCheck },
  { label: "التقارير", href: "/admin/reports", icon: BarChart3 },
];

export function AdminShell({ children, identity, counts }: { children: React.ReactNode; identity: DashboardIdentity; counts: { registrations: number; communications: number } }) {
  const pathname = usePathname();
  const initials = identity.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  const router = useRouter();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [dark, setDark] = useState(false);
  // Day / night mode: saved choice, otherwise the computer's setting (same rule as the QC app).
  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch {}
    const isDark = saved === "dark" || (saved !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.setAttribute("data-admin-theme", isDark ? "dark" : "light");
    setDark(isDark);
  }, []);
  const toggleTheme = () => {
    const next = !dark;
    document.documentElement.setAttribute("data-admin-theme", next ? "dark" : "light");
    try { localStorage.setItem(THEME_KEY, next ? "dark" : "light"); } catch {}
    setDark(next);
  };
  const signOut = async () => { setSigningOut(true); await createClient().auth.signOut(); document.documentElement.removeAttribute("data-admin-theme"); router.replace("/login"); router.refresh(); };

  return (
    <div dir="rtl" className="min-h-screen bg-[var(--adm-page)] text-[var(--adm-ink)]">
      <aside className="fixed inset-y-0 right-0 z-40 hidden w-[252px] flex-col border-l border-white/6 bg-[var(--adm-nav)] px-4 py-5 lg:flex">
        <div className="px-2"><FiperLogo href="/admin" variant="drive" /></div>
        <div className="mt-8 flex-1">
          <p className="px-3 text-[11.5px] font-bold tracking-wider text-[#8390ad]">مساحة العمل</p>
          <nav className="mt-3 space-y-1.5" aria-label="لوحة التحكم">
            {navigation.map(({ label, href, icon: Icon }) => {
              const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
              return (
                <Link key={href} href={href} className={`flex h-12 items-center gap-3 rounded-lg px-3 text-xs font-semibold transition ${active ? "bg-[var(--adm-nav-active)] text-white shadow-[inset_3px_0_0_#c2182b]" : "text-[#b3bdd3] hover:bg-white/5 hover:text-white"}`}>
                  <Icon size={18} className={active ? "text-[var(--adm-brand)]" : ""} />
                  <span>{label}</span>
                  {(href === "/admin/registrations" ? counts.registrations : href === "/admin/communications" ? counts.communications : 0) > 0 ? <span className="latin mr-auto rounded-full bg-white/8 px-2 py-1 text-[11.5px] text-[#b3bdd3]">{href === "/admin/registrations" ? counts.registrations : counts.communications}</span> : null}
                </Link>
              );
            })}
          </nav>
          <p className="mt-8 px-3 text-[11.5px] font-bold tracking-wider text-[#8390ad]">الإدارة</p>
          <nav className="mt-3 space-y-1.5">
            <Link href="/admin/settings" className="flex h-12 items-center gap-3 rounded-lg px-3 text-xs font-semibold text-[#b3bdd3] transition hover:bg-white/5 hover:text-white"><Settings size={18} /> الإعدادات والتكاملات</Link>
          </nav>
        </div>
        <div className="relative rounded-xl border border-white/8 bg-white/[0.035] p-3">
          <button type="button" onClick={() => setAccountOpen((open) => !open)} aria-expanded={accountOpen} className="flex w-full items-center gap-3 text-right">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--adm-brand)] text-xs font-bold text-white">{initials}</span>
            <span className="min-w-0"><strong className="block truncate text-[12.5px] text-white">{identity.name}</strong><small className="latin mt-1 block text-[11.5px] text-[#8390ad]">{identity.role.toUpperCase()}</small></span>
            <ChevronDown size={14} className="mr-auto text-[#8390ad]" />
          </button>
          {accountOpen && <div className="absolute bottom-[calc(100%+8px)] right-0 left-0 rounded-lg border border-white/10 bg-[var(--adm-nav-pop)] p-2 shadow-xl"><button type="button" onClick={() => void signOut()} disabled={signingOut} className="w-full rounded-lg px-3 py-2 text-right text-[12px] font-semibold text-white hover:bg-white/10 disabled:opacity-60">{signingOut ? "جار تسجيل الخروج..." : "تسجيل الخروج"}</button></div>}
        </div>
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="قائمة لوحة التحكم">
          <button type="button" aria-label="إغلاق القائمة" onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-[var(--adm-nav)]/55" />
          <aside id="mobile-dashboard-menu" className="absolute inset-y-0 right-0 flex w-[min(84vw,280px)] flex-col bg-[var(--adm-nav)] px-4 py-5 shadow-2xl">
            <div className="flex items-start justify-between gap-2 px-2">
              <FiperLogo href="/admin" variant="drive" />
              <button type="button" aria-label="إغلاق القائمة" onClick={() => setMobileMenuOpen(false)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white/80 transition hover:bg-white/10"><X size={18} /></button>
            </div>
            <div className="mt-8 flex-1 overflow-y-auto">
              <p className="px-3 text-[11.5px] font-bold tracking-wider text-[#8390ad]">مساحة العمل</p>
              <nav className="mt-3 space-y-1.5" aria-label="لوحة التحكم">
                {navigation.map(({ label, href, icon: Icon }) => {
                  const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
                  return (
                    <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} className={`flex h-12 items-center gap-3 rounded-lg px-3 text-xs font-semibold transition ${active ? "bg-[var(--adm-nav-active)] text-white shadow-[inset_3px_0_0_#c2182b]" : "text-[#b3bdd3] hover:bg-white/5 hover:text-white"}`}>
                      <Icon size={18} className={active ? "text-[var(--adm-brand)]" : ""} />
                      <span>{label}</span>
                      {(href === "/admin/registrations" ? counts.registrations : href === "/admin/communications" ? counts.communications : 0) > 0 ? <span className="latin mr-auto rounded-full bg-white/8 px-2 py-1 text-[11.5px] text-[#b3bdd3]">{href === "/admin/registrations" ? counts.registrations : counts.communications}</span> : null}
                    </Link>
                  );
                })}
              </nav>
              <p className="mt-8 px-3 text-[11.5px] font-bold tracking-wider text-[#8390ad]">الإدارة</p>
              <nav className="mt-3 space-y-1.5">
                <Link href="/admin/settings" onClick={() => setMobileMenuOpen(false)} className="flex h-12 items-center gap-3 rounded-lg px-3 text-xs font-semibold text-[#b3bdd3] transition hover:bg-white/5 hover:text-white"><Settings size={18} /> الإعدادات والتكاملات</Link>
              </nav>
            </div>
            <div className="relative rounded-xl border border-white/8 bg-white/[0.035] p-3">
              <div className="flex items-center gap-3 text-right">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--adm-brand)] text-xs font-bold text-white">{initials}</span>
                <span className="min-w-0"><strong className="block truncate text-[12.5px] text-white">{identity.name}</strong><small className="latin mt-1 block text-[11.5px] text-[#8390ad]">{identity.role.toUpperCase()}</small></span>
              </div>
              <button type="button" onClick={() => void signOut()} disabled={signingOut} className="mt-3 w-full rounded-lg px-3 py-2 text-right text-[12px] font-semibold text-white hover:bg-white/10 disabled:opacity-60">{signingOut ? "جار تسجيل الخروج..." : "تسجيل الخروج"}</button>
            </div>
          </aside>
        </div>
      )}

      <div className="lg:pr-[252px]">
        <header className="sticky top-0 z-30 flex h-[74px] items-center border-b border-[var(--adm-line)] bg-[var(--adm-panel)]/92 px-4 backdrop-blur-xl sm:px-7">
          <button type="button" onClick={() => setMobileMenuOpen(true)} aria-expanded={mobileMenuOpen} aria-controls="mobile-dashboard-menu" className="ml-3 flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--adm-line)] lg:hidden"><Menu size={19} /></button>
          <div className="relative hidden w-full max-w-sm md:block">
            <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--adm-ink-4)]" />
            <input aria-label="البحث" placeholder="ابحث عن دورة أو مسجل..." className="h-11 w-full rounded-lg border border-[var(--adm-line)] bg-[var(--adm-panel-2)] pr-11 pl-4 text-xs placeholder:text-[var(--adm-ink-4)] focus:border-[var(--adm-focus-line)] focus:outline-none" />
          </div>
          <div className="mr-auto flex items-center gap-2.5">
            <Link href="/" target="_blank" className="hidden h-10 items-center gap-2 rounded-lg border border-[var(--adm-line)] bg-[var(--adm-panel)] px-4 text-[12px] font-bold text-[var(--adm-ink-2)] transition hover:bg-[var(--adm-panel-2)] sm:flex"><Eye size={15} /> معاينة الصفحة</Link>
            <Link href="/admin/courses/new" className="flex h-10 items-center gap-2 rounded-lg bg-[var(--adm-brand)] px-4 text-[12px] font-bold text-white shadow-[0_8px_20px_rgba(195,40,40,.18)] transition hover:bg-[var(--adm-brand-hover)]"><Plus size={16} /> دورة جديدة</Link>
            <button type="button" onClick={toggleTheme} aria-label={dark ? "الوضع النهاري" : "الوضع الليلي"} title={dark ? "الوضع النهاري" : "الوضع الليلي"} className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--adm-line)] bg-[var(--adm-panel)] text-[var(--adm-ink-2)] transition hover:bg-[var(--adm-hover)]">{dark ? <Sun size={16} /> : <Moon size={16} />}</button>
            <div className="relative"><button type="button" aria-label="الإشعارات" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((open) => !open)} className={`relative flex h-10 w-10 items-center justify-center rounded-lg border bg-[var(--adm-panel)] text-[var(--adm-ink-2)] transition ${notificationsOpen ? "border-[var(--adm-focus-line)] bg-[var(--adm-panel-2)]" : "border-[var(--adm-line)]"}`}><Bell size={16} /><span className="absolute left-2 top-2 h-2 w-2 rounded-full border-2 border-[var(--adm-panel)] bg-[var(--adm-brand)]" /></button>{notificationsOpen && <div className="absolute left-0 top-12 z-50 w-72 rounded-xl border border-[var(--adm-line)] bg-[var(--adm-panel)] p-4 text-right shadow-[0_18px_45px_rgba(15,42,61,.16)]"><div className="flex items-center justify-between"><strong className="text-[12.5px]">الإشعارات</strong><button type="button" onClick={() => setNotificationsOpen(false)} className="text-[11.5px] text-[var(--adm-blue)]">إغلاق</button></div><p className="mt-4 rounded-lg bg-[var(--adm-panel-2)] p-4 text-[11.5px] leading-5 text-[var(--adm-ink-3)]">لا توجد إشعارات جديدة الآن.</p></div>}</div>
          </div>
        </header>
        <main className="min-h-[calc(100vh-74px)] p-4 sm:p-7 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
