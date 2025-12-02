// Sentiment Analysis Data
export const sentimentOverTime = [
  { week: 'W1', positive: 72, negative: 18, neutral: 10 },
  { week: 'W2', positive: 68, negative: 22, neutral: 10 },
  { week: 'W3', positive: 75, negative: 15, neutral: 10 },
  { week: 'W4', positive: 71, negative: 19, neutral: 10 },
  { week: 'W5', positive: 78, negative: 12, neutral: 10 },
  { week: 'W6', positive: 74, negative: 16, neutral: 10 },
  { week: 'W7', positive: 80, negative: 11, neutral: 9 },
  { week: 'W8', positive: 76, negative: 14, neutral: 10 },
];

export const sentimentThemes = [
  { theme: 'Product Quality', positive: 82, negative: 18, mentions: 12450 },
  { theme: 'Delivery Speed', positive: 65, negative: 35, mentions: 8920 },
  { theme: 'Pricing', positive: 58, negative: 42, mentions: 7830 },
  { theme: 'Returns Process', positive: 45, negative: 55, mentions: 5620 },
  { theme: 'Customer Service', positive: 52, negative: 48, mentions: 4890 },
  { theme: 'App Usability', positive: 78, negative: 22, mentions: 6340 },
];

export const recentFeedback = [
  { id: 1, source: 'Play Store', sentiment: 'positive', text: 'Amazing collection! Found exactly what I was looking for.', date: '2h ago' },
  { id: 2, source: 'Twitter', sentiment: 'negative', text: 'Delivery was delayed by 5 days. Very disappointed.', date: '3h ago' },
  { id: 3, source: 'App Store', sentiment: 'positive', text: 'App is super smooth and easy to navigate!', date: '4h ago' },
  { id: 4, source: 'Instagram', sentiment: 'neutral', text: 'New collection looks interesting, need more sizes though.', date: '5h ago' },
  { id: 5, source: 'Trustpilot', sentiment: 'negative', text: 'Return process took too long. Need improvement.', date: '6h ago' },
];

// Fashion Trends Data
export const fashionTrends = [
  { id: 1, trend: 'Y2K Aesthetic', status: 'Peaking', growth: 145, platforms: ['TikTok', 'Instagram'], category: 'Style' },
  { id: 2, trend: 'Oversized Blazers', status: 'Established', growth: 78, platforms: ['Pinterest', 'Instagram'], category: 'Outerwear' },
  { id: 3, trend: 'Cargo Pants', status: 'Peaking', growth: 120, platforms: ['TikTok', 'YouTube'], category: 'Bottoms' },
  { id: 4, trend: 'Coquette Bows', status: 'Emerging', growth: 234, platforms: ['TikTok', 'Pinterest'], category: 'Accessories' },
  { id: 5, trend: 'Quiet Luxury', status: 'Established', growth: 56, platforms: ['Instagram', 'Pinterest'], category: 'Style' },
  { id: 6, trend: 'Mob Wife Aesthetic', status: 'Emerging', growth: 312, platforms: ['TikTok'], category: 'Style' },
  { id: 7, trend: 'Ballet Core', status: 'Cooling', growth: -15, platforms: ['Instagram'], category: 'Style' },
  { id: 8, trend: 'Mesh Tops', status: 'Peaking', growth: 89, platforms: ['TikTok', 'Instagram'], category: 'Tops' },
];

export const trendHeatmapData = [
  { category: 'Dresses', jan: 85, feb: 78, mar: 92, apr: 88, may: 95, jun: 82 },
  { category: 'Tops', jan: 72, feb: 80, mar: 75, apr: 85, may: 90, jun: 88 },
  { category: 'Bottoms', jan: 68, feb: 72, mar: 78, apr: 82, may: 85, jun: 90 },
  { category: 'Outerwear', jan: 90, feb: 85, mar: 70, apr: 55, may: 40, jun: 35 },
  { category: 'Accessories', jan: 75, feb: 78, mar: 82, apr: 85, may: 88, jun: 92 },
  { category: 'Footwear', jan: 80, feb: 82, mar: 85, apr: 88, may: 90, jun: 85 },
];

// Competitor Analysis Data
export const competitorPricing = [
  { category: 'Casual Tops', myntra: 799, ajio: 699, difference: -12.5, trend: 'down' },
  { category: 'Formal Shirts', myntra: 1499, ajio: 1599, difference: 6.7, trend: 'up' },
  { category: 'Denim Jeans', myntra: 1299, ajio: 1199, difference: -7.7, trend: 'down' },
  { category: 'Summer Dresses', myntra: 1899, ajio: 1799, difference: -5.3, trend: 'down' },
  { category: 'Sneakers', myntra: 2499, ajio: 2699, difference: 8.0, trend: 'up' },
  { category: 'Ethnic Wear', myntra: 2199, ajio: 2099, difference: -4.5, trend: 'down' },
];

export const competitorDeals = [
  { id: 1, competitor: 'AJIO', deal: '50% off on Summer Collection', endDate: '2 days', category: 'Seasonal', impact: 'high' },
  { id: 2, competitor: 'AJIO', deal: 'Buy 2 Get 1 Free on Tops', endDate: '5 days', category: 'Bundle', impact: 'medium' },
  { id: 3, competitor: 'AJIO', deal: 'Extra 20% off on First Order', endDate: 'Ongoing', category: 'Acquisition', impact: 'high' },
  { id: 4, competitor: 'AJIO', deal: 'Flat ₹500 off on ₹2000+', endDate: '3 days', category: 'Discount', impact: 'medium' },
];

// Actionable Insights
export const insights = [
  {
    id: 1,
    type: 'urgent',
    title: 'Returns Process Pain Point',
    description: 'Negative sentiment for returns increased by 23% this week. Consider streamlining the return pickup process.',
    impact: 'High',
    category: 'Customer Experience',
  },
  {
    id: 2,
    type: 'opportunity',
    title: 'Coquette Bow Trend Rising',
    description: 'Search volume for bow accessories up 234%. Recommend expanding bow-themed collection immediately.',
    impact: 'High',
    category: 'Merchandising',
  },
  {
    id: 3,
    type: 'competitive',
    title: 'AJIO Summer Sale Alert',
    description: 'AJIO launched aggressive 50% off summer sale. Consider matching or launching counter-promotion.',
    impact: 'Critical',
    category: 'Pricing',
  },
  {
    id: 4,
    type: 'trend',
    title: 'GenZ Cargo Pants Demand',
    description: 'Cargo pants searches up 120% on TikTok. Current inventory may not meet projected demand.',
    impact: 'Medium',
    category: 'Inventory',
  },
];

// Dashboard Summary Stats
export const dashboardStats = {
  overallSentiment: 76,
  sentimentChange: 4.2,
  activeTrends: 8,
  trendingUp: 6,
  priceCompetitiveness: 72,
  priceGap: -5.3,
  alertsToday: 12,
  criticalAlerts: 3,
};
