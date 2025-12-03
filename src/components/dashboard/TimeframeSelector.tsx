import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { TimeframeOption } from '@/types/database';

interface TimeframeSelectorProps {
  value: TimeframeOption;
  onChange: (value: TimeframeOption) => void;
}

export function TimeframeSelector({ value, onChange }: TimeframeSelectorProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as TimeframeOption)}>
      <SelectTrigger className="w-[140px] bg-card border-border">
        <SelectValue placeholder="Timeframe" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="daily">Daily</SelectItem>
        <SelectItem value="weekly">Weekly</SelectItem>
        <SelectItem value="monthly">Monthly</SelectItem>
        <SelectItem value="quarterly">Quarterly</SelectItem>
      </SelectContent>
    </Select>
  );
}
