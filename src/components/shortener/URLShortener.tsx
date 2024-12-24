"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { URLInput } from "@/components/shortener/URLInput";
import { DomainSelector } from "@/components/shortener/DomainSelector";
import { ShortenButton } from "@/components/shortener/ShortenButton";
import { LinkDisplay } from "@/components/shortener/LinkDisplay";

export function URLShortener() {
  const [longUrl, setLongUrl] = useState("");
  const [domain, setDomain] = useState("kdev.pw");
  const [shortUrl, setShortUrl] = useState("");

  const handleShorten = async () => {
    try {
      const response = await fetch("http://localhost:8080/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: longUrl, domain }),
      });
      const data = await response.json();
      setShortUrl(data.shortUrl);
    } catch (error) {
      console.error("Error shortening URL:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 max-w-md mx-auto"
    >
      <URLInput value={longUrl} onChange={setLongUrl} />
      <DomainSelector value={domain} onChange={setDomain} />
      <ShortenButton onClick={handleShorten} />
      {shortUrl && <LinkDisplay shortUrl={shortUrl} />}
    </motion.div>
  );
}
