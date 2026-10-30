import Image from "next/image";
import Link from "next/link";

type CompactPublicFooterProps = {
  brandDescription?: string;
  disclaimer?: string;
  privacyLabel?: string;
  termsLabel?: string;
};

export function CompactPublicFooter({
  brandDescription = "تعليم يساعدك على فهم الأسواق المالية وبناء قرارات أكثر وضوحًا.",
  disclaimer = "المحتوى تعليمي عام ولا يُعد توصية استثمارية.",
  privacyLabel = "سياسة الخصوصية",
  termsLabel = "الشروط والأحكام",
}: CompactPublicFooterProps) {
  return (
    <footer className="bg-black text-white" dir="rtl">
      <div className="mx-auto max-w-[1120px] px-5 py-8 sm:px-8">
        <div className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-right">
          <div className="flex items-center gap-4">
            <Image src="/brand/fiper-wordmark-drive.png" alt="Fiper" width={125} height={48} className="h-10 w-auto object-contain" />
            <p className="max-w-sm text-xs leading-6 text-[#9aa5ad]">{brandDescription}</p>
          </div>
          <nav aria-label="الروابط القانونية" className="flex items-center gap-6 text-xs text-[#b8c0c7]">
            <Link href="/privacy" className="transition-colors hover:text-white">{privacyLabel}</Link>
            <Link href="/terms" className="transition-colors hover:text-white">{termsLabel}</Link>
          </nav>
        </div>
        <div className="mt-6 flex flex-col gap-2 border-t border-white/15 pt-4 text-center text-xs leading-6 text-[#7f8a92] sm:flex-row sm:items-center sm:justify-between sm:text-right">
          <p>{disclaimer}</p>
          <p>© 2026 Fiper Academy</p>
        </div>
      </div>
    </footer>
  );
}
