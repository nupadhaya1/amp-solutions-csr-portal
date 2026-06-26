"use client";

import { motion } from "framer-motion";

export function MotionPanel({ children, className = "" }) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={className}
      initial={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
