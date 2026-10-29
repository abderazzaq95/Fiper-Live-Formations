"use client";

import Link from "next/link";
import { ArrowRight, Check, Eye, ImagePlus, Loader2, Plus, Save, Send, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { agenda as defaultAgenda, audience as defaultAudience, featuredCourse, learningOutcomes } from "@/lib/demo-data";
import { defaultLandingContent, type LandingContent, type LandingSectionVisibility } from "@/lib/landing-content";
import type { CourseEditorData } from "@/lib/data/courses";

const pageSections = [
  { id: "editor-header", label: "الهيدر" },
  { id: "editor-hero", label: "القسم الرئيسي" },
  { id: "editor-registration", label: "التسجيل" },
  { id: "editor-instructor", label: "المحاضر" },
  { id: "editor-agenda", label: "البرنامج" },
  { id: "editor-faq", label: "الأسئلة" },
  { id: "editor-footer", label: "الفوتر" },
  { id: "editor-settings", label: "الإعدادات" },
];
const landingSectionLabels: Array<{ key: keyof LandingSectionVisibility; label: string }> = [
  { key: "hero", label: "الشريط الرئيسي" },
  { key: "agenda", label: "برنامج الدورة" },
  { key: "instructor", label: "المحاضر" },
  { key: "faq", label: "الأسئلة الشائعة" },
  { key: "registration", label: "التسجيل" },
  { key: "footer", label: "التذييل" },
];

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-[#425d70]">{label}</span>{children}{hint && <span className="mt-2 block text-xs text-[#91a2ae]">{hint}</span>}</label>;
}

function EditableText({ label, value, onChange, multiline = false, hint }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; hint?: string }) {
  return <Field label={label} hint={hint}>{multiline ? <textarea className="min-h-20 w-full resize-y rounded-xl border border-[#dce5eb] bg-[#fafbfc] p-3 text-sm leading-6 focus:border-[#8eb8d2] focus:bg-white focus:outline-none" value={value} onChange={(event) => onChange(event.target.value)} /> : <input className={inputClass} value={value} onChange={(event) => onChange(event.target.value)} />}</Field>;
}

function EditorSection({ id, order, title, description, children }: { id: string; order: number; title: string; description: string; children: React.ReactNode }) {
  return <section id={id} className="scroll-mt-6 rounded-[22px] border border-[#dfe7ec] bg-white p-5 sm:p-7"><div className="mb-6 flex items-start gap-3"><span className="latin flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#C32828] text-xs font-bold text-white">{String(order).padStart(2, "0")}</span><div><h2 className="text-base font-bold text-[#102f47]">{title}</h2><p className="mt-1 text-sm text-[#7890a0]">{description}</p></div></div><div className="space-y-6">{children}</div></section>;
}
const inputClass = "h-11 w-full rounded-xl border border-[#dce5eb] bg-[#fafbfc] px-4 text-sm text-[#203b4e] placeholder:text-[#a5b3bc] focus:border-[#8eb8d2] focus:bg-white focus:outline-none";

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
type WhatsAppChannelOption = { id: string; label: string; countryName: string; countryCode: string; phoneE164: string; isDefault: boolean };

