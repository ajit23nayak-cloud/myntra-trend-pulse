import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { OverviewSection } from '@/components/dashboard/OverviewSection';
import { SentimentSection } from '@/components/dashboard/SentimentSection';
import { TrendsSection } from '@/components/dashboard/TrendsSection';
import { CompetitorSection } from '@/components/dashboard/CompetitorSection';
import { InsightsSection } from '@/components/dashboard/InsightsSection';
import { AlertsSection } from '@/components/dashboard/AlertsSection';
import { cn } from '@/lib/utils';

const Index = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection onNavigate={setActiveSection} />;
      case 'sentiment':
        return <SentimentSection />;
      case 'trends':
        return <TrendsSection />;
      case 'competitor':
        return <CompetitorSection />;
      case 'insights':
        return <InsightsSection />;
      case 'alerts':
        return <AlertsSection />;
      default:
        return <OverviewSection onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
      />
      
      <main className={cn(
        "transition-all duration-300",
        "ml-64" // Default sidebar width
      )}>
        <Header />
        
        <div className="p-6">
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default Index;
