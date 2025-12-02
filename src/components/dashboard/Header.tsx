import { Search, RefreshCw, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Search */}
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search trends, insights, alerts..." 
            className="pl-10 bg-secondary/50 border-border focus:border-primary"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Last 30 days</span>
          </Button>
          
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <RefreshCw className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-8 bg-border mx-2" />
          
          <Button variant="ghost" size="sm" className="gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral to-purple flex items-center justify-center">
              <User className="w-4 h-4 text-foreground" />
            </div>
            <span className="font-medium">Admin</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
