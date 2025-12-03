import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { useFashionTrends } from '@/hooks/useDashboardData';
import { cn } from '@/lib/utils';

const statusColors = {
  emerging: 'bg-teal/20 text-teal',
  established: 'bg-purple/20 text-purple',
  peaking: 'bg-orange/20 text-orange',
  cooling: 'bg-muted text-muted-foreground'
};

// Fallback images for trends without scraped images
const fallbackImages: Record<string, string> = {
  'y2k': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
  'oversized': 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop',
  'cargo': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop',
  'coquette': 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=400&fit=crop',
  'quiet luxury': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=400&fit=crop',
  'mob wife': 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=400&fit=crop',
  'winter': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop',
  'sheer': 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=400&fit=crop',
  'leopard': 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=400&fit=crop',
  'lingerie': 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=400&fit=crop',
  'silver': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
  'jacket': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
  'pinterest': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getTrendImage(trend: any): string {
  // Use the scraped image_url if available (new column may not be in types yet)
  if (trend.image_url) {
    return trend.image_url;
  }
  
  // Fallback to keyword matching
  const lowerName = trend.trend_name.toLowerCase();
  for (const [key, url] of Object.entries(fallbackImages)) {
    if (lowerName.includes(key)) {
      return url;
    }
  }
  
  // Default fashion image
  return 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop';
}

export function TrendImageGallery() {
  const { data: trends, isLoading } = useFashionTrends();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    );
  }

  const displayTrends = trends?.slice(0, 8) || [];

  if (displayTrends.length === 0) {
    return (
      <Card className="p-8 text-center">
        <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No trend images available yet</p>
        <p className="text-sm text-muted-foreground mt-1">Run the trend scraper to fetch images</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-purple" />
          <h3 className="font-semibold">Trending Styles Gallery</h3>
        </div>
        <Badge variant="outline">{displayTrends.length} trends</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayTrends.map((trend) => {
          const imageUrl = getTrendImage(trend);
          const status = trend.status || 'emerging';
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const hasRealImage = !!(trend as any).image_url;
          
          return (
            <Card 
              key={trend.id} 
              className="group relative overflow-hidden cursor-pointer hover:shadow-lg transition-all"
            >
              <div className="aspect-square relative">
                <img
                  src={imageUrl}
                  alt={trend.trend_name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop';
                  }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Status badge */}
                <Badge 
                  className={cn("absolute top-2 right-2 text-xs", statusColors[status])}
                >
                  {status}
                </Badge>
                
                {/* Real image indicator */}
                {hasRealImage && (
                  <Badge 
                    variant="outline"
                    className="absolute top-2 left-2 text-xs bg-background/50 backdrop-blur-sm"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Scraped
                  </Badge>
                )}

                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <h4 className="font-semibold text-sm mb-1 line-clamp-1">{trend.trend_name}</h4>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{trend.growth_rate?.toFixed(0) || 0}% growth</span>
                    </div>
                    <div className="flex gap-1">
                      {trend.platforms?.slice(0, 2).map(p => (
                        <span key={p} className="opacity-75">{p}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hover details */}
              <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold text-white mb-2">{trend.trend_name}</h4>
                  <p className="text-xs text-white/70 line-clamp-3">{trend.description || 'Trending fashion style'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-white/80">
                    <span>Velocity Score</span>
                    <span className="font-medium">{trend.velocity_score?.toFixed(0) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-xs text-white/80">
                    <span>Inventory Match</span>
                    <span className="font-medium">{trend.myntra_inventory_match?.toFixed(0) || 'N/A'}%</span>
                  </div>
                  <div className="flex justify-between text-xs text-white/80">
                    <span>Est. Lifespan</span>
                    <span className="font-medium">{trend.predicted_lifespan_weeks || 'N/A'} weeks</span>
                  </div>
                  {trend.hashtags && trend.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {trend.hashtags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs bg-white/20 px-1.5 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}