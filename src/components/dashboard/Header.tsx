import { useState } from 'react';
import { RefreshCw, Calendar, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ThemeToggle';

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
      <div className="flex items-center justify-end h-16 px-4 md:px-6 ml-12 md:ml-0">

        {/* Actions */}
        <div className="flex items-center gap-1 md:gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 md:gap-2 text-muted-foreground px-2 md:px-3">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">{selectedLabel}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
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

          <ThemeToggle />
          
          <div className="w-px h-8 bg-border mx-1 md:mx-2 hidden sm:block" />
          
          <Button variant="ghost" size="sm" className="gap-2 px-2 md:px-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF3F6C] to-[#FF527B] flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium hidden sm:inline">Admin</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
