import { Button } from "@/components/ui/button";

interface ShortenButtonProps {
  onClick: () => void;
}

export function ShortenButton({ onClick }: ShortenButtonProps) {
  return (
    <Button onClick={onClick} className="w-full">
      Shorten URL
    </Button>
  );
}
