"use client";

import Link from "next/link";
import { ArrowRight, Check, Eye, ImagePlus, Loader2, Plus, Save, Send, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { agenda as defaultAgenda, audience as defaultAudience, featuredCourse, learningOutcomes } from "@/lib/demo-data";
import { defaultLandingContent, type LandingContent } from "@/lib/landing-content";
import type { CourseEditorData } from "@/lib/data/courses";

const tabs = ["المحتوى", "أقسام الصفحة", "الموعد والمكان", "التسجيل", "المحاضر", "الإشعارات"];

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <label className="block"><span className="mb-2 block text-[10px] font-bold text-[#425d70]">{label}</span>{children}{hint && <span className="mt-2 block text-[8px] text-[#91a2ae]">{hint}</span>}</label>;
}

function EditableText({ label, value, onChange, multiline = false, hint }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; hint?: string }) {
  return <Field label={label} hint={hint}>{multiline ? <textarea className="min-h-20 w-full resize-y rounded-xl border border-[#dce5eb] bg-[#fafbfc] p-3 text-[10px] leading-6 focus:border-[#8eb8d2] focus:bg-white focus:outline-none" value={value} onChange={(event) => onChange(event.target.value)} /> : <input className={inputClass} value={value} onChange={(event) => onChange(event.target.value)} />}</Field>;
}
const inputClass = "h-11 w-full rounded-xl border border-[#dce5eb] bg-[#fafbfc] px-4 text-[10px] text-[#203b4e] placeholder:text-[#a5b3bc] focus:border-[#8eb8d2] focus:bg-white focus:outline-none";

function inputDateTime(value: string | undefined, timezone: string, kind: "date" | "time", fallback: string) {
  if (!value) return fallback;
  const parts = new Intl.DateTimeFormat("en", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date(value));
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return kind === "date" ? `${get("year")}-${get("month")}-${get("day")}` : `${get("hour")}:${get("minute")}`;
}


type EditableFaq = { question: string; answer: string };

type EditableOutcome = { title: string; text: string };
type EditableAgenda = { time: string; title: string; text: string };

type AssetKind = "cover" | "instructor";

