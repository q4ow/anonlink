"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { URLInput } from "@/components/shortener/URLInput";
import { DomainSelector } from "@/components/shortener/DomainSelector";
import { ShortenButton } from "@/components/shortener/ShortenButton";
import { LinkDisplay } from "@/components/shortener/LinkDisplay";
import ShareXUploader from "./SharexUploader";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export function URLShortener() {
  const [longUrl, setLongUrl] = useState("");
  const [domain, setDomain] = useState("kdev.pw");
  const [shortUrl, setShortUrl] = useState("");

  const handleShorten = async () => {
    try {
      const response = await fetch("https://kdev.pw/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: longUrl, domain }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(
          `Error: ${response.status} - ${response.statusText}`,
          errorData,
        );
        return;
      }

      const data = await response.json();
      setShortUrl(data.shortUrl);
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>URL Shortener</CardTitle>
          <CardDescription>
            Shorten your URLs with a custom domain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <URLInput
            value={longUrl}
            onChange={setLongUrl}
          />
          <DomainSelector
            value={domain}
            onChange={setDomain}
          />
          <ShortenButton onClick={handleShorten} />
          {shortUrl && <LinkDisplay shortUrl={shortUrl} />}
          <div className="flex justify-center">
            <ShareXUploader />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
