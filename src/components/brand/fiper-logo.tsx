import Image from "next/image";
import Link from "next/link";

type FiperLogoProps = {
  compact?: boolean;
  href?: string;
  darkText?: boolean;
};

export function FiperLogo({ compact = false, href = "/", darkText = false }: FiperLogoProps) {
  return (
    <Link href={href} className="group inline-flex items-center gap-3" aria-label="Fiper Live Academy">
      <Image
        src="/brand/fiper-mark-original.png"
        alt=""
        width={44}
        height={44}
        className="h-10 w-10 rounded-[13px] object-cover shadow-[0_10px_28px_rgba(195,40,40,.24)] transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_14px_34px_rgba(195,40,40,.32)]"
      />
      {!compact && (
        <Image src="/brand/fiper-word-original.png" alt="Fiper" width={78} height={33} className={darkText ? "h-8 w-[78px] object-contain" : "h-8 w-[78px] object-contain brightness-0 invert"} />
      )}
    </Link>
  );
}
