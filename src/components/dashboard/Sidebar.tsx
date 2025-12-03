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
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, route: '/' },
  { id: 'sentiment', label: 'Sentiment Analysis', icon: MessageSquareText, route: '/' },
  { id: 'trends', label: 'Fashion Trends', icon: TrendingUp, route: '/fashion-trends' },
  { id: 'competitor', label: 'Competitor Intel', icon: Target, route: '/' },
  { id: 'insights', label: 'Insights', icon: Lightbulb, route: '/' },
  { id: 'alerts', label: 'Alerts', icon: Bell, route: '/' },
];

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.route === '/fashion-trends') {
      navigate('/fashion-trends');
    } else {
      if (location.pathname !== '/') {
        navigate('/');
      }
      onSectionChange(item.id);
    }
  };

  const isActive = (item: typeof navItems[0]) => {
    if (item.route === '/fashion-trends') {
      return location.pathname === '/fashion-trends';
    }
    return location.pathname === '/' && activeSection === item.id;
  };

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border z-50 transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-3" onClick={() => onSectionChange('overview')}>
            {/* Myntra Logo */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF3F6C] to-[#FF527B] flex items-center justify-center shadow-lg">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
                <path d="M5 3L12 21L19 3H16L12 14L8 3H5Z" />
              </svg>
            </div>
            {!collapsed && (
              <div className="animate-fade-in">
                <h1 className="font-display font-bold text-lg text-foreground">Myntra</h1>
                <p className="text-xs text-coral font-semibold tracking-wide">TrendPulse</p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  active 
                    ? "bg-primary/15 text-primary border border-primary/30" 
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5 shrink-0", active && "text-primary")} />
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
