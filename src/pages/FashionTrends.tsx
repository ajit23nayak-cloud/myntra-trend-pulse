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
        "md:ml-64 ml-0"
      )}>
        <Header />
        
        <div className="p-4 md:p-6 space-y-4 md:space-y-6 pt-16 md:pt-6">
          <EnhancedTrendsSection />
        </div>
      </main>
    </div>
  );
};

export default FashionTrends;
