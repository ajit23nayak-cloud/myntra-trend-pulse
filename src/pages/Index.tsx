import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { OverviewSection } from '@/components/dashboard/OverviewSection';
import { EnhancedSentimentSection } from '@/components/dashboard/EnhancedSentimentSection';
import { EnhancedTrendsSection } from '@/components/dashboard/EnhancedTrendsSection';
import { EnhancedCompetitorSection } from '@/components/dashboard/EnhancedCompetitorSection';
import { EnhancedInsightsSection } from '@/components/dashboard/EnhancedInsightsSection';
import { AlertsSection } from '@/components/dashboard/AlertsSection';
import { RealTimeAlertBanner } from '@/components/dashboard/RealTimeAlertBanner';
import { DataRefreshPanel } from '@/components/dashboard/DataRefreshPanel';
import { cn } from '@/lib/utils';

const Index = () => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('overview');

  // Handle section passed via navigation state
  useEffect(() => {
    const state = location.state as { section?: string } | null;
    if (state?.section) {
      setActiveSection(state.section);
      // Clear the state to prevent re-triggering on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection onNavigate={setActiveSection} />;
      case 'sentiment':
        return <EnhancedSentimentSection />;
      case 'trends':
        return <EnhancedTrendsSection />;
      case 'competitor':
        return <EnhancedCompetitorSection />;
      case 'insights':
        return <EnhancedInsightsSection />;
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
        "md:ml-64 ml-0"
      )}>
        <Header />
        
        <div className="p-4 md:p-6 space-y-4 md:space-y-6 pt-16 md:pt-6">
          {activeSection === 'alerts' && <RealTimeAlertBanner />}
          {activeSection === 'overview' && <DataRefreshPanel />}
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default Index;
