import Image from "next/image";
import Link from "next/link";

type FiperLogoProps = {
  compact?: boolean;
  href?: string;
  darkText?: boolean;
  variant?: "default" | "drive";
};

export function FiperLogo({ compact = false, href = "/", darkText = false, variant = "default" }: FiperLogoProps) {
  return (
    <Link href={href} className="group inline-flex items-center gap-3" aria-label="Fiper Live Academy">
      {variant === "drive" ? (
        <span className="relative inline-flex h-14 items-start"><Image src="/brand/fiper-wordmark-drive.png" alt="Fiper Live Academy" width={1526} height={531} className="h-11 w-auto object-contain transition duration-300 group-hover:-translate-y-0.5" /><span aria-hidden="true" className="latin absolute bottom-0 left-[40%] right-0 text-center text-[6px] font-bold tracking-[0.12em] text-[#8daac1]">LIVE ACADEMY</span></span>
      ) : (
        <>
          <Image src="/brand/fiper-mark.png" alt="" width={44} height={44} className="h-10 w-10 rounded-[13px] object-cover shadow-[0_10px_28px_rgba(195,40,40,.24)] transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_14px_34px_rgba(195,40,40,.32)]" />
          {!compact && (
            <span className={"flex flex-col leading-none " + (darkText ? "text-[#071d2f]" : "text-white")}>
              <span className="latin text-[22px] font-extrabold tracking-[-0.045em]">Fiper</span>
              <span className={"latin mt-1 text-[7px] font-bold tracking-[0.24em] " + (darkText ? "text-[#6f8595]" : "text-[#8daac1")}>
                LIVE ACADEMY
              </span>
            </span>
          )}
        </>
      )}
    </Link>
  );
}
