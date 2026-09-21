export type LandingStat = { value: string; label: string };
export type LandingOutcome = { title: string; text: string };
export type LandingAgendaItem = { time: string; title: string; text: string };

export type LandingContent = {
  hero: {
    navAbout: string;
    navAgenda: string;
    navInstructor: string;
    navFaq: string;
    primaryCta: string;
    secondaryCta: string;
    benefitOne: string;
    benefitTwo: string;
  };
  about: { eyebrow: string; title: string; description: string; durationLabel: string };
  audience: { eyebrow: string; title: string; description: string; badgeLabel: string; badgeTitle: string; stats: LandingStat[] };
  agenda: { eyebrow: string; title: string; description: string };
  instructor: { eyebrow: string; yearsValue: string; yearsLabel: string; liveValue: string; liveLabel: string };
  faq: { eyebrow: string; title: string };
  registration: { eyebrow: string; title: string; description: string; formTitle: string; formDescription: string };
  footer: { disclaimer: string; privacyLabel: string; termsLabel: string };
};

export const defaultLandingContent: LandingContent = {
  hero: {
    navAbout: "عن الدورة",
    navAgenda: "المحاور",
    navInstructor: "المحاضر",
    navFaq: "الأسئلة",
    primaryCta: "سجل الآن مجاناً",
    secondaryCta: "استكشف محاور الدورة",
    benefitOne: "لا تحتاج خبرة سابقة",
    benefitTwo: "حضور مباشر وتفاعلي",
  },
  about: {
    eyebrow: "ما الذي ستخرج به؟",
    title: "معرفة تتحول إلى قرارات أوضح",
    description: "كل محور مصمم ليمنحك أداة عملية تستخدمها بعد انتهاء الجلسة، بعيداً عن التعقيد والمعلومات المشتتة.",
    durationLabel: "دقيقة مركزة من الشرح والتطبيق والأسئلة المباشرة",
  },
  audience: {
    eyebrow: "هل هذه الدورة لك؟",
    title: "صُممت للباحثين عن بداية صحيحة",
    description: "لا نعدك بنتائج سريعة. نمنحك الأساس الذي يساعدك على فهم السوق، تقييم المخاطر، وبناء قراراتك على منهج واضح.",
    badgeLabel: "مسار مناسب لك",
    badgeTitle: "في نهاية الدورة ستكون قد بنيت\nنظاماً أولياً لاتخاذ قرار تداول أكثر انضباطاً.",
    stats: [
      { value: "5", label: "محاور" },
      { value: "1", label: "خطة عملية" },
      { value: "Live", label: "أسئلة مباشرة" },
    ],
  },
  agenda: {
    eyebrow: "برنامج الدورة",
    title: "تسعون دقيقة، من الفكرة إلى الخطة",
    description: "إيقاع مركز يحافظ على الجانب العملي ويترك مساحة كافية للأسئلة المباشرة.",
  },
  instructor: {
    eyebrow: "محاضرك في هذه الدورة",
    yearsValue: "+10",
    yearsLabel: "سنوات في الأسواق المالية",
    liveValue: "LIVE",
    liveLabel: "إجابات مباشرة على أسئلتك",
  },
  faq: { eyebrow: "قبل أن تسجل", title: "إجابات واضحة عن أسئلتك" },
  registration: {
    eyebrow: "خطوتك التالية",
    title: "احجز مقعدك المجاني",
    description: "أدخل بياناتك مرة واحدة، وسنرسل إليك التأكيد والرابط وكل التذكيرات المهمة.",
    formTitle: "بيانات التسجيل",
    formDescription: "جميع الحقول مطلوبة",
  },
  footer: {
    disclaimer: "محتوى تعليمي عام ولا يمثل نصيحة استثمارية. ينطوي تداول المنتجات المالية على مخاطر وقد يؤدي إلى خسارة رأس المال.",
    privacyLabel: "الخصوصية",
    termsLabel: "الشروط",
  },
};

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function text(value: unknown, fallback: string) { return typeof value === "string" && value.trim() ? value : fallback; }

