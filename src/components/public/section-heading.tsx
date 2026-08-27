type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "right" | "center";
  light?: boolean;
};

export function SectionHeading({ eyebrow, title, description, align = "right", light = false }: SectionHeadingProps) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <div className={`mb-4 inline-flex items-center gap-2 text-xs font-bold ${light ? "text-[#C32828]" : "text-[#C32828]"}`}>
        <span className="h-[2px] w-7 rounded-full bg-[#C32828]" />
        {eyebrow}
      </div>
      <h2 className={`text-3xl font-bold leading-[1.45] tracking-[-0.035em] sm:text-4xl lg:text-[42px] ${light ? "text-[#071d2f]" : "text-white"}`}>
        {title}
      </h2>
      {description && (
        <p className={`mt-4 text-sm leading-8 sm:text-base ${light ? "text-[#597085]" : "text-[#8daac1]"}`}>
          {description}
        </p>
      )}
    </div>
  );
}
