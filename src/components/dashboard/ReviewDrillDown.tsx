import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useSentimentReviews } from '@/hooks/useDashboardData';
import type { SentimentTheme, CustomerCohort, RegionType } from '@/types/database';
import { MessageSquare, Star, ThumbsUp, ThumbsDown, Minus, Calendar, MapPin, Users } from 'lucide-react';

interface ReviewDrillDownProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: SentimentTheme | null;
  themeLabel: string;
  cohort?: CustomerCohort;
  region?: RegionType;
}

const sentimentIcons = {
  positive: ThumbsUp,
  negative: ThumbsDown,
  neutral: Minus
};

const sentimentColors = {
  positive: 'text-teal bg-teal/10',
  negative: 'text-coral bg-coral/10',
  neutral: 'text-muted-foreground bg-muted'
};

const cohortLabels: Record<CustomerCohort, string> = {
  gen_z: 'Gen Z',
  millennial: 'Millennials',
  gen_x: 'Gen X',
  new_user: 'New Users',
  returning_user: 'Returning Users',
  loyal_user: 'Loyal Users'
};

const regionLabels: Record<RegionType, string> = {
  metro: 'Metro',
  tier_1: 'Tier 1',
  tier_2: 'Tier 2',
  tier_3: 'Tier 3'
};

export function ReviewDrillDown({ open, onOpenChange, theme, themeLabel, cohort, region }: ReviewDrillDownProps) {
  const { data: reviews, isLoading } = useSentimentReviews({ 
    theme: theme || undefined, 
    cohort, 
    region, 
    limit: 20 
  });

  const filteredReviews = reviews || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-coral" />
            {themeLabel} Reviews
          </DialogTitle>
          <div className="flex gap-2 mt-2">
            {cohort && (
              <Badge variant="outline" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                {cohortLabels[cohort]}
              </Badge>
            )}
            {region && (
              <Badge variant="outline" className="text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                {regionLabels[region]}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No reviews found for this theme</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReviews.map((review) => {
                const SentimentIcon = sentimentIcons[review.sentiment];
                return (
                  <Card key={review.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant="secondary" 
                            className={sentimentColors[review.sentiment]}
                          >
                            <SentimentIcon className="w-3 h-3 mr-1" />
                            {review.sentiment}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Score: {(review.sentiment_score * 100).toFixed(0)}%
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {review.source}
                          </Badge>
                        </div>
                        
                        <p className="text-sm mb-3">{review.review_text}</p>
                        
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(review.review_date).toLocaleDateString()}
                          </span>
                          {review.product_category && (
                            <Badge variant="outline" className="text-xs">
                              {review.product_category}
                            </Badge>
                          )}
                          {review.customer_cohort && (
                            <Badge variant="outline" className="text-xs">
                              {cohortLabels[review.customer_cohort]}
                            </Badge>
                          )}
                          {review.region && (
                            <Badge variant="outline" className="text-xs">
                              {regionLabels[review.region]}
                            </Badge>
                          )}
                        </div>

                        {review.key_phrases && review.key_phrases.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {review.key_phrases.slice(0, 5).map((phrase, i) => (
                              <span 
                                key={i} 
                                className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                              >
                                {phrase}
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
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
