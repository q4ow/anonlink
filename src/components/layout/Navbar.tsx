"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto mb-8 flex max-w-3xl items-center justify-between rounded-lg border-2 border-border p-4 text-foreground backdrop-blur-sm">
        <h1 className="text-2xl font-bold">Anonlove</h1>
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            passHref
          >
            <button className="rounded px-4 py-2 transition-all duration-150 ease-linear hover:bg-foreground/10">
              AnonLink
            </button>
          </Link>
          <Link
            href="https://keiran.cc"
            passHref
          >
            <button className="rounded px-4 py-2 transition-all duration-150 ease-linear hover:bg-foreground/10">
              AnonHost
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
