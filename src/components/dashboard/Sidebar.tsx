import { 
  LayoutDashboard, 
  MessageSquareText, 
  TrendingUp, 
  Target, 
  Lightbulb, 
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'sentiment', label: 'Sentiment Analysis', icon: MessageSquareText },
  { id: 'trends', label: 'Fashion Trends', icon: TrendingUp },
  { id: 'competitor', label: 'Competitor Intel', icon: Target },
  { id: 'insights', label: 'Insights', icon: Lightbulb },
  { id: 'alerts', label: 'Alerts', icon: Bell },
];

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border z-50 transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coral to-purple flex items-center justify-center">
              <span className="font-display font-bold text-foreground">M</span>
            </div>
            {!collapsed && (
              <div className="animate-fade-in">
                <h1 className="font-display font-bold text-lg text-foreground">Myntra</h1>
                <p className="text-xs text-muted-foreground">AI Dashboard</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  isActive 
                    ? "bg-primary/15 text-primary border border-primary/30" 
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5 shrink-0", isActive && "text-primary")} />
                {!collapsed && (
                  <span className="font-medium animate-fade-in">{item.label}</span>
                )}
                {item.id === 'alerts' && !collapsed && (
                  <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                    3
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Settings & Collapse */}
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-all duration-200">
            <Settings className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="font-medium">Settings</span>}
          </button>
          
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-all duration-200"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 shrink-0" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5 shrink-0" />
                <span className="font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
