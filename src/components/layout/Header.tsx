"use client";

import { motion } from "framer-motion";

export default function Header() {
  return (
    <motion.h1
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-4 text-center text-2xl font-bold md:mb-8 md:text-3xl"
    >
      AnonLink
    </motion.h1>
  );
}
