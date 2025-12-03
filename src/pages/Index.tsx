import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { OverviewSection } from '@/components/dashboard/OverviewSection';
import { EnhancedSentimentSection } from '@/components/dashboard/EnhancedSentimentSection';
import { EnhancedTrendsSection } from '@/components/dashboard/EnhancedTrendsSection';
import { EnhancedCompetitorSection } from '@/components/dashboard/EnhancedCompetitorSection';
import { EnhancedInsightsSection } from '@/components/dashboard/EnhancedInsightsSection';
import { AlertsSection } from '@/components/dashboard/AlertsSection';
import { RealTimeAlertBanner } from '@/components/dashboard/RealTimeAlertBanner';
import { cn } from '@/lib/utils';

const Index = () => {
  const [activeSection, setActiveSection] = useState('overview');

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
        "ml-64"
      )}>
        <Header />
        
        <div className="p-6">
          <RealTimeAlertBanner />
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default Index;
