import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { FaClipboard } from "react-icons/fa";
import { useState } from "react";

interface LinkDisplayProps {
  shortUrl: string;
}

export function LinkDisplay({ shortUrl }: LinkDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-medium text-muted-foreground">
            Your shortened URL:
          </p>
          <div className="flex items-center space-x-2">
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-primary hover:underline"
            >
              {shortUrl}
            </a>
            <motion.button
              onClick={handleCopy}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="hover:text-primary-dark flex items-center p-1 text-primary"
              aria-label="Copy URL"
            >
              <FaClipboard />
            </motion.button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
