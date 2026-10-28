"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "@phosphor-icons/react";

export type AcademyFaq = { question: string; answer: string };

export function FaqAccordion({ items }: { items: AcademyFaq[] }) {
  const [open, setOpen] = useState(0);
  const reduceMotion = useReducedMotion();
  return (
    <div className="divide-y divide-[#dfe6ea] border-y border-[#dfe6ea]">
      {items.map((item, index) => {
        const expanded = open === index;
        return (
          <div key={item.question}>
            <h3>
              <button type="button" aria-expanded={expanded} aria-controls={`faq-answer-${index}`} onClick={() => setOpen(expanded ? -1 : index)} className="flex w-full items-center justify-between gap-6 py-6 text-right text-lg font-bold text-[#071d2f] transition-colors duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-[#c32828] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c32828] focus-visible:ring-inset">
                <span className="text-balance">{item.question}</span>
                <Plus size={22} className={`shrink-0 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${expanded ? "rotate-45 text-[#c32828]" : "text-[#667a89]"}`} />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {expanded ? <motion.div id={`faq-answer-${index}`} role="region" initial={reduceMotion ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }} className="overflow-hidden"><p className="max-w-3xl pb-6 text-pretty text-base leading-8 text-[#526575]">{item.answer}</p></motion.div> : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
