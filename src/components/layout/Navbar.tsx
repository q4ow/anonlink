"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-4 flex justify-center md:mx-auto"
    >
      <div className="mb-4 flex w-full items-center justify-center rounded-lg border-2 border-border p-3 text-foreground backdrop-blur-sm md:mb-8 md:max-w-3xl md:justify-between md:p-4">
        <h1 className="text-xl font-bold md:text-2xl">Anonlove</h1>
        <div className="hidden items-center gap-2 md:flex md:space-x-4">
          <Link
            href="/"
            passHref
          >
            <button className="rounded px-3 py-1.5 text-sm transition-all duration-150 ease-linear hover:bg-foreground/10 md:px-4 md:py-2 md:text-base">
              AnonLink
            </button>
          </Link>
          <Link
            href="https://keiran.cc"
            passHref
          >
            <button className="rounded px-3 py-1.5 text-sm transition-all duration-150 ease-linear hover:bg-foreground/10 md:px-4 md:py-2 md:text-base">
              AnonHost
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