export function CourseEditor({ courseId, initial, isNew = false }: { courseId: string; initial: CourseEditorData | null; isNew?: boolean }) {
  const router = useRouter();
  const course = initial ? { ...featuredCourse, title: initial.title, eyebrow: initial.eyebrow, description: initial.description, slug: initial.slug, coverImage: initial.coverPath || featuredCourse.coverImage, instructor: { ...featuredCourse.instructor, name: initial.instructor.name, role: initial.instructor.title, bio: initial.instructor.bio, image: initial.instructor.image || featuredCourse.instructor.image } } : featuredCourse;
  const session = initial?.session;
  const registrationCount = initial?.registrationCount ?? 0;
  const capacity = session?.capacity ?? 200;
  const timezoneValue = ["Europe/Berlin", "Europe/Istanbul", "Asia/Qatar", "Asia/Muscat", "Asia/Beirut", "Africa/Casablanca", "Asia/Riyadh", "Asia/Dubai", "Asia/Amman", "Asia/Baghdad"].includes(session?.timezone ?? "") ? session?.timezone ?? "Europe/Berlin" : "Europe/Berlin";
  const dateValue = inputDateTime(session?.startsAt, timezoneValue, "date", "2026-09-06");
  const startTimeValue = inputDateTime(session?.startsAt, timezoneValue, "time", "20:00");
  const endTimeValue = inputDateTime(session?.endsAt, timezoneValue, "time", "21:30");
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [deliveryType, setDeliveryType] = useState<"online" | "onsite">(() => initial?.session.deliveryType === "onsite" ? "onsite" : "online");
  const [coverImage, setCoverImage] = useState(course.coverImage ?? "");
  const [instructorImage, setInstructorImage] = useState(course.instructor.image ?? "");
  const [uploading, setUploading] = useState<AssetKind | null>(null);
  const [assetError, setAssetError] = useState("");
  const [faqItems, setFaqItems] = useState<EditableFaq[]>(() => initial?.faqs ?? []);
  const [outcomeItems, setOutcomeItems] = useState<EditableOutcome[]>(() => initial?.outcomes?.length ? initial.outcomes : learningOutcomes.map(({ title, text }) => ({ title, text })));
  const [audienceItems, setAudienceItems] = useState<string[]>(() => initial?.audience?.length ? initial.audience : defaultAudience);
  const [agendaItems, setAgendaItems] = useState<EditableAgenda[]>(() => initial?.agenda?.length ? initial.agenda : defaultAgenda);
  const [landingContent, setLandingContent] = useState<LandingContent>(() => initial?.landingContent ?? defaultLandingContent);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});

  const updateLanding = (section: keyof LandingContent, field: string, value: string) => setLandingContent((current) => ({ ...current, [section]: { ...(current[section] as Record<string, unknown>), [field]: value } } as LandingContent));


  async function uploadAsset(file: File, kind: AssetKind) {
    setUploading(kind);
    setAssetError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);
    try {
      const response = await fetch("/api/admin/courses/" + encodeURIComponent(courseId) + "/assets", { method: "POST", body: formData });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.message === "string" ? result.message : "upload_failed");
      if (kind === "cover") setCoverImage(result.url);
      else setInstructorImage(result.url);
    } catch (error) {
      setAssetError(error instanceof Error ? error.message : "تعذر رفع الصورة");
    } finally {
      setUploading(null);
    }
  }

  async function save(publish = false) {
    setSaving(true);
    setSaved(false);
    const value = (id: string, fallback = "") => draftValues[id] ?? (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null)?.value ?? fallback;
    const payload = {
      title: value("course-title", course.title),
      heroHeading: value("course-hero-heading", initial?.heroHeading ?? featuredCourse.heroHeading),
      eyebrow: value("course-eyebrow", course.eyebrow),
      description: value("course-description", course.description),
      slug: value("course-slug", course.slug),
      date: value("course-date", dateValue),
      startTime: value("course-start-time", startTimeValue),
      endTime: value("course-end-time", endTimeValue),
      timezone: value("course-timezone", timezoneValue ?? "Europe/Berlin"),
      deliveryType,
      platform: deliveryType === "online" ? "Google Meet" : "حضوري",
      meetUrl: value("course-meet-url", session?.meetUrl ?? ""),
      venueName: value("course-venue-name", session?.venueName ?? ""),
      venueAddress: value("course-venue-address", session?.venueAddress ?? ""),
      mapsUrl: value("course-maps-url", session?.mapsUrl ?? ""),
      capacity: Number(value("course-capacity", String(session?.capacity ?? 200)) || 0),
      registrationOpen: value("course-registration-open", session?.registrationOpen ? "open" : "closed") === "open",
      waitlistEnabled: true,
      instructorName: value("instructor-name", course.instructor.name),
      instructorTitle: value("instructor-title", course.instructor.role),
      instructorBio: value("instructor-bio", course.instructor.bio),
      faqs: faqItems.filter((item) => item.question.trim() && item.answer.trim()),
      outcomes: outcomeItems.filter((item) => item.title.trim() && item.text.trim()),
      audience: audienceItems.map((item) => item.trim()).filter(Boolean),
      agenda: agendaItems.filter((item) => item.time.trim() && item.title.trim() && item.text.trim()),
      landingContent,
    };
    try {
      const response = await fetch("/api/admin/courses/" + encodeURIComponent(courseId), { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, publish }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.message === "string" ? result.message : "save_failed");
      if (isNew && typeof result.id === "string") {
        router.replace(`/admin/courses/${encodeURIComponent(result.id)}`);
        return;
      }
      setSaved(true);
    } catch {
      setSaved(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1240px]" onChange={(event) => { const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement; if (target.id) setDraftValues((values) => ({ ...values, [target.id]: target.value })); }}>
      <div className="flex flex-col gap-4 border-b border-[#dce5eb] pb-6 sm:flex-row sm:items-center">
        <Link href="/admin/courses" className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dce5eb] bg-white text-[#5e7484]"><ArrowRight size={17} /></Link>
        <div><div className="flex items-center gap-2"><h1 className="text-xl font-bold sm:text-2xl">{isNew ? "إنشاء دورة جديدة" : "تعديل الدورة"}</h1>{!isNew && <span className="rounded-full bg-[#eaf8f3] px-3 py-1 text-[8px] font-bold text-[#168a65]">منشورة</span>}</div><p className="mt-1 text-[9px] text-[#8598a6]">تظهر التغييرات المنشورة تلقائياً في صفحة التسجيل.</p></div>
        <div className="mr-auto flex flex-wrap gap-2">
          <Link href={isNew ? "/" : `/courses/${encodeURIComponent(course.slug)}`} target="_blank" className="flex h-10 items-center gap-2 rounded-xl border border-[#dce5eb] bg-white px-4 text-[9px] font-bold text-[#51697a]"><Eye size={14} /> معاينة</Link>
          <button onClick={() => void save()} className="flex h-10 items-center gap-2 rounded-xl border border-[#dce5eb] bg-white px-4 text-[9px] font-bold text-[#51697a]">{saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} className="text-[#168a65]" /> : <Save size={14} />}{saving ? "جارٍ الحفظ" : saved ? "تم الحفظ" : "حفظ المسودة"}</button>
          <button onClick={() => void save(true)} disabled={saving} className="flex h-10 items-center gap-2 rounded-xl bg-[#C32828] px-4 text-[9px] font-bold text-white disabled:opacity-70"><Send size={14} /> {isNew ? "نشر الدورة" : "نشر التحديثات"}</button>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-[18px] border border-[#dfe7ec] bg-white p-1.5">
        <div className="flex min-w-max gap-1">{tabs.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-xl px-5 py-3 text-[9px] font-bold transition ${activeTab === tab ? "bg-[#0c2d46] text-white" : "text-[#718695] hover:bg-[#f3f6f8]"}`}>{tab}</button>)}</div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_290px]">
        <section className="rounded-[22px] border border-[#dfe7ec] bg-white p-5 sm:p-7">
          {activeTab === "المحتوى" && (
            <div className="space-y-6">
              <div><h2 className="text-sm font-bold">محتوى صفحة الدورة</h2><p className="mt-1 text-[9px] text-[#91a2ae]">اكتب رسالة واضحة ومحددة؛ التغييرات تبقى مسودة حتى النشر.</p></div>
              <Field label="اسم الدورة"><input id="course-title" className={inputClass} defaultValue={draftValues["course-title"] ?? (isNew ? "" : course.title)} placeholder="مثال: أساسيات التداول..." /></Field>
                            <Field label="العنوان الرئيسي للصفحة"><textarea id="course-hero-heading" className="min-h-20 w-full resize-y rounded-xl border border-[#dce5eb] bg-[#fafbfc] p-4 text-[10px] leading-6 focus:border-[#8eb8d2] focus:bg-white focus:outline-none" defaultValue={draftValues["course-hero-heading"] ?? (isNew ? featuredCourse.heroHeading : initial?.heroHeading ?? featuredCourse.heroHeading)} /></Field>
              <Field label="العبارة التعريفية"><input id="course-eyebrow" className={inputClass} defaultValue={draftValues["course-eyebrow"] ?? (isNew ? "" : course.eyebrow)} /></Field>
              <Field label="الوصف المختصر" hint="يفضل ألا يتجاوز 180 حرفاً"><textarea id="course-description" className="min-h-28 w-full resize-y rounded-xl border border-[#dce5eb] bg-[#fafbfc] p-4 text-[10px] leading-6 focus:border-[#8eb8d2] focus:bg-white focus:outline-none" defaultValue={draftValues["course-description"] ?? (isNew ? "" : course.description)} /></Field>
              <div className="space-y-3 rounded-2xl border border-[#e1e8ed] bg-[#fbfcfd] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div><h3 className="text-[11px] font-bold">الأسئلة الشائعة</h3><p className="mt-1 text-[8px] text-[#91a2ae]">أضف الأسئلة والأجوبة التي ستظهر للزوار قبل التسجيل.</p></div>
                  <button type="button" onClick={() => setFaqItems((items) => [...items, { question: "", answer: "" }])} className="flex h-9 items-center gap-1.5 rounded-lg bg-[#102f47] px-3 text-[9px] font-bold text-white"><Plus size={13} /> إضافة سؤال</button>
                </div>
                {faqItems.length === 0 && <p className="rounded-xl border border-dashed border-[#cbd9e1] px-4 py-5 text-center text-[9px] text-[#91a2ae]">لا توجد أسئلة بعد. أضف أول سؤال.</p>}
                {faqItems.map((faq, index) => <div key={index} className="space-y-3 rounded-xl border border-[#dce5eb] bg-white p-4">
                  <div className="flex items-center justify-between"><span className="text-[9px] font-bold text-[#607686]">سؤال {index + 1}</span><button type="button" onClick={() => setFaqItems((items) => items.filter((_, itemIndex) => itemIndex !== index))} aria-label="حذف السؤال" className="text-[#C32828]"><Trash2 size={14} /></button></div>
                  <input className={inputClass} value={faq.question} onChange={(event) => setFaqItems((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, question: event.target.value } : item))} placeholder="مثال: هل الدورة مناسبة للمبتدئين؟" />
                  <textarea className="min-h-20 w-full resize-y rounded-xl border border-[#dce5eb] bg-[#fafbfc] p-3 text-[10px] leading-6 focus:border-[#8eb8d2] focus:bg-white focus:outline-none" value={faq.answer} onChange={(event) => setFaqItems((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, answer: event.target.value } : item))} placeholder="اكتب الإجابة هنا..." />
                </div>)}
              </div>{assetError && <p className="rounded-xl border border-[#f0c5c5] bg-[#fff6f6] p-3 text-[9px] text-[#a51f1f]">{assetError}</p>}              <div className="grid gap-4 sm:grid-cols-2"><Field label="عنوان زر التسجيل"><input className={inputClass} defaultValue="احجز مقعدك المجاني" /></Field><Field label="الرابط المختصر" hint="يتم تعيينه تلقائياً ولا يمكن تغييره"><div className="flex" dir="ltr"><span className="flex h-11 items-center rounded-l-xl border border-r-0 border-[#dce5eb] bg-[#f0f4f6] px-3 text-[8px] text-[#7f929f]">/courses/</span><input className={`${inputClass} rounded-l-none`} id="course-slug" defaultValue={draftValues["course-slug"] ?? (isNew ? "idXX" : course.slug)} readOnly aria-readonly="true" /></div></Field></div>
              <div><span className="mb-2 block text-[10px] font-bold text-[#425d70]">صورة الغلاف</span><label htmlFor="course-cover-file" className="relative flex min-h-32 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#b9cbd6] bg-[#f8fafb] text-[#7890a0] transition hover:border-[#6fa6c8] hover:bg-[#f3f8fb]">{coverImage && <span className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url("${coverImage}")` }} />}{uploading === "cover" ? <Loader2 size={22} className="relative animate-spin" /> : <ImagePlus size={22} className="relative" />}<span className="relative mt-3 text-[9px] font-bold">{uploading === "cover" ? "جارٍ رفع الصورة" : coverImage ? "تغيير صورة الغلاف" : "اسحب الصورة هنا أو اختر ملفاً"}</span><small className="relative mt-1 text-[8px]">PNG, JPG أو WebP · حتى 5MB</small></label><input id="course-cover-file" type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadAsset(file, "cover"); event.currentTarget.value = ""; }} /></div>
            </div>
          )}
                    {activeTab === tabs[1] && (
            <div className="space-y-8">
              <div><h2 className="text-sm font-bold">محتوى الصفحة العامة</h2><p className="mt-1 text-[9px] text-[#91a2ae]">عدّل كل النصوص والبطاقات الظاهرة في صفحة الدورة من مكان واحد.</p></div>
              <div className="space-y-4 rounded-2xl border border-[#e1e8ed] bg-[#fbfcfd] p-4"><h3 className="text-[11px] font-bold">الشريط الرئيسي</h3><div className="grid gap-4 sm:grid-cols-2"><EditableText label="رابط عن الدورة" value={landingContent.hero.navAbout} onChange={(value) => updateLanding("hero", "navAbout", value)} /><EditableText label="رابط المحاور" value={landingContent.hero.navAgenda} onChange={(value) => updateLanding("hero", "navAgenda", value)} /><EditableText label="رابط المحاضر" value={landingContent.hero.navInstructor} onChange={(value) => updateLanding("hero", "navInstructor", value)} /><EditableText label="رابط الأسئلة" value={landingContent.hero.navFaq} onChange={(value) => updateLanding("hero", "navFaq", value)} /><EditableText label="زر التسجيل الرئيسي" value={landingContent.hero.primaryCta} onChange={(value) => updateLanding("hero", "primaryCta", value)} /><EditableText label="زر استكشاف المحاور" value={landingContent.hero.secondaryCta} onChange={(value) => updateLanding("hero", "secondaryCta", value)} /><EditableText label="ميزة أولى" value={landingContent.hero.benefitOne} onChange={(value) => updateLanding("hero", "benefitOne", value)} /><EditableText label="ميزة ثانية" value={landingContent.hero.benefitTwo} onChange={(value) => updateLanding("hero", "benefitTwo", value)} /></div></div>
              <div className="space-y-4 rounded-2xl border border-[#e1e8ed] bg-[#fbfcfd] p-4"><h3 className="text-[11px] font-bold">قسم ماذا ستخرج به؟</h3><div className="grid gap-4 sm:grid-cols-2"><EditableText label="العبارة التعريفية" value={landingContent.about.eyebrow} onChange={(value) => updateLanding("about", "eyebrow", value)} /><EditableText label="العنوان" value={landingContent.about.title} onChange={(value) => updateLanding("about", "title", value)} /><EditableText label="الوصف" value={landingContent.about.description} onChange={(value) => updateLanding("about", "description", value)} multiline /><EditableText label="نص شارة المدة" value={landingContent.about.durationLabel} onChange={(value) => updateLanding("about", "durationLabel", value)} /></div></div>
              <div className="space-y-4 rounded-2xl border border-[#e1e8ed] bg-[#fbfcfd] p-4"><div className="flex items-center justify-between"><h3 className="text-[11px] font-bold">بطاقات النتائج</h3><button type="button" onClick={() => setOutcomeItems((items) => [...items, { title: "", text: "" }])} className="flex h-9 items-center gap-1.5 rounded-lg bg-[#102f47] px-3 text-[9px] font-bold text-white"><Plus size={13} /> إضافة بطاقة</button></div>{outcomeItems.map((item, index) => <div key={index} className="grid gap-3 rounded-xl border border-[#dce5eb] bg-white p-4 sm:grid-cols-[1fr_1fr_auto]"><EditableText label={`البطاقة ${index + 1}`} value={item.title} onChange={(value) => setOutcomeItems((items) => items.map((row, rowIndex) => rowIndex === index ? { ...row, title: value } : row))} /><EditableText label="الوصف" value={item.text} onChange={(value) => setOutcomeItems((items) => items.map((row, rowIndex) => rowIndex === index ? { ...row, text: value } : row))} multiline /><button type="button" onClick={() => setOutcomeItems((items) => items.filter((_, rowIndex) => rowIndex !== index))} className="self-start pt-7 text-[#C32828]" aria-label="حذف البطاقة"><Trash2 size={15} /></button></div>)}</div>
              <div className="space-y-4 rounded-2xl border border-[#e1e8ed] bg-[#fbfcfd] p-4"><h3 className="text-[11px] font-bold">قسم هل هذه الدورة لك؟</h3><div className="grid gap-4 sm:grid-cols-2"><EditableText label="العبارة التعريفية" value={landingContent.audience.eyebrow} onChange={(value) => updateLanding("audience", "eyebrow", value)} /><EditableText label="العنوان" value={landingContent.audience.title} onChange={(value) => updateLanding("audience", "title", value)} /><EditableText label="الوصف" value={landingContent.audience.description} onChange={(value) => updateLanding("audience", "description", value)} multiline /><EditableText label="شارة القسم" value={landingContent.audience.badgeLabel} onChange={(value) => updateLanding("audience", "badgeLabel", value)} /><EditableText label="النص الكبير" value={landingContent.audience.badgeTitle} onChange={(value) => updateLanding("audience", "badgeTitle", value)} multiline /></div><div className="grid gap-3 sm:grid-cols-3">{landingContent.audience.stats.map((stat, index) => <div key={index} className="rounded-xl border border-[#dce5eb] bg-white p-3"><EditableText label={`إحصائية ${index + 1}`} value={stat.value} onChange={(value) => setLandingContent((current) => ({ ...current, audience: { ...current.audience, stats: current.audience.stats.map((row, rowIndex) => rowIndex === index ? { ...row, value } : row) } }))} /><EditableText label="الوصف" value={stat.label} onChange={(value) => setLandingContent((current) => ({ ...current, audience: { ...current.audience, stats: current.audience.stats.map((row, rowIndex) => rowIndex === index ? { ...row, label: value } : row) } }))} /></div>)}</div></div>
              <div className="space-y-4 rounded-2xl border border-[#e1e8ed] bg-[#fbfcfd] p-4"><h3 className="text-[11px] font-bold">برنامج الدورة</h3><div className="grid gap-4 sm:grid-cols-2"><EditableText label="العبارة التعريفية" value={landingContent.agenda.eyebrow} onChange={(value) => updateLanding("agenda", "eyebrow", value)} /><EditableText label="العنوان" value={landingContent.agenda.title} onChange={(value) => updateLanding("agenda", "title", value)} /><EditableText label="الوصف" value={landingContent.agenda.description} onChange={(value) => updateLanding("agenda", "description", value)} multiline /></div><div className="flex items-center justify-between"><h4 className="text-[10px] font-bold">محاور البرنامج</h4><button type="button" onClick={() => setAgendaItems((items) => [...items, { time: "", title: "", text: "" }])} className="flex h-9 items-center gap-1.5 rounded-lg bg-[#102f47] px-3 text-[9px] font-bold text-white"><Plus size={13} /> إضافة محور</button></div>{agendaItems.map((item, index) => <div key={index} className="grid gap-3 rounded-xl border border-[#dce5eb] bg-white p-4 sm:grid-cols-[130px_1fr_auto]"><EditableText label="المدة" value={item.time} onChange={(value) => setAgendaItems((items) => items.map((row, rowIndex) => rowIndex === index ? { ...row, time: value } : row))} /><div className="space-y-3"><EditableText label="العنوان" value={item.title} onChange={(value) => setAgendaItems((items) => items.map((row, rowIndex) => rowIndex === index ? { ...row, title: value } : row))} /><EditableText label="الوصف" value={item.text} onChange={(value) => setAgendaItems((items) => items.map((row, rowIndex) => rowIndex === index ? { ...row, text: value } : row))} multiline /></div><button type="button" onClick={() => setAgendaItems((items) => items.filter((_, rowIndex) => rowIndex !== index))} className="self-start pt-7 text-[#C32828]" aria-label="حذف المحور"><Trash2 size={15} /></button></div>)}</div>
              <div className="space-y-4 rounded-2xl border border-[#e1e8ed] bg-[#fbfcfd] p-4"><h3 className="text-[11px] font-bold">المحاضر والشارات</h3><div className="grid gap-4 sm:grid-cols-2"><EditableText label="العبارة التعريفية" value={landingContent.instructor.eyebrow} onChange={(value) => updateLanding("instructor", "eyebrow", value)} /><EditableText label="قيمة الخبرة" value={landingContent.instructor.yearsValue} onChange={(value) => updateLanding("instructor", "yearsValue", value)} /><EditableText label="وصف الخبرة" value={landingContent.instructor.yearsLabel} onChange={(value) => updateLanding("instructor", "yearsLabel", value)} /><EditableText label="القيمة المباشرة" value={landingContent.instructor.liveValue} onChange={(value) => updateLanding("instructor", "liveValue", value)} /><EditableText label="وصف الإجابات المباشرة" value={landingContent.instructor.liveLabel} onChange={(value) => updateLanding("instructor", "liveLabel", value)} /></div></div>
              <div className="space-y-4 rounded-2xl border border-[#e1e8ed] bg-[#fbfcfd] p-4"><h3 className="text-[11px] font-bold">الأسئلة والتسجيل</h3><div className="grid gap-4 sm:grid-cols-2"><EditableText label="عبارة الأسئلة" value={landingContent.faq.eyebrow} onChange={(value) => updateLanding("faq", "eyebrow", value)} /><EditableText label="عنوان الأسئلة" value={landingContent.faq.title} onChange={(value) => updateLanding("faq", "title", value)} /><EditableText label="عبارة التسجيل" value={landingContent.registration.eyebrow} onChange={(value) => updateLanding("registration", "eyebrow", value)} /><EditableText label="عنوان التسجيل" value={landingContent.registration.title} onChange={(value) => updateLanding("registration", "title", value)} /><EditableText label="وصف التسجيل" value={landingContent.registration.description} onChange={(value) => updateLanding("registration", "description", value)} multiline /><EditableText label="عنوان نموذج التسجيل" value={landingContent.registration.formTitle} onChange={(value) => updateLanding("registration", "formTitle", value)} /><EditableText label="وصف نموذج التسجيل" value={landingContent.registration.formDescription} onChange={(value) => updateLanding("registration", "formDescription", value)} /></div></div>
              <div className="space-y-4 rounded-2xl border border-[#e1e8ed] bg-[#fbfcfd] p-4"><h3 className="text-[11px] font-bold">التذييل</h3><div className="grid gap-4 sm:grid-cols-2"><EditableText label="إخلاء المسؤولية" value={landingContent.footer.disclaimer} onChange={(value) => updateLanding("footer", "disclaimer", value)} multiline /><EditableText label="رابط الخصوصية" value={landingContent.footer.privacyLabel} onChange={(value) => updateLanding("footer", "privacyLabel", value)} /><EditableText label="رابط الشروط" value={landingContent.footer.termsLabel} onChange={(value) => updateLanding("footer", "termsLabel", value)} /></div></div>
            </div>
          )}{activeTab === "الموعد والمكان" && (
            <div className="space-y-6"><div><h2 className="text-sm font-bold">موعد ومكان الدورة</h2><p className="mt-1 text-[9px] text-[#91a2ae]">سيعاد جدولة التذكيرات تلقائياً عند تغيير الموعد.</p></div><div className="grid gap-4 sm:grid-cols-2"><Field label="التاريخ"><input id="course-date" type="date" className={inputClass} defaultValue={draftValues["course-date"] ?? dateValue} /></Field><Field label="وقت البداية"><input id="course-start-time" type="time" className={inputClass} defaultValue={draftValues["course-start-time"] ?? startTimeValue} /></Field><Field label="وقت النهاية"><input id="course-end-time" type="time" className={inputClass} defaultValue={draftValues["course-end-time"] ?? endTimeValue} /></Field><Field label="المنطقة الزمنية"><select id="course-timezone" className={inputClass} defaultValue={draftValues["course-timezone"] ?? timezoneValue}><option value="Europe/Berlin">ألمانيا · Berlin</option><option value="Europe/Istanbul">تركيا · Istanbul</option><option value="Asia/Qatar">قطر · Doha</option><option value="Asia/Muscat">عمان · Muscat</option><option value="Asia/Beirut">لبنان · Beirut</option><option value="Africa/Casablanca">المغرب · Casablanca</option><option value="Asia/Riyadh">السعودية · Riyadh</option><option value="Asia/Dubai">الإمارات · Dubai</option><option value="Asia/Amman">الأردن · Amman</option><option value="Asia/Baghdad">العراق · Baghdad</option></select></Field></div><Field label="نوع الدورة"><div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => setDeliveryType("online")} className={`rounded-xl p-4 text-[10px] font-bold transition ${deliveryType === "online" ? "border-2 border-[#1779b5] bg-[#edf7fd] text-[#126a9e]" : "border border-[#dce5eb] text-[#6c8190] hover:border-[#8eb8d2]"}`}>أونلاين</button><button type="button" onClick={() => setDeliveryType("onsite")} className={`rounded-xl p-4 text-[10px] font-bold transition ${deliveryType === "onsite" ? "border-2 border-[#1779b5] bg-[#edf7fd] text-[#126a9e]" : "border border-[#dce5eb] text-[#6c8190] hover:border-[#8eb8d2]"}`}>حضورية</button></div></Field><Field label="رابط Google Meet"><input id="course-meet-url" className={inputClass} dir="ltr" defaultValue={draftValues["course-meet-url"] ?? (session?.meetUrl ?? "")} placeholder="سيتم إنشاؤه عند ربط Google Calendar" /></Field>{deliveryType === "onsite" && <div className="grid gap-4 sm:grid-cols-2"><Field label="اسم المكان"><input id="course-venue-name" className={inputClass} defaultValue={draftValues["course-venue-name"] ?? (session?.venueName ?? "")} /></Field><Field label="العنوان"><input id="course-venue-address" className={inputClass} defaultValue={draftValues["course-venue-address"] ?? (session?.venueAddress ?? "")} /></Field><Field label="رابط Google Maps"><input id="course-maps-url" className={inputClass} dir="ltr" defaultValue={draftValues["course-maps-url"] ?? (session?.mapsUrl ?? "")} placeholder="https://maps.google.com/..." /></Field></div>}</div>
          )}
          {activeTab === "التسجيل" && (
            <div className="space-y-6"><div><h2 className="text-sm font-bold">قواعد التسجيل والسعة</h2><p className="mt-1 text-[9px] text-[#91a2ae]">تطبق هذه القواعد على كل تسجيل جديد فوراً.</p></div><div className="grid gap-4 sm:grid-cols-2"><Field label="الحد الأقصى للمقاعد"><input id="course-capacity" type="number" className={inputClass} defaultValue={draftValues["course-capacity"] ?? (session?.capacity ?? 200)} /></Field><Field label="حالة التسجيل"><select id="course-registration-open" className={inputClass} defaultValue={draftValues["course-registration-open"] ?? (session?.registrationOpen ? "open" : "closed")}><option value="open">مفتوح</option><option>مغلق</option><option>مؤجل</option></select></Field></div>{["تفعيل قائمة الانتظار عند اكتمال المقاعد","منع التسجيل المكرر بالبريد أو الهاتف","إرسال تأكيد فوري بعد التسجيل"].map((option) => <label key={option} className="flex items-center justify-between rounded-2xl border border-[#e1e8ed] p-4 text-[10px] font-bold"><span>{option}</span><input type="checkbox" defaultChecked className="h-4 w-4 accent-[#C32828]" /></label>)}</div>
          )}
          {activeTab === "المحاضر" && (
            <div className="space-y-6"><div><h2 className="text-sm font-bold">بيانات المحاضر</h2></div><div className="grid gap-4 sm:grid-cols-2"><Field label="الاسم الكامل"><input id="instructor-name" className={inputClass} defaultValue={draftValues["instructor-name"] ?? course.instructor.name} /></Field><Field label="المسمى المهني"><input id="instructor-title" className={inputClass} defaultValue={draftValues["instructor-title"] ?? course.instructor.role} /></Field></div><Field label="نبذة تعريفية"><textarea id="instructor-bio" className="min-h-28 w-full rounded-xl border border-[#dce5eb] bg-[#fafbfc] p-4 text-[10px] leading-6" defaultValue={draftValues["instructor-bio"] ?? course.instructor.bio} /></Field><div><span className="mb-2 block text-[10px] font-bold text-[#425d70]">صورة المحاضر</span><label htmlFor="instructor-image-file" className="relative flex h-24 cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-2xl border border-dashed border-[#b9cbd6] bg-[#f8fafb] text-[9px] font-bold text-[#7890a0]">{instructorImage && <span className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url("${instructorImage}")` }} />}{uploading === "instructor" ? <Loader2 size={18} className="relative animate-spin" /> : <ImagePlus size={18} className="relative" />}<span className="relative">{uploading === "instructor" ? "جارٍ رفع الصورة" : instructorImage ? "تغيير الصورة" : "رفع صورة احترافية"}</span></label><input id="instructor-image-file" type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadAsset(file, "instructor"); event.currentTarget.value = ""; }} /></div></div>
          )}
          {activeTab === "الإشعارات" && (
            <div className="space-y-4"><div><h2 className="text-sm font-bold">رحلة التواصل</h2><p className="mt-1 text-[9px] text-[#91a2ae]">يمكن تعديل النصوص من صفحة التواصل.</p></div>{["تأكيد التسجيل · فوراً","تذكير أول · قبل يوم","تذكير يوم الدورة · صباحاً","رابط الدخول · قبل 10 دقائق"].map((item, i) => <div key={item} className="flex items-center gap-4 rounded-2xl border border-[#e1e8ed] p-4"><span className="latin flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf4f8] text-[10px] font-bold text-[#1779b5]">0{i + 1}</span><strong className="text-[10px]">{item}</strong><span className="mr-auto rounded-full bg-[#eaf8f3] px-3 py-1 text-[8px] font-bold text-[#168a65]">مفعّل</span></div>)}</div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-[22px] border border-[#dfe7ec] bg-white p-5"><div className="flex items-center gap-2"><Sparkles size={16} className="text-[#C32828]" /><h3 className="text-[11px] font-bold">جودة الصفحة</h3></div><div className="mt-5 flex items-center gap-4"><div className="latin flex h-14 w-14 items-center justify-center rounded-full border-[5px] border-[#32b886] text-sm font-bold">92</div><p className="text-[9px] leading-5 text-[#718695]">المحتوى مكتمل وجاهز للنشر. أضف صورة المحاضر الأصلية لاحقاً.</p></div></div>
          <div className="rounded-[22px] bg-[#082943] p-5 text-white"><p className="text-[9px] font-bold text-[#7ea0b7]">ملخص مباشر</p><h3 className="mt-3 text-sm font-bold leading-6">{course.title}</h3><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-[#C32828]" style={{ width: `${capacity ? Math.min(100, (registrationCount / capacity) * 100) : 0}%` }} /></div><p className="latin mt-3 text-[9px] text-[#7ea0b7]">{registrationCount} / {capacity} registrations</p></div>
        </aside>
      </div>
    </div>
  );
}
