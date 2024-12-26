"use client";

import { motion } from "framer-motion";

export default function Header() {
  return (
    <motion.h1
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 text-center text-3xl font-bold"
    >
      AnonLink
    </motion.h1>
  );
}
