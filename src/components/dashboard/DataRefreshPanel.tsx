import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, TrendingUp, MessageSquare, ShoppingBag, Lightbulb, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ScrapeStatus = 'idle' | 'loading' | 'success' | 'error';

interface ScrapeResult {
  status: ScrapeStatus;
  message?: string;
  data?: any;
}

export function DataRefreshPanel() {
  const { toast } = useToast();
  const [scrapeStatus, setScrapeStatus] = useState<Record<string, ScrapeResult>>({
    competitor: { status: 'idle' },
    trends: { status: 'idle' },
    reviews: { status: 'idle' },
    insights: { status: 'idle' },
  });
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);

  const scrapeEndpoints = [
    { key: 'competitor', name: 'Competitor Data', icon: ShoppingBag, endpoint: 'scrape-competitor-data', description: 'AJIO prices & deals' },
    { key: 'trends', name: 'Fashion Trends', icon: TrendingUp, endpoint: 'scrape-trends', description: 'Social media trends' },
    { key: 'reviews', name: 'Customer Reviews', icon: MessageSquare, endpoint: 'scrape-reviews', description: 'App store & Trustpilot' },
    { key: 'insights', name: 'AI Insights', icon: Lightbulb, endpoint: 'generate-insights', description: 'Generate recommendations' },
  ];

  const callScrapeFunction = async (key: string, endpoint: string) => {
    setScrapeStatus(prev => ({ ...prev, [key]: { status: 'loading' } }));

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (data.success) {
        setScrapeStatus(prev => ({
          ...prev,
          [key]: { status: 'success', message: 'Data refreshed', data }
        }));
        toast({
          title: 'Success',
          description: `${scrapeEndpoints.find(e => e.key === key)?.name} refreshed successfully`,
        });
      } else {
        throw new Error(data.error || 'Scrape failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setScrapeStatus(prev => ({
        ...prev,
        [key]: { status: 'error', message: errorMessage }
      }));
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const refreshAll = async () => {
    setIsRefreshingAll(true);
    
    // Run sequentially to avoid rate limits
    for (const endpoint of scrapeEndpoints) {
      await callScrapeFunction(endpoint.key, endpoint.endpoint);
      // Small delay between calls
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setIsRefreshingAll(false);
    toast({
      title: 'All Data Refreshed',
      description: 'Dashboard data has been updated from real-time sources',
    });
  };

  const getStatusIcon = (status: ScrapeStatus) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-teal" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-coral" />;
      default:
        return null;
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Real-Time Data Refresh</CardTitle>
            <CardDescription>Scrape live data from external sources</CardDescription>
          </div>
          <Button 
            onClick={refreshAll} 
            disabled={isRefreshingAll}
            className="gap-2"
          >
            {isRefreshingAll ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {scrapeEndpoints.map((endpoint) => {
            const Icon = endpoint.icon;
            const status = scrapeStatus[endpoint.key];
            
            return (
              <button
                key={endpoint.key}
                onClick={() => callScrapeFunction(endpoint.key, endpoint.endpoint)}
                disabled={status.status === 'loading' || isRefreshingAll}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  {getStatusIcon(status.status)}
                </div>
                <span className="text-sm font-medium">{endpoint.name}</span>
                <span className="text-xs text-muted-foreground">{endpoint.description}</span>
                {status.data && (
                  <Badge variant="outline" className="text-xs">
                    {status.data.trends_scraped || status.data.reviews_scraped || status.data.deals_scraped || status.data.insights_generated || 0} items
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
