import { CreditCard, UsersThree } from "@phosphor-icons/react";
import type { Course } from "@/lib/demo-data";
import { registrationTrustThreshold } from "@/lib/academy-config";

export function CourseTrustSignal({ course, dark = false }: { course: Course; dark?: boolean }) {
  const color = dark ? "text-[#b7c7d2]" : "text-[#617485]";
  if (course.registrations >= registrationTrustThreshold) {
    return <span className={`inline-flex items-center gap-2 text-xs font-semibold ${color}`}><UsersThree size={17} weight="duotone" />{course.registrations.toLocaleString("ar")} شخصًا أكدوا الحضور</span>;
  }
  if (course.capacity > 0) {
    const available = Math.max(0, course.capacity - course.registrations);
    return <span className={`inline-flex items-center gap-2 text-xs font-semibold ${color}`}><UsersThree size={17} weight="duotone" />{available.toLocaleString("ar")} مقعدًا متاحًا</span>;
  }
  return <span className={`inline-flex items-center gap-2 text-xs font-semibold ${color}`}><CreditCard size={17} weight="duotone" />مجانية، ولا تحتاج بطاقة دفع</span>;
}
