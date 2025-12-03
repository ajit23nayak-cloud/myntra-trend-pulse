import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { EnhancedTrendsSection } from '@/components/dashboard/EnhancedTrendsSection';
import { cn } from '@/lib/utils';

const FashionTrends = () => {
  const [activeSection, setActiveSection] = useState('trends');

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
        
        <div className="p-6 space-y-6">
          <EnhancedTrendsSection />
        </div>
      </main>
    </div>
  );
};

export default FashionTrends;
