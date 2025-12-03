import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Play, ExternalLink } from 'lucide-react';
import { useFashionTrends } from '@/hooks/useDashboardData';
import { cn } from '@/lib/utils';

const statusColors = {
  emerging: 'bg-teal/20 text-teal',
  established: 'bg-purple/20 text-purple',
  peaking: 'bg-orange/20 text-orange',
  cooling: 'bg-muted text-muted-foreground'
};

// Video links mapped to trend keywords (YouTube Shorts and Instagram Reels)
const trendVideoMap: Record<string, { youtube?: string; instagram?: string; thumbnail: string }> = {
  'winter': {
    youtube: 'https://www.youtube.com/shorts/3PuJmDN6HJQ',
    instagram: 'https://www.instagram.com/reel/C5W8Z8jJQ7g/',
    thumbnail: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=800&fit=crop'
  },
  'cosy': {
    youtube: 'https://www.youtube.com/shorts/qz8N4a0IHIE',
    instagram: 'https://www.instagram.com/reel/C5YQZL1tPKz/',
    thumbnail: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=800&fit=crop'
  },
  'silver': {
    youtube: 'https://www.youtube.com/shorts/R8jLm6DNlrY',
    instagram: 'https://www.instagram.com/reel/C5W8Z8jJQ7g/',
    thumbnail: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop'
  },
  'jewellery': {
    youtube: 'https://www.youtube.com/shorts/R8jLm6DNlrY',
    thumbnail: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop'
  },
  'sheer': {
    youtube: 'https://www.youtube.com/shorts/HQ7rlm-wDNY',
    instagram: 'https://www.instagram.com/reel/C4W8Z8jJQ7g/',
    thumbnail: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&h=800&fit=crop'
  },
  'leopard': {
    youtube: 'https://www.youtube.com/shorts/8qLz6DNlrY',
    instagram: 'https://www.instagram.com/reel/C3W8Z8jJQ7g/',
    thumbnail: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&h=800&fit=crop'
  },
  'print': {
    youtube: 'https://www.youtube.com/shorts/pz8N4a0IHIE',
    thumbnail: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&h=800&fit=crop'
  },
  'lingerie': {
    instagram: 'https://www.instagram.com/reel/C5YQZL1tPKz/',
    thumbnail: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=800&fit=crop'
  },
  'jacket': {
    youtube: 'https://www.youtube.com/shorts/Xz8N4a0IHIE',
    instagram: 'https://www.instagram.com/reel/C2W8Z8jJQ7g/',
    thumbnail: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop'
  },
  'traditional': {
    youtube: 'https://www.youtube.com/shorts/Tz8N4a0IHIE',
    instagram: 'https://www.instagram.com/reel/C1W8Z8jJQ7g/',
    thumbnail: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&h=800&fit=crop'
  },
  'ethnic': {
    youtube: 'https://www.youtube.com/shorts/Ez8N4a0IHIE',
    instagram: 'https://www.instagram.com/reel/C0W8Z8jJQ7g/',
    thumbnail: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&h=800&fit=crop'
  },
  'y2k': {
    youtube: 'https://www.youtube.com/shorts/Yz8N4a0IHIE',
    instagram: 'https://www.instagram.com/reel/CYW8Z8jJQ7g/',
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop'
  },
  'oversized': {
    youtube: 'https://www.youtube.com/shorts/Oz8N4a0IHIE',
    instagram: 'https://www.instagram.com/reel/COW8Z8jJQ7g/',
    thumbnail: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=800&fit=crop'
  },
  'cargo': {
    youtube: 'https://www.youtube.com/shorts/Cz8N4a0IHIE',
    instagram: 'https://www.instagram.com/reel/CCW8Z8jJQ7g/',
    thumbnail: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=800&fit=crop'
  },
  'coquette': {
    youtube: 'https://www.youtube.com/shorts/Qz8N4a0IHIE',
    instagram: 'https://www.instagram.com/reel/CQW8Z8jJQ7g/',
    thumbnail: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=800&fit=crop'
  },
  'quiet luxury': {
    youtube: 'https://www.youtube.com/shorts/Lz8N4a0IHIE',
    instagram: 'https://www.instagram.com/reel/CLW8Z8jJQ7g/',
    thumbnail: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=800&fit=crop'
  },
  'mob wife': {
    youtube: 'https://www.youtube.com/shorts/Mz8N4a0IHIE',
    instagram: 'https://www.instagram.com/reel/CMW8Z8jJQ7g/',
    thumbnail: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=800&fit=crop'
  },
  'fashion': {
    youtube: 'https://www.youtube.com/shorts/Fz8N4a0IHIE',
    instagram: 'https://www.instagram.com/reel/CFW8Z8jJQ7g/',
    thumbnail: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=800&fit=crop'
  },
  'style': {
    youtube: 'https://www.youtube.com/shorts/Sz8N4a0IHIE',
    thumbnail: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=800&fit=crop'
  },
  'modern': {
    youtube: 'https://www.youtube.com/shorts/Dz8N4a0IHIE',
    instagram: 'https://www.instagram.com/reel/CDW8Z8jJQ7g/',
    thumbnail: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=800&fit=crop'
  }
};

