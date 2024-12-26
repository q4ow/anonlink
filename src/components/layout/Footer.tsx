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
      className="text-foreground py-6 fixed bottom-0 w-full backdrop-blur-sm border-t border-border/40"
    >
      <div className="container mx-auto px-4">
        <p className="flex items-center justify-center gap-2 text-sm font-medium">
          Made with{" "}
          <Heart className="inline-block w-4 h-4 text-red-500 hover:scale-110 transition-transform duration-200" />{" "}
          by Keiran using{" "}
          <SiNextdotjs className="w-4 h-4text-primary hover:scale-110 transition-transform duration-200" />{" "}
          and{" "}
          <RiTailwindCssFill className="w-4 h-4 text-[#38bdf8] hover:scale-110 transition-transform duration-200" />{" "}
          |{" "}
          <a
            href="https://github.com/keirim/anonlink"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 font-medium transition-all duration-200 hover:text-primary group"
          >
            <FaGithub className="group-hover:rotate-12 transition-transform duration-200" />{" "}
            View on GitHub
          </a>
        </p>
      </div>
    </motion.footer>
  );
}
