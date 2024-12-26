"use client";

import { motion } from "framer-motion";

export default function Header() {
  return (
    <motion.h1 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-3xl font-bold text-center mb-8"
    >
      AnonLink
    </motion.h1>
  );
}