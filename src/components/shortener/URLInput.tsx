import { Input } from "@/components/ui/input";

interface URLInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function URLInput({ value, onChange }: URLInputProps) {
  return (
    <Input
      type="url"
      placeholder="Enter your long URL"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