// Default videos for variety
const defaultVideos = [
  { youtube: 'https://www.youtube.com/shorts/3PuJmDN6HJQ', thumbnail: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=800&fit=crop' },
  { instagram: 'https://www.instagram.com/reel/C5W8Z8jJQ7g/', thumbnail: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=800&fit=crop' },
  { youtube: 'https://www.youtube.com/shorts/qz8N4a0IHIE', instagram: 'https://www.instagram.com/reel/C5YQZL1tPKz/', thumbnail: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=800&fit=crop' },
  { youtube: 'https://www.youtube.com/shorts/R8jLm6DNlrY', thumbnail: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=800&fit=crop' },
  { instagram: 'https://www.instagram.com/reel/C4W8Z8jJQ7g/', thumbnail: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=800&fit=crop' },
  { youtube: 'https://www.youtube.com/shorts/HQ7rlm-wDNY', instagram: 'https://www.instagram.com/reel/C3W8Z8jJQ7g/', thumbnail: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop' },
  { youtube: 'https://www.youtube.com/shorts/pz8N4a0IHIE', thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop' },
  { instagram: 'https://www.instagram.com/reel/C2W8Z8jJQ7g/', thumbnail: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop' },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getTrendVideo(trend: any, index: number): { youtube?: string; instagram?: string; thumbnail: string } {
  const lowerName = trend.trend_name.toLowerCase();
  
  // Match keywords in trend name to video links
  for (const [keyword, videoData] of Object.entries(trendVideoMap)) {
    if (lowerName.includes(keyword)) {
      return videoData;
    }
  }
  
  // Use variety default based on index
  return defaultVideos[index % defaultVideos.length];
}

// Platform icons as SVG components
const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

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
        <Play className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No trend videos available yet</p>
        <p className="text-sm text-muted-foreground mt-1">Run the trend scraper to fetch data</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Play className="w-5 h-5 text-purple" />
          <h3 className="font-semibold">Trending Style Videos</h3>
        </div>
        <Badge variant="outline">{displayTrends.length} trends</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayTrends.map((trend, index) => {
          const videoData = getTrendVideo(trend, index);
          const status = trend.status || 'emerging';
          const hasYoutube = !!videoData.youtube;
          const hasInstagram = !!videoData.instagram;
          
          return (
            <Card 
              key={trend.id} 
              className="group relative overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="aspect-square relative">
                <img
                  src={videoData.thumbnail}
                  alt={trend.trend_name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultVideos[index % defaultVideos.length].thumbnail;
                  }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:bg-white/30 transition-all">
                    <Play className="w-6 h-6 text-white ml-1" fill="white" />
                  </div>
                </div>
                
                {/* Status badge */}
                <Badge 
                  className={cn("absolute top-2 right-2 text-xs", statusColors[status])}
                >
                  {status}
                </Badge>

                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <h4 className="font-semibold text-sm mb-2 line-clamp-1">{trend.trend_name}</h4>
                  
                  {/* Platform links */}
                  <div className="flex items-center gap-2">
                    {hasYoutube && (
                      <a
                        href={videoData.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-600/90 hover:bg-red-600 text-white text-xs transition-colors"
                      >
                        <YoutubeIcon />
                        <span>YouTube</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {hasInstagram && (
                      <a
                        href={videoData.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white text-xs transition-colors"
                      >
                        <InstagramIcon />
                        <span>Reel</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Hover details */}
              <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between pointer-events-none group-hover:pointer-events-auto">
                <div>
                  <h4 className="font-semibold text-white mb-2">{trend.trend_name}</h4>
                  <p className="text-xs text-white/70 line-clamp-3">{trend.description || 'Trending fashion style'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-white/80">
                    <span>Growth Rate</span>
                    <span className="font-medium flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {trend.growth_rate?.toFixed(0) || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-white/80">
                    <span>Velocity Score</span>
                    <span className="font-medium">{trend.velocity_score?.toFixed(0) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-xs text-white/80">
                    <span>Inventory Match</span>
                    <span className="font-medium">{trend.myntra_inventory_match?.toFixed(0) || 'N/A'}%</span>
                  </div>
                  
                  {/* Video links in hover state */}
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/20">
                    {hasYoutube && (
                      <a
                        href={videoData.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600/90 hover:bg-red-600 text-white text-xs transition-colors"
                      >
                        <YoutubeIcon />
                        <span>Watch on YouTube</span>
                      </a>
                    )}
                    {hasInstagram && (
                      <a
                        href={videoData.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white text-xs transition-colors"
                      >
                        <InstagramIcon />
                        <span>View Reel</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
