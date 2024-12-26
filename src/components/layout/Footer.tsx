"use client";

import { Heart } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { SiNextdotjs } from "react-icons/si";
import { RiTailwindCssFill } from "react-icons/ri";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed bottom-0 w-full border-t border-border/40 py-6 text-foreground backdrop-blur-sm"
    >
      <div className="container mx-auto px-4">
        <p className="flex items-center justify-center gap-2 text-sm font-medium">
          Made with{" "}
          <Heart className="inline-block h-4 w-4 text-red-500 transition-transform duration-200 hover:scale-110" />{" "}
          by Keiran using{" "}
          <SiNextdotjs className="h-4text-primary w-4 transition-transform duration-200 hover:scale-110" />{" "}
          and{" "}
          <RiTailwindCssFill className="h-4 w-4 text-[#38bdf8] transition-transform duration-200 hover:scale-110" />{" "}
          |{" "}
          <a
            href="https://github.com/keirim/anonlink"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-2 font-medium transition-all duration-200 hover:text-primary"
          >
            <FaGithub className="transition-transform duration-200 group-hover:rotate-12" />{" "}
            View on GitHub
          </a>
        </p>
      </div>
    </motion.footer>
  );
}
