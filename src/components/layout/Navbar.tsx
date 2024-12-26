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
      <div className="border-2 border-border flex justify-between items-center rounded-lg max-w-3xl mx-auto mb-8 backdrop-blur-sm text-foreground p-4">
        <h1 className="text-2xl font-bold">Anonlove</h1>
        <div className="flex space-x-4 items-center">
          <Link href="/" passHref>
            <button className="px-4 py-2 rounded hover:bg-foreground/10 transition-all duration-150 ease-linear">
              AnonLink
            </button>
          </Link>
          <Link href="https://keiran.cc" passHref>
            <button className="px-4 py-2 rounded hover:bg-foreground/10 transition-all duration-150 ease-linear">
              AnonHost
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
