import { useState } from 'react';
import { RefreshCw, Calendar, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const timelineOptions = [
  { label: 'Last 15 days', value: '15d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 3 months', value: '3m' },
];

interface HeaderProps {
  onTimelineChange?: (timeline: string) => void;
}

export function Header({ onTimelineChange }: HeaderProps) {
  const [selectedTimeline, setSelectedTimeline] = useState('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleTimelineSelect = (value: string) => {
    setSelectedTimeline(value);
    handleRefresh();
    onTimelineChange?.(value);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh - in production this would trigger data fetch
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const selectedLabel = timelineOptions.find(t => t.value === selectedTimeline)?.label || 'Last 30 days';

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Page Title */}
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-foreground">Myntra TrendPulse</h1>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">AI Dashboard</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{selectedLabel}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {timelineOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleTimelineSelect(option.value)}
                  className={selectedTimeline === option.value ? 'bg-accent' : ''}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          
          <div className="w-px h-8 bg-border mx-2" />
          
          <Button variant="ghost" size="sm" className="gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF3F6C] to-[#FF527B] flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium">Admin</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
