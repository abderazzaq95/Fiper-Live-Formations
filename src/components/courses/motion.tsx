"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

const ease = [0.32, 0.72, 0, 1] as const;

export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 36, filter: "blur(8px)" }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.85, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

export function TaglineReveal({ text }: { text: string }) {
  const reduceMotion = useReducedMotion();
  const words = text.split(" ");
  return (
    <p className="max-w-[680px] text-balance text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          className="inline-block"
          initial={reduceMotion ? false : { color: "rgba(255,255,255,.45)" }}
          whileInView={reduceMotion ? undefined : { color: "rgba(255,255,255,1)" }}
          viewport={{ once: true, amount: 0.2, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 0.7, delay: index * 0.035, ease }}
        >
          {word}{index < words.length - 1 ? "\u00a0" : ""}
        </motion.span>
      ))}
    </p>
  );
}
