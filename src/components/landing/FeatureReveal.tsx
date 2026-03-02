"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface Props {
  children: ReactNode;
  /** Extra delay in seconds on top of the stagger */
  delay?: number;
}

/** Scroll-triggered fade-in + slide-up for feature blocks */
export function FeatureReveal({ children, delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Subtle hover lift for the graphic side */
export function GraphicFloat({ children }: { children: ReactNode }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative"
    >
      {children}
    </motion.div>
  );
}
