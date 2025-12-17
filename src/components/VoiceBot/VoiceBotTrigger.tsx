import { useState } from 'react';
import { Bot, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoiceBot } from './VoiceBot';
import { cn } from '@/lib/utils';

export const VoiceBotTrigger = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-4 right-4 md:right-6 h-14 w-14 rounded-full shadow-lg z-50",
          "bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
          "transition-all duration-300 hover:scale-105",
          isOpen && "rotate-0"
        )}
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-primary-foreground" />
        ) : (
          <Bot className="h-6 w-6 text-primary-foreground" />
        )}
      </Button>
      
      <VoiceBot isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
