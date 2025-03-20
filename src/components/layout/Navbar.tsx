"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Navbar() {
  const linkStyles =
    "rounded px-4 py-2 transition-all duration-150 ease-linear hover:bg-foreground/10";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-4 flex justify-center md:mx-auto"
    >
      <div className="flex w-full items-center justify-between rounded-lg border-2 border-border p-2 text-foreground backdrop-blur-sm md:mb-8 md:max-w-3xl">
        <Link
          className={`font-semibold text-foreground ${linkStyles}`}
          href="/"
        >
          Anonlove
        </Link>

        <div className="hidden md:block">
          <Link
            href="https://github.com/q4ow/anonlink"
            className={linkStyles}
            target="_blank"
          >
            Source
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
