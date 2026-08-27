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
        src="/brand/fiper-mark.png"
        alt=""
        width={44}
        height={44}
        className="h-10 w-10 rounded-[13px] object-cover shadow-[0_10px_28px_rgba(195,40,40,.24)] transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_14px_34px_rgba(195,40,40,.32)]"
      />
      {!compact && (
        <span className={`flex flex-col leading-none ${darkText ? "text-[#071d2f]" : "text-white"}`}>
          <span className="latin text-[22px] font-extrabold tracking-[-0.045em]">Fiper</span>
          <span className={`latin mt-1 text-[7px] font-bold tracking-[0.24em] ${darkText ? "text-[#6f8595]" : "text-[#8daac1]"}`}>
            LIVE ACADEMY
          </span>
        </span>
      )}
    </Link>
  );
}
