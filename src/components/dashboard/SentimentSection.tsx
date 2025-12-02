import { sentimentOverTime, sentimentThemes, recentFeedback } from '@/data/mockData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { MessageCircle, Twitter, Instagram, Star, Youtube } from 'lucide-react';
import { cn } from '@/lib/utils';

const sourceIcons: Record<string, React.ReactNode> = {
  'Play Store': <Star className="w-4 h-4" />,
  'App Store': <Star className="w-4 h-4" />,
  'Twitter': <Twitter className="w-4 h-4" />,
  'Instagram': <Instagram className="w-4 h-4" />,
  'YouTube': <Youtube className="w-4 h-4" />,
  'Trustpilot': <Star className="w-4 h-4" />,
};

export function SentimentSection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Sentiment Analysis</h2>
          <p className="text-muted-foreground">Real-time customer feedback insights</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-teal"></div>
            <span className="text-muted-foreground">Positive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-coral"></div>
            <span className="text-muted-foreground">Negative</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
            <span className="text-muted-foreground">Neutral</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Over Time Chart */}
        <div className="glass-card p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-foreground mb-4">Sentiment Trend (8 Weeks)</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sentimentOverTime}>
                <defs>
                  <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(350, 89%, 60%)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(350, 89%, 60%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 20%)" />
                <XAxis dataKey="week" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(222, 47%, 8%)', 
                    border: '1px solid hsl(217, 33%, 20%)',
                    borderRadius: '8px',
                    color: 'hsl(210, 40%, 98%)'
                  }} 
                />
                <Area type="monotone" dataKey="positive" stroke="hsl(172, 66%, 50%)" fill="url(#positiveGradient)" strokeWidth={2} />
                <Area type="monotone" dataKey="negative" stroke="hsl(350, 89%, 60%)" fill="url(#negativeGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Theme Breakdown */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <h3 className="text-lg font-semibold text-foreground mb-4">Sentiment by Theme</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sentimentThemes} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 20%)" />
                <XAxis type="number" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                <YAxis dataKey="theme" type="category" stroke="hsl(215, 20%, 55%)" fontSize={11} width={100} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(222, 47%, 8%)', 
                    border: '1px solid hsl(217, 33%, 20%)',
                    borderRadius: '8px',
                    color: 'hsl(210, 40%, 98%)'
                  }} 
                />
                <Bar dataKey="positive" stackId="a" fill="hsl(172, 66%, 50%)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="negative" stackId="a" fill="hsl(350, 89%, 60%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Feedback */}
      <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Feedback Stream</h3>
        <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin">
          {recentFeedback.map((feedback) => (
            <div 
              key={feedback.id}
              className={cn(
                "p-4 rounded-xl border transition-all duration-200 hover:border-primary/30",
                feedback.sentiment === 'positive' && "bg-teal/5 border-teal/20",
                feedback.sentiment === 'negative' && "bg-coral/5 border-coral/20",
                feedback.sentiment === 'neutral' && "bg-muted/50 border-border"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    feedback.sentiment === 'positive' && "bg-teal/20 text-teal",
                    feedback.sentiment === 'negative' && "bg-coral/20 text-coral",
                    feedback.sentiment === 'neutral' && "bg-muted text-muted-foreground"
                  )}>
                    {sourceIcons[feedback.source] || <MessageCircle className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{feedback.source}</p>
                    <p className="text-xs text-muted-foreground">{feedback.date}</p>
                  </div>
                </div>
                <span className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full capitalize",
                  feedback.sentiment === 'positive' && "bg-teal/20 text-teal",
                  feedback.sentiment === 'negative' && "bg-coral/20 text-coral",
                  feedback.sentiment === 'neutral' && "bg-muted text-muted-foreground"
                )}>
                  {feedback.sentiment}
                </span>
              </div>
              <p className="mt-3 text-sm text-foreground/80">{feedback.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
