import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DomainSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function DomainSelector({ value, onChange }: DomainSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select a domain" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="kdev.pw">kdev.pw</SelectItem>
        <SelectItem value="keiran.tech">keiran.tech</SelectItem>
        <SelectItem value="kuuichi.xyz">kuuichi.xyz</SelectItem>
        <SelectItem value="keirandev.me">keirandev.me</SelectItem>
      </SelectContent>
    </Select>
  );
}
