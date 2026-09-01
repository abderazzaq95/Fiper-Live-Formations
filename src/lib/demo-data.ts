export type CourseStatus = "open" | "full" | "draft" | "completed";

export type Course = {
  id: string;
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  dateLabel: string;
  isoStart: string;
  timeLabel: string;
  duration: string;
  type: "online" | "onsite";
  platform: string;
  capacity: number;
  registrations: number;
  status: CourseStatus;
  registrationOpen?: boolean;
  coverImage?: string;
  instructor: { name: string; role: string; bio: string; initials: string; image?: string };
};

export const featuredCourse: Course = {
  id: "crs_forex_001",
  slug: "forex-foundations",
  title: "أساسيات التداول في أسواق الفوركس",
  eyebrow: "دورة تدريبية مباشرة ومجانية",
  description: "من قراءة حركة السعر إلى بناء خطة تداول واضحة — تجربة عملية تمنحك الأساس الصحيح لفهم السوق وإدارة قراراتك بثقة.",
  dateLabel: "الأحد، 6 سبتمبر 2026",
  isoStart: "2026-09-06T20:00:00+01:00",
  timeLabel: "20:00 بتوقيت المغرب",
  duration: "90 دقيقة",
  type: "online",
  platform: "Google Meet",
  capacity: 200,
  registrations: 146,
  status: "open",
  instructor: {
    name: "أحمد التميمي",
    role: "محلل أسواق مالية ومدرب تداول",
    bio: "خبرة تتجاوز 10 سنوات في أسواق العملات والسلع، ساعد خلالها آلاف المتداولين على بناء منهج أكثر انضباطاً ووضوحاً.",
    initials: "أ ت",
    image: "/brand/instructor-ahmed-tamimi.png",
  },
};

export const learningOutcomes = [
  { index: "01", title: "قراءة السوق", text: "فهم حركة السعر والبنية الأساسية للسوق بعيداً عن الضوضاء." },
  { index: "02", title: "تحليل الفرص", text: "استخدام أدوات تحليل بسيطة لتحديد الفرص ذات السياق الواضح." },
  { index: "03", title: "إدارة المخاطر", text: "تحديد المخاطرة وحجم الصفقة قبل التفكير في الأرباح المحتملة." },
  { index: "04", title: "خطة قابلة للتنفيذ", text: "تحويل المعرفة إلى خطوات مكتوبة يمكنك الالتزام بها بعد الدورة." },
];

export const agenda = [
  { time: "15 دقيقة", title: "كيف يعمل سوق الفوركس؟", text: "الأطراف الرئيسية، أزواج العملات، السيولة وما الذي يحرك الأسعار." },
  { time: "25 دقيقة", title: "قراءة الرسم البياني", text: "الاتجاه، مناطق الاهتمام، وبناء سيناريو بدلاً من التوقع العشوائي." },
  { time: "25 دقيقة", title: "المخاطر قبل العائد", text: "حجم الصفقة، وقف الخسارة، ونسبة العائد إلى المخاطرة." },
  { time: "15 دقيقة", title: "بناء خطة البداية", text: "قالب عملي يحول الأفكار إلى روتين تداول منظم." },
  { time: "10 دقائق", title: "أسئلة مباشرة", text: "مساحة مخصصة للإجابة على أسئلة المشاركين وتوضيح النقاط العملية." },
];

export const audience = [
  "تبدأ من الصفر وتريد فهماً صحيحاً للسوق",
  "جربت التداول لكن قراراتك ما زالت عشوائية",
  "تبحث عن إطار عملي لإدارة المخاطر",
  "تريد التعلم بعيداً عن الوعود غير الواقعية",
];

export const faqs = [
  { question: "هل أحتاج إلى خبرة سابقة؟", answer: "لا. صُممت الدورة لتبدأ من المفاهيم الأساسية، مع أمثلة عملية واضحة للمبتدئين." },
  { question: "هل الدورة مجانية بالكامل؟", answer: "نعم، التسجيل والحضور مجانيان. المقاعد محدودة للحفاظ على جودة الجلسة المباشرة." },
  { question: "كيف سأحصل على رابط الدخول؟", answer: "بعد تأكيد التسجيل ستصلك التفاصيل عبر البريد الإلكتروني وواتساب، مع تذكير قبل الموعد." },
  { question: "ماذا يحدث إذا اكتملت المقاعد؟", answer: "سينتقل تسجيلك تلقائياً إلى قائمة الانتظار وسنبلغك فور توفر مقعد." },
];

export const dashboardCourses = [
  { id: "crs_forex_001", title: "أساسيات التداول في أسواق الفوركس", date: "06 سبتمبر، 20:00", registrations: 146, capacity: 200, status: "مفتوح", tone: "green" },
  { id: "crs_risk_002", title: "إدارة المخاطر للمتداولين", date: "13 سبتمبر، 19:30", registrations: 200, capacity: 200, status: "قائمة انتظار", tone: "amber" },
  { id: "crs_gold_003", title: "قراءة حركة الذهب", date: "20 سبتمبر، 20:00", registrations: 74, capacity: 150, status: "مسودة", tone: "slate" },
];

export const registrations = [
  { name: "سارة العلوي", email: "sara.alami@example.com", phone: "+212 6 12 34 56 78", country: "المغرب", course: "أساسيات الفوركس", status: "مؤكد", source: "Instagram", time: "منذ 4 دقائق" },
  { name: "عمر بنسالم", email: "omar.b@example.com", phone: "+212 6 88 21 45 12", country: "المغرب", course: "أساسيات الفوركس", status: "مؤكد", source: "Direct", time: "منذ 12 دقيقة" },
  { name: "ريم الخطيب", email: "reem.k@example.com", phone: "+971 50 123 4567", country: "الإمارات", course: "إدارة المخاطر", status: "انتظار", source: "Facebook", time: "منذ 21 دقيقة" },
  { name: "يوسف المريني", email: "y.merini@example.com", phone: "+212 6 55 78 90 11", country: "المغرب", course: "أساسيات الفوركس", status: "مؤكد", source: "WhatsApp", time: "منذ 34 دقيقة" },
];
