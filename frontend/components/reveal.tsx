"use client";

import { motion } from "motion/react";

export function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 16, scale: .982 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: .02, margin: "0px 0px -2% 0px" }} transition={{ duration: .32, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}