export function CourseEditor({ courseId, initial, whatsappChannels, isNew = false }: { courseId: string; initial: CourseEditorData | null; whatsappChannels: WhatsAppChannelOption[]; isNew?: boolean }) {
  const router = useRouter();
  const course = initial ? { ...featuredCourse, title: initial.title, eyebrow: initial.eyebrow, description: initial.description, slug: initial.slug, coverImage: initial.coverPath, instructor: { ...featuredCourse.instructor, name: initial.instructor.name, role: initial.instructor.title, bio: initial.instructor.bio, image: initial.instructor.image } } : { ...featuredCourse, slug: "", coverImage: "", instructor: { ...featuredCourse.instructor, image: "" } };
  const session = initial?.session;
  const isPublished = initial?.state === "published";
  const registrationCount = initial?.registrationCount ?? 0;
  const capacity = session?.capacity ?? 200;
  const timezoneValue = ["Europe/Berlin", "Europe/Istanbul", "Asia/Qatar", "Asia/Muscat", "Asia/Beirut", "Africa/Casablanca", "Asia/Riyadh", "Asia/Dubai", "Asia/Amman", "Asia/Baghdad"].includes(session?.timezone ?? "") ? session?.timezone ?? "Europe/Berlin" : "Europe/Berlin";
  const dateValue = inputDateTime(session?.startsAt, timezoneValue, "date", "");
  const startTimeValue = inputDateTime(session?.startsAt, timezoneValue, "time", "");
  const endTimeValue = inputDateTime(session?.endsAt, timezoneValue, "time", "");
  const defaultWhatsAppChannelId = session?.whatsappChannelId ?? whatsappChannels.find((channel) => channel.isDefault)?.id ?? whatsappChannels[0]?.id ?? "uae";
  const [deliveryType, setDeliveryType] = useState<"online" | "onsite">(() => initial?.session.deliveryType === "onsite" ? "onsite" : "online");
  const [waitlistEnabled, setWaitlistEnabled] = useState(() => initial?.session.waitlistEnabled ?? true);
  const [coverImage, setCoverImage] = useState(course.coverImage ?? "");
  const [instructorImage, setInstructorImage] = useState(course.instructor.image ?? "");
  const [uploading, setUploading] = useState<AssetKind | null>(null);
  const [assetError, setAssetError] = useState("");
  const [faqItems, setFaqItems] = useState<EditableFaq[]>(() => initial?.faqs ?? []);
  const [outcomeItems, setOutcomeItems] = useState<EditableOutcome[]>(() => initial?.outcomes?.length ? initial.outcomes : learningOutcomes.map(({ title, text }) => ({ title, text })));
  const [audienceItems] = useState<string[]>(() => initial?.audience?.length ? initial.audience : defaultAudience);
  const [agendaItems, setAgendaItems] = useState<EditableAgenda[]>(() => initial?.agenda?.length ? initial.agenda : defaultAgenda);
  const [landingContent, setLandingContent] = useState<LandingContent>(() => initial?.landingContent ?? defaultLandingContent);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});

  const updateLanding = (section: keyof LandingContent, field: string, value: string) => setLandingContent((current) => ({ ...current, [section]: { ...(current[section] as Record<string, unknown>), [field]: value } } as LandingContent));
  const updateSectionVisibility = (section: keyof LandingSectionVisibility, visible: boolean) => setLandingContent((current) => ({
    ...current,
    visibility: { ...current.visibility, [section]: visible },
  }));


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
    setSaveError("");
    const value = (id: string, fallback = "") => draftValues[id] ?? (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null)?.value ?? fallback;
    const payload = {
      title: value("course-title", course.title),
      heroHeading: value("course-hero-heading", initial?.heroHeading ?? featuredCourse.heroHeading),
      eyebrow: value("course-eyebrow", course.eyebrow),
      description: value("course-description", course.description),
      level: value("course-level", initial?.level ?? ""),
      topic: value("course-topic", initial?.topic ?? ""),
      slug: value("course-slug", course.slug),
      sessionId: session?.id ?? "",
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
      whatsappChannelId: value("course-whatsapp-channel", defaultWhatsAppChannelId),
      capacity: Number(value("course-capacity", String(session?.capacity ?? 200)) || 0),
      registrationOpen: value("course-registration-open", session?.registrationOpen ? "open" : "closed") === "open",
      waitlistEnabled,
      instructorName: value("instructor-name", course.instructor.name),
      instructorTitle: value("instructor-title", course.instructor.role),
      instructorBio: value("instructor-bio", course.instructor.bio),
      instructorYearsActive: value("instructor-years-active", initial?.instructor.yearsActive === null || initial?.instructor.yearsActive === undefined ? "" : String(initial.instructor.yearsActive)) === "" ? null : Number(value("instructor-years-active")),
      instructorFocusMarkets: value("instructor-focus-markets", initial?.instructor.focusMarkets ?? ""),
      instructorCredentials: value("instructor-credentials", initial?.instructor.credentials ?? ""),
      coverImage,
      instructorImage,
      faqs: faqItems.filter((item) => item.question.trim() && item.answer.trim()),
      outcomes: outcomeItems.filter((item) => item.title.trim() && item.text.trim()),
      audience: audienceItems.map((item) => item.trim()).filter(Boolean),
      agenda: agendaItems.filter((item) => item.title.trim()),
      landingContent,
    };
    if (!payload.slug || !payload.date || !payload.startTime || !payload.endTime) {
      setSaveError("أدخل الرابط المختصر والتاريخ ووقت البداية ووقت النهاية قبل الحفظ.");
      setSaving(false);
      return;
    }
    try {
      const response = await fetch("/api/admin/courses/" + encodeURIComponent(courseId), { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, publish }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.message === "string" ? result.message : "save_failed");
      if (isNew && typeof result.id === "string") {
        router.replace(`/admin/courses/${encodeURIComponent(result.id)}`);
        return;
      }
      setSaved(true);
      router.refresh();
    } catch (error) {
      setSaved(false);
      setSaveError(error instanceof Error && error.message !== "save_failed" ? error.message : "تعذر حفظ التغييرات. تحقق من الحقول وحاول مرة أخرى.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1240px]" onChange={(event) => { const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement; if (target.id) setDraftValues((values) => ({ ...values, [target.id]: target.value })); }}>
      <div className="flex flex-col gap-4 border-b border-[#dce5eb] pb-6 sm:flex-row sm:items-center">
        <Link href="/admin/courses" className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dce5eb] bg-white text-[#5e7484]"><ArrowRight size={17} /></Link>
        <div><div className="flex items-center gap-2"><h1 className="text-xl font-bold sm:text-2xl">{isNew ? "إنشاء دورة جديدة" : "تعديل الدورة"}</h1>{!isNew && <span className={`rounded-full px-3 py-1 text-[8px] font-bold ${isPublished ? "bg-[#eaf8f3] text-[#168a65]" : "bg-[#fff4df] text-[#9a6412]"}`}>{isPublished ? "منشورة" : "مسودة"}</span>}</div><p className="mt-1 text-[9px] text-[#8598a6]">{isPublished ? "حفظ التغييرات يبقي الدورة منشورة ويحدّث صفحة التسجيل." : "احفظ المسودة أو انشر الدورة عندما تصبح جاهزة."}</p></div>
        <div className="mr-auto flex flex-wrap gap-2">
          <Link href={isNew ? "/" : `/courses/${encodeURIComponent(course.slug)}`} target="_blank" className="flex h-10 items-center gap-2 rounded-xl border border-[#dce5eb] bg-white px-4 text-[9px] font-bold text-[#51697a]"><Eye size={14} /> معاينة</Link>
          <button onClick={() => void save()} className="flex h-10 items-center gap-2 rounded-xl border border-[#dce5eb] bg-white px-4 text-[9px] font-bold text-[#51697a]">{saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} className="text-[#168a65]" /> : <Save size={14} />}{saving ? "جارٍ الحفظ" : saved ? "تم الحفظ" : isPublished ? "حفظ التغييرات" : "حفظ المسودة"}</button>
          <button onClick={() => void save(true)} disabled={saving} className="flex h-10 items-center gap-2 rounded-xl bg-[#C32828] px-4 text-[9px] font-bold text-white disabled:opacity-70"><Send size={14} /> {isNew ? "نشر الدورة" : "نشر التحديثات"}</button>
        </div>
      </div>
      {saveError && <p role="alert" className="mt-4 rounded-xl border border-[#f0c5c5] bg-[#fff6f6] p-3 text-[10px] font-semibold text-[#a51f1f]">{saveError}</p>}

      <nav aria-label="أقسام محرر صفحة الدورة" className="sticky top-3 z-20 mt-5 overflow-x-auto rounded-[18px] border border-[#dfe7ec] bg-white/95 p-1.5 shadow-sm backdrop-blur">
        <div className="flex min-w-max gap-1">{pageSections.map((section) => <a key={section.id} href={`#${section.id}`} className="rounded-xl px-4 py-3 text-sm font-bold text-[#607686] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#f3f6f8] hover:text-[#102f47] focus:outline-none focus:ring-2 focus:ring-[#C32828]/30">{section.label}</a>)}</div>
      </nav>

      <div className="mt-5 grid items-start gap-5 xl:grid-cols-[1fr_290px]">
        <main className="space-y-5">
          <EditorSection id="editor-header" order={1} title="الهيدر والتنقل" description="أول جزء يظهر أعلى صفحة الدورة.">
            <div className="grid gap-4 sm:grid-cols-2"><EditableText label="رابط الدورة" value={landingContent.hero.navCourse} onChange={(value) => updateLanding("hero", "navCourse", value)} /><EditableText label="رابط البرنامج" value={landingContent.hero.navAgenda} onChange={(value) => updateLanding("hero", "navAgenda", value)} /><EditableText label="رابط المحاضر" value={landingContent.hero.navInstructor} onChange={(value) => updateLanding("hero", "navInstructor", value)} /><EditableText label="رابط الأسئلة" value={landingContent.hero.navFaq} onChange={(value) => updateLanding("hero", "navFaq", value)} /></div>
          </EditorSection>

          <EditorSection id="editor-hero" order={2} title="القسم الرئيسي" description="رتّبت الحقول كما تظهر للزائر: التعريف، العنوان، الموعد، الوصف ثم المميزات.">
            <div className="grid gap-4 sm:grid-cols-2"><Field label="العبارة التعريفية"><input id="course-eyebrow" className={inputClass} defaultValue={draftValues["course-eyebrow"] ?? (isNew ? "" : course.eyebrow)} /></Field><Field label="اسم الدورة"><input id="course-title" className={inputClass} defaultValue={draftValues["course-title"] ?? (isNew ? "" : course.title)} placeholder="مثال: أساسيات التداول" /></Field></div>
            <Field label="العنوان الرئيسي للصفحة"><textarea id="course-hero-heading" className="min-h-20 w-full resize-y rounded-xl border border-[#dce5eb] bg-[#fafbfc] p-4 text-sm leading-6 focus:border-[#8eb8d2] focus:bg-white focus:outline-none" defaultValue={draftValues["course-hero-heading"] ?? (isNew ? featuredCourse.heroHeading : initial?.heroHeading ?? featuredCourse.heroHeading)} /></Field>
            <div className="rounded-2xl border border-[#e1e8ed] bg-[#fbfcfd] p-4"><h3 className="mb-4 text-sm font-bold text-[#425d70]">السعر والتاريخ والوقت والحضور</h3><div className="grid gap-4 sm:grid-cols-2"><Field label="التاريخ"><input id="course-date" type="date" className={inputClass} defaultValue={draftValues["course-date"] ?? dateValue} /></Field><Field label="وقت البداية"><input id="course-start-time" type="time" className={inputClass} defaultValue={draftValues["course-start-time"] ?? startTimeValue} /></Field><Field label="وقت النهاية"><input id="course-end-time" type="time" className={inputClass} defaultValue={draftValues["course-end-time"] ?? endTimeValue} /></Field><Field label="المنطقة الزمنية"><select id="course-timezone" className={inputClass} defaultValue={draftValues["course-timezone"] ?? timezoneValue}><option value="Europe/Berlin">ألمانيا · Berlin</option><option value="Europe/Istanbul">تركيا · Istanbul</option><option value="Asia/Qatar">قطر · Doha</option><option value="Asia/Muscat">عمان · Muscat</option><option value="Asia/Beirut">لبنان · Beirut</option><option value="Africa/Casablanca">المغرب · Casablanca</option><option value="Asia/Riyadh">السعودية · Riyadh</option><option value="Asia/Dubai">الإمارات · Dubai</option><option value="Asia/Amman">الأردن · Amman</option><option value="Asia/Baghdad">العراق · Baghdad</option></select></Field></div><Field label="نوع الحضور"><div className="mt-4 grid grid-cols-2 gap-3"><button type="button" onClick={() => setDeliveryType("online")} className={`rounded-xl p-4 text-sm font-bold transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${deliveryType === "online" ? "border-2 border-[#C32828] bg-[#fff6f6] text-[#C32828]" : "border border-[#dce5eb] text-[#6c8190] hover:border-[#8eb8d2]"}`}>أونلاين</button><button type="button" onClick={() => setDeliveryType("onsite")} className={`rounded-xl p-4 text-sm font-bold transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${deliveryType === "onsite" ? "border-2 border-[#C32828] bg-[#fff6f6] text-[#C32828]" : "border border-[#dce5eb] text-[#6c8190] hover:border-[#8eb8d2]"}`}>حضورية</button></div></Field></div>
            <Field label="وصف الدورة" hint="هذا هو النص الظاهر أسفل معلومات الموعد"><textarea id="course-description" className="min-h-28 w-full resize-y rounded-xl border border-[#dce5eb] bg-[#fafbfc] p-4 text-sm leading-6 focus:border-[#8eb8d2] focus:bg-white focus:outline-none" defaultValue={draftValues["course-description"] ?? (isNew ? "" : course.description)} /></Field>
            <div className="grid gap-4 sm:grid-cols-3"><EditableText label="الميزة الأولى" value={landingContent.hero.benefitOne} onChange={(value) => updateLanding("hero", "benefitOne", value)} /><EditableText label="الميزة الثانية" value={landingContent.hero.benefitTwo} onChange={(value) => updateLanding("hero", "benefitTwo", value)} /><EditableText label="الميزة الثالثة" value={landingContent.hero.benefitThree} onChange={(value) => updateLanding("hero", "benefitThree", value)} /></div>
            <EditableText label="نص زر التسجيل" value={landingContent.hero.primaryCta} onChange={(value) => updateLanding("hero", "primaryCta", value)} />
          </EditorSection>

          <EditorSection id="editor-registration" order={3} title="نموذج التسجيل" description="النموذج الذي يظهر بجانب القسم الرئيسي وقواعد استقبال التسجيلات.">
            <div className="grid gap-4 sm:grid-cols-2"><EditableText label="عنوان نموذج التسجيل" value={landingContent.registration.formTitle} onChange={(value) => updateLanding("registration", "formTitle", value)} /><EditableText label="وصف نموذج التسجيل" value={landingContent.registration.formDescription} onChange={(value) => updateLanding("registration", "formDescription", value)} /><Field label="الحد الأقصى للمقاعد"><input id="course-capacity" type="number" className={inputClass} defaultValue={draftValues["course-capacity"] ?? (session?.capacity ?? 200)} /></Field><Field label="حالة التسجيل"><select id="course-registration-open" className={inputClass} defaultValue={draftValues["course-registration-open"] ?? (session?.registrationOpen ? "open" : "closed")}><option value="open">مفتوح</option><option value="closed">مغلق</option></select></Field></div>
            <label className="flex items-center justify-between rounded-2xl border border-[#e1e8ed] p-4 text-sm font-bold"><span>تفعيل قائمة الانتظار عند اكتمال المقاعد</span><input type="checkbox" checked={waitlistEnabled} onChange={(event) => setWaitlistEnabled(event.target.checked)} className="h-4 w-4 accent-[#C32828]" /></label>
            <div className="grid gap-4 sm:grid-cols-2"><EditableText label="عنوان دعوة التسجيل في أسفل الصفحة" value={landingContent.registration.title} onChange={(value) => updateLanding("registration", "title", value)} /><EditableText label="وصف دعوة التسجيل" value={landingContent.registration.description} onChange={(value) => updateLanding("registration", "description", value)} multiline /></div>
          </EditorSection>

          <EditorSection id="editor-instructor" order={4} title="المحاضر" description="كل البيانات التي تظهر في بطاقة المحاضر.">
            <EditableText label="العبارة التعريفية للقسم" value={landingContent.instructor.eyebrow} onChange={(value) => updateLanding("instructor", "eyebrow", value)} /><div className="grid gap-4 sm:grid-cols-2"><Field label="الاسم الكامل"><input id="instructor-name" className={inputClass} defaultValue={draftValues["instructor-name"] ?? course.instructor.name} /></Field><Field label="المسمى المهني"><input id="instructor-title" className={inputClass} defaultValue={draftValues["instructor-title"] ?? course.instructor.role} /></Field></div><Field label="نبذة تعريفية"><textarea id="instructor-bio" className="min-h-28 w-full rounded-xl border border-[#dce5eb] bg-[#fafbfc] p-4 text-sm leading-6" defaultValue={draftValues["instructor-bio"] ?? course.instructor.bio} /></Field><div><span className="mb-2 block text-sm font-bold text-[#425d70]">صورة المحاضر</span><label htmlFor="instructor-image-file" className="relative flex h-32 cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-2xl border border-dashed border-[#b9cbd6] bg-[#f8fafb] text-sm font-bold text-[#7890a0]">{instructorImage && <span className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url("${instructorImage}")` }} />}{uploading === "instructor" ? <Loader2 size={18} className="relative animate-spin" /> : <ImagePlus size={18} className="relative" />}<span className="relative">{uploading === "instructor" ? "جارٍ رفع الصورة" : instructorImage ? "تغيير الصورة" : "رفع صورة احترافية"}</span></label><input id="instructor-image-file" type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadAsset(file, "instructor"); event.currentTarget.value = ""; }} /></div>
          </EditorSection>

          <EditorSection id="editor-agenda" order={5} title="محتوى البرنامج التدريبي" description="المحاور الظاهرة بعد معلومات المحاضر والجلسة.">
            <EditableText label="عنوان القسم" value={landingContent.agenda.title} onChange={(value) => updateLanding("agenda", "title", value)} /><div className="flex items-center justify-between"><h3 className="text-sm font-bold">محاور البرنامج</h3><button type="button" onClick={() => setAgendaItems((items) => [...items, { time: "", title: "", text: "" }])} className="flex h-10 items-center gap-2 rounded-lg bg-[#102f47] px-3 text-sm font-bold text-white"><Plus size={14} /> إضافة محور</button></div>{agendaItems.map((item, index) => <div key={index} className="grid gap-3 rounded-xl border border-[#dce5eb] bg-[#fbfcfd] p-4 sm:grid-cols-[1fr_auto]"><EditableText label={`المحور ${index + 1}`} value={item.title} onChange={(value) => setAgendaItems((items) => items.map((row, rowIndex) => rowIndex === index ? { ...row, title: value } : row))} /><button type="button" onClick={() => setAgendaItems((items) => items.filter((_, rowIndex) => rowIndex !== index))} className="self-start pt-8 text-[#C32828]" aria-label="حذف المحور"><Trash2 size={16} /></button></div>)}
          </EditorSection>

          <EditorSection id="editor-faq" order={6} title="الأسئلة الشائعة" description="الأسئلة والأجوبة التي تظهر قبل دعوة التسجيل الأخيرة.">
            <div className="grid gap-4 sm:grid-cols-2"><EditableText label="العبارة التعريفية" value={landingContent.faq.eyebrow} onChange={(value) => updateLanding("faq", "eyebrow", value)} /><EditableText label="عنوان القسم" value={landingContent.faq.title} onChange={(value) => updateLanding("faq", "title", value)} /></div><div className="flex items-center justify-between"><h3 className="text-sm font-bold">الأسئلة</h3><button type="button" onClick={() => setFaqItems((items) => [...items, { question: "", answer: "" }])} className="flex h-10 items-center gap-2 rounded-lg bg-[#102f47] px-3 text-sm font-bold text-white"><Plus size={14} /> إضافة سؤال</button></div>{faqItems.length === 0 && <p className="rounded-xl border border-dashed border-[#cbd9e1] px-4 py-5 text-center text-sm text-[#91a2ae]">لا توجد أسئلة بعد.</p>}{faqItems.map((faq, index) => <div key={index} className="space-y-3 rounded-xl border border-[#dce5eb] bg-[#fbfcfd] p-4"><div className="flex items-center justify-between"><span className="text-sm font-bold text-[#607686]">سؤال {index + 1}</span><button type="button" onClick={() => setFaqItems((items) => items.filter((_, itemIndex) => itemIndex !== index))} aria-label="حذف السؤال" className="text-[#C32828]"><Trash2 size={16} /></button></div><input className={inputClass} value={faq.question} onChange={(event) => setFaqItems((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, question: event.target.value } : item))} placeholder="اكتب السؤال" /><textarea className="min-h-20 w-full resize-y rounded-xl border border-[#dce5eb] bg-white p-3 text-sm leading-6 focus:border-[#8eb8d2] focus:outline-none" value={faq.answer} onChange={(event) => setFaqItems((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, answer: event.target.value } : item))} placeholder="اكتب الإجابة" /></div>)}
          </EditorSection>

          <EditorSection id="editor-footer" order={7} title="الفوتر" description="آخر قسم ظاهر في صفحة الدورة.">
            <div className="grid gap-4 sm:grid-cols-2"><EditableText label="وصف الأكاديمية" value={landingContent.footer.brandDescription} onChange={(value) => updateLanding("footer", "brandDescription", value)} multiline /><EditableText label="عنوان روابط الدورة" value={landingContent.footer.courseLinksTitle} onChange={(value) => updateLanding("footer", "courseLinksTitle", value)} /><EditableText label="رابط تفاصيل الدورة" value={landingContent.footer.courseDetailsLabel} onChange={(value) => updateLanding("footer", "courseDetailsLabel", value)} /><EditableText label="رابط المحاضر" value={landingContent.footer.instructorLabel} onChange={(value) => updateLanding("footer", "instructorLabel", value)} /><EditableText label="رابط البرنامج" value={landingContent.footer.programLabel} onChange={(value) => updateLanding("footer", "programLabel", value)} /><EditableText label="عنوان الروابط المهمة" value={landingContent.footer.importantLinksTitle} onChange={(value) => updateLanding("footer", "importantLinksTitle", value)} /><EditableText label="رابط الخصوصية" value={landingContent.footer.privacyLabel} onChange={(value) => updateLanding("footer", "privacyLabel", value)} /><EditableText label="رابط الشروط" value={landingContent.footer.termsLabel} onChange={(value) => updateLanding("footer", "termsLabel", value)} /><EditableText label="نص التواصل" value={landingContent.footer.contactLabel} onChange={(value) => updateLanding("footer", "contactLabel", value)} /><EditableText label="بريد التواصل" value={landingContent.footer.contactEmail} onChange={(value) => updateLanding("footer", "contactEmail", value)} /><EditableText label="العودة إلى الأعلى" value={landingContent.footer.backToTopLabel} onChange={(value) => updateLanding("footer", "backToTopLabel", value)} /><EditableText label="إخلاء المسؤولية" value={landingContent.footer.disclaimer} onChange={(value) => updateLanding("footer", "disclaimer", value)} multiline /></div>
          </EditorSection>

          <EditorSection id="editor-settings" order={8} title="إعدادات النشر والتشغيل" description="إعدادات لا تظهر كنص داخل الصفحة لكنها ضرورية للرابط والصور والتواصل.">
            {assetError && <p className="rounded-xl border border-[#f0c5c5] bg-[#fff6f6] p-3 text-sm text-[#a51f1f]">{assetError}</p>}<Field label="الرابط المختصر" hint="أدخل معرفًا فريدًا مثل id06"><div className="flex" dir="ltr"><span className="flex h-11 items-center rounded-l-xl border border-r-0 border-[#dce5eb] bg-[#f0f4f6] px-3 text-xs text-[#7f929f]">/courses/</span><input className={`${inputClass} rounded-l-none`} id="course-slug" defaultValue={draftValues["course-slug"] ?? (isNew ? "" : course.slug)} placeholder="id06" required pattern="id[0-9]+" /></div></Field>
            <div><span className="mb-2 block text-sm font-bold text-[#425d70]">صورة بطاقة الدورة</span><label htmlFor="course-cover-file" className="relative flex min-h-32 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#b9cbd6] bg-[#f8fafb] text-[#7890a0]">{coverImage && <span className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url("${coverImage}")` }} />}{uploading === "cover" ? <Loader2 size={22} className="relative animate-spin" /> : <ImagePlus size={22} className="relative" />}<span className="relative mt-3 text-sm font-bold">{uploading === "cover" ? "جارٍ رفع الصورة" : coverImage ? "تغيير الصورة" : "اختر صورة الدورة"}</span></label><input id="course-cover-file" type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadAsset(file, "cover"); event.currentTarget.value = ""; }} /></div>
            <Field label="رابط Google Meet"><input id="course-meet-url" className={inputClass} dir="ltr" defaultValue={draftValues["course-meet-url"] ?? (session?.meetUrl ?? "")} /></Field>{deliveryType === "onsite" && <div className="grid gap-4 sm:grid-cols-2"><Field label="اسم المكان"><input id="course-venue-name" className={inputClass} defaultValue={draftValues["course-venue-name"] ?? (session?.venueName ?? "")} /></Field><Field label="العنوان"><input id="course-venue-address" className={inputClass} defaultValue={draftValues["course-venue-address"] ?? (session?.venueAddress ?? "")} /></Field><Field label="رابط Google Maps"><input id="course-maps-url" className={inputClass} dir="ltr" defaultValue={draftValues["course-maps-url"] ?? (session?.mapsUrl ?? "")} /></Field></div>}
            <Field label="رقم واتساب المستخدم لهذه الدورة"><select id="course-whatsapp-channel" className={inputClass} defaultValue={draftValues["course-whatsapp-channel"] ?? defaultWhatsAppChannelId}>{whatsappChannels.map((channel) => <option key={channel.id} value={channel.id}>{channel.countryName} · {channel.phoneE164} · {channel.label}</option>)}</select></Field>
            <div className="rounded-2xl border border-[#e1e8ed] bg-[#fbfcfd] p-4"><h3 className="mb-3 text-sm font-bold">إظهار أقسام الصفحة</h3><div className="grid gap-3 sm:grid-cols-2">{landingSectionLabels.map(({ key, label }) => <label key={key} className="flex items-center justify-between rounded-xl border border-[#dce5eb] bg-white p-3 text-sm font-bold text-[#425d70]"><span>{label}</span><input type="checkbox" checked={landingContent.visibility[key]} onChange={(event) => updateSectionVisibility(key, event.target.checked)} className="h-4 w-4 accent-[#C32828]" /></label>)}</div></div>
            <details className="rounded-2xl border border-[#e1e8ed] bg-[#fbfcfd] p-4"><summary className="cursor-pointer text-sm font-bold text-[#425d70]">محتوى محفوظ لتطوير التصميم لاحقاً</summary><p className="mt-2 text-sm leading-6 text-[#91a2ae]">هذه البيانات لا تظهر في التصميم الحالي، لكنها ستبقى محفوظة.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><EditableText label="عنوان قسم ماذا ستخرج به" value={landingContent.about.title} onChange={(value) => updateLanding("about", "title", value)} /><EditableText label="وصف القسم" value={landingContent.about.description} onChange={(value) => updateLanding("about", "description", value)} multiline /><EditableText label="عنوان قسم الجمهور" value={landingContent.audience.title} onChange={(value) => updateLanding("audience", "title", value)} /><EditableText label="وصف القسم" value={landingContent.audience.description} onChange={(value) => updateLanding("audience", "description", value)} multiline /></div><div className="mt-5 flex items-center justify-between"><h4 className="text-sm font-bold">بطاقات النتائج المحفوظة</h4><button type="button" onClick={() => setOutcomeItems((items) => [...items, { title: "", text: "" }])} className="flex h-10 items-center gap-2 rounded-lg bg-[#102f47] px-3 text-sm font-bold text-white"><Plus size={14} /> إضافة بطاقة</button></div><div className="mt-3 space-y-3">{outcomeItems.map((item, index) => <div key={index} className="grid gap-3 rounded-xl border border-[#dce5eb] bg-white p-4 sm:grid-cols-[1fr_1fr_auto]"><EditableText label={`البطاقة ${index + 1}`} value={item.title} onChange={(value) => setOutcomeItems((items) => items.map((row, rowIndex) => rowIndex === index ? { ...row, title: value } : row))} /><EditableText label="الوصف" value={item.text} onChange={(value) => setOutcomeItems((items) => items.map((row, rowIndex) => rowIndex === index ? { ...row, text: value } : row))} multiline /><button type="button" onClick={() => setOutcomeItems((items) => items.filter((_, rowIndex) => rowIndex !== index))} className="self-start pt-8 text-[#C32828]" aria-label="حذف البطاقة"><Trash2 size={16} /></button></div>)}</div></details>
          </EditorSection>
        </main>

        <aside className="space-y-4">
          <div className="rounded-[22px] border border-[#dfe7ec] bg-white p-5"><div className="flex items-center gap-2"><Sparkles size={16} className="text-[#C32828]" /><h3 className="text-[11px] font-bold">جودة الصفحة</h3></div><div className="mt-5 flex items-center gap-4"><div className="latin flex h-14 w-14 items-center justify-center rounded-full border-[5px] border-[#32b886] text-sm font-bold">92</div><p className="text-[9px] leading-5 text-[#718695]">المحتوى مكتمل وجاهز للنشر. أضف صورة المحاضر الأصلية لاحقاً.</p></div></div>
          <div className="rounded-[22px] bg-[#082943] p-5 text-white"><p className="text-[9px] font-bold text-[#7ea0b7]">ملخص مباشر</p><h3 className="mt-3 text-sm font-bold leading-6">{course.title}</h3><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-[#C32828]" style={{ width: `${capacity ? Math.min(100, (registrationCount / capacity) * 100) : 0}%` }} /></div><p className="latin mt-3 text-[9px] text-[#7ea0b7]">{registrationCount} / {capacity} registrations</p></div>
        </aside>
      </div>
    </div>
  );
}