export function mergeLandingContent(value: unknown): LandingContent {
  const input = object(value);
  const hero = object(input.hero);
  const about = object(input.about);
  const audience = object(input.audience);
  const agenda = object(input.agenda);
  const instructor = object(input.instructor);
  const faq = object(input.faq);
  const registration = object(input.registration);
  const footer = object(input.footer);
  const stats = Array.isArray(audience.stats) ? audience.stats.map((item, index) => {
    const row = object(item);
    const fallback = defaultLandingContent.audience.stats[index] ?? { value: "", label: "" };
    return { value: text(row.value, fallback.value), label: text(row.label, fallback.label) };
  }).filter((item) => item.value || item.label) : defaultLandingContent.audience.stats;
  return {
    hero: { ...defaultLandingContent.hero, navAbout: text(hero.navAbout, defaultLandingContent.hero.navAbout), navAgenda: text(hero.navAgenda, defaultLandingContent.hero.navAgenda), navInstructor: text(hero.navInstructor, defaultLandingContent.hero.navInstructor), navFaq: text(hero.navFaq, defaultLandingContent.hero.navFaq), primaryCta: text(hero.primaryCta, defaultLandingContent.hero.primaryCta), secondaryCta: text(hero.secondaryCta, defaultLandingContent.hero.secondaryCta), benefitOne: text(hero.benefitOne, defaultLandingContent.hero.benefitOne), benefitTwo: text(hero.benefitTwo, defaultLandingContent.hero.benefitTwo) },
    about: { ...defaultLandingContent.about, eyebrow: text(about.eyebrow, defaultLandingContent.about.eyebrow), title: text(about.title, defaultLandingContent.about.title), description: text(about.description, defaultLandingContent.about.description), durationLabel: text(about.durationLabel, defaultLandingContent.about.durationLabel) },
    audience: { ...defaultLandingContent.audience, eyebrow: text(audience.eyebrow, defaultLandingContent.audience.eyebrow), title: text(audience.title, defaultLandingContent.audience.title), description: text(audience.description, defaultLandingContent.audience.description), badgeLabel: text(audience.badgeLabel, defaultLandingContent.audience.badgeLabel), badgeTitle: text(audience.badgeTitle, defaultLandingContent.audience.badgeTitle), stats },
    agenda: { ...defaultLandingContent.agenda, eyebrow: text(agenda.eyebrow, defaultLandingContent.agenda.eyebrow), title: text(agenda.title, defaultLandingContent.agenda.title), description: text(agenda.description, defaultLandingContent.agenda.description) },
    instructor: { ...defaultLandingContent.instructor, eyebrow: text(instructor.eyebrow, defaultLandingContent.instructor.eyebrow), yearsValue: text(instructor.yearsValue, defaultLandingContent.instructor.yearsValue), yearsLabel: text(instructor.yearsLabel, defaultLandingContent.instructor.yearsLabel), liveValue: text(instructor.liveValue, defaultLandingContent.instructor.liveValue), liveLabel: text(instructor.liveLabel, defaultLandingContent.instructor.liveLabel) },
    faq: { eyebrow: text(faq.eyebrow, defaultLandingContent.faq.eyebrow), title: text(faq.title, defaultLandingContent.faq.title) },
    registration: { ...defaultLandingContent.registration, eyebrow: text(registration.eyebrow, defaultLandingContent.registration.eyebrow), title: text(registration.title, defaultLandingContent.registration.title), description: text(registration.description, defaultLandingContent.registration.description), formTitle: text(registration.formTitle, defaultLandingContent.registration.formTitle), formDescription: text(registration.formDescription, defaultLandingContent.registration.formDescription) },
    footer: { ...defaultLandingContent.footer, disclaimer: text(footer.disclaimer, defaultLandingContent.footer.disclaimer), privacyLabel: text(footer.privacyLabel, defaultLandingContent.footer.privacyLabel), termsLabel: text(footer.termsLabel, defaultLandingContent.footer.termsLabel) },
  };
}