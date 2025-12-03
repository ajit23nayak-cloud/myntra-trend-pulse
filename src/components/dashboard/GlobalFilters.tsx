import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import type { CustomerCohort, RegionType } from '@/types/database';

interface GlobalFiltersProps {
  category?: string;
  brand?: string;
  cohort?: CustomerCohort;
  region?: RegionType;
  onCategoryChange: (value: string | undefined) => void;
  onBrandChange: (value: string | undefined) => void;
  onCohortChange: (value: CustomerCohort | undefined) => void;
  onRegionChange: (value: RegionType | undefined) => void;
  onClearAll: () => void;
  showCategory?: boolean;
  showBrand?: boolean;
  showCohort?: boolean;
  showRegion?: boolean;
}

const categories = [
  { value: 'Winterwear', label: 'Winterwear' },
  { value: 'Footwear', label: 'Footwear' },
  { value: 'Dresses', label: 'Dresses' },
  { value: 'Ethnic', label: 'Ethnic Wear' },
  { value: 'Casual', label: 'Casual Wear' },
  { value: 'Accessories', label: 'Accessories' },
  { value: 'Sportswear', label: 'Sportswear' },
];

const brands = [
  { value: 'Roadster', label: 'Roadster' },
  { value: 'HRX', label: 'HRX' },
  { value: 'Mast & Harbour', label: 'Mast & Harbour' },
  { value: 'Libas', label: 'Libas' },
  { value: 'Anouk', label: 'Anouk' },
  { value: 'Nike', label: 'Nike' },
  { value: 'Puma', label: 'Puma' },
];

const cohortLabels: Record<CustomerCohort, string> = {
  gen_z: 'Gen Z',
  millennial: 'Millennials',
  gen_x: 'Gen X',
  new_user: 'New Users',
  returning_user: 'Returning Users',
  loyal_user: 'Loyal Users'
};

const regionLabels: Record<RegionType, string> = {
  metro: 'Metro Cities',
  tier_1: 'Tier 1 Cities',
  tier_2: 'Tier 2 Cities',
  tier_3: 'Tier 3 Cities'
};

export function GlobalFilters({
  category,
  brand,
  cohort,
  region,
  onCategoryChange,
  onBrandChange,
  onCohortChange,
  onRegionChange,
  onClearAll,
  showCategory = true,
  showBrand = true,
  showCohort = true,
  showRegion = true,
}: GlobalFiltersProps) {
  const hasActiveFilters = category || brand || cohort || region;

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="w-4 h-4" />
        <span className="font-medium">Filters:</span>
      </div>
      
      {showCategory && (
        <Select 
          value={category || 'all'} 
          onValueChange={(v) => onCategoryChange(v === 'all' ? undefined : v)}
        >
          <SelectTrigger className="w-[130px] h-8 text-xs bg-background">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(({ value, label }) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {showBrand && (
        <Select 
          value={brand || 'all'} 
          onValueChange={(v) => onBrandChange(v === 'all' ? undefined : v)}
        >
          <SelectTrigger className="w-[130px] h-8 text-xs bg-background">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map(({ value, label }) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {showCohort && (
        <Select 
          value={cohort || 'all'} 
          onValueChange={(v) => onCohortChange(v === 'all' ? undefined : v as CustomerCohort)}
        >
          <SelectTrigger className="w-[130px] h-8 text-xs bg-background">
            <SelectValue placeholder="Cohort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cohorts</SelectItem>
            {Object.entries(cohortLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {showRegion && (
        <Select 
          value={region || 'all'} 
          onValueChange={(v) => onRegionChange(v === 'all' ? undefined : v as RegionType)}
        >
          <SelectTrigger className="w-[130px] h-8 text-xs bg-background">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {Object.entries(regionLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearAll}
          className="h-8 text-xs text-muted-foreground hover:text-foreground"
        >
          <X className="w-3 h-3 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
