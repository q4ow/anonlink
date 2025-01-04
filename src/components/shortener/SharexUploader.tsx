"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FaRegClipboard, FaFileDownload, FaFileUpload } from "react-icons/fa";

const domains = ["kdev.pw", "keiran.tech", "kuuichi.xyz", "keirandev.me"];

export default function ShareXUploader() {
  const [domain, setDomain] = useState(domains[0]);

  const generateConfig = (domain: string) => {
    return JSON.stringify(
      {
        Version: "14.0.0",
        Name: "AnonLink Shortener",
        DestinationType: "URLShortener",
        RequestMethod: "POST",
        RequestURL: "https://api.kdev.pw/shorten",
        Headers: {
          "Content-Type": "application/json",
        },
        Body: "JSON",
        Data: `{\n  "url": "{input}",\n  "domain": "${domain}"\n}`,
        URL: "{json:shortUrl}",
      },
      null,
      2,
    );
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateConfig(domain));
  };

  const saveToDisk = () => {
    const blob = new Blob([generateConfig(domain)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "AnonLink.sxcu";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      className="mt-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button className="bg-foreground text-background">
            <FaFileUpload className="mr-2 h-4 w-4" /> ShareX Uploader
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 mt-2">
          <div className="space-y-4">
            <Select
              value={domain}
              onValueChange={setDomain}
            >
              <SelectTrigger className="bg-input text-primary">
                <SelectValue placeholder="Select a domain" />
              </SelectTrigger>
              <SelectContent>
                {domains.map((d) => (
                  <SelectItem
                    key={d}
                    value={d}
                  >
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex space-x-2">
              <Button
                onClick={copyToClipboard}
                className="flex-1 bg-foreground text-background"
              >
                <FaRegClipboard className="h-4 w-4" /> Copy Config
              </Button>
              <Button
                onClick={saveToDisk}
                className="flex-1 bg-foreground text-background"
              >
                <FaFileDownload className="h-4 w-4" /> Save Config
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </motion.div>
  );
}
