import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CustomerCohort, RegionType } from '@/types/database';

interface CohortFilterProps {
  cohort?: CustomerCohort;
  region?: RegionType;
  onCohortChange: (value: CustomerCohort | undefined) => void;
  onRegionChange: (value: RegionType | undefined) => void;
}

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

export function CohortFilter({ cohort, region, onCohortChange, onRegionChange }: CohortFilterProps) {
  return (
    <div className="flex gap-2">
      <Select 
        value={cohort || 'all'} 
        onValueChange={(v) => onCohortChange(v === 'all' ? undefined : v as CustomerCohort)}
      >
        <SelectTrigger className="w-[150px] bg-card border-border">
          <SelectValue placeholder="All Cohorts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Cohorts</SelectItem>
          {Object.entries(cohortLabels).map(([key, label]) => (
            <SelectItem key={key} value={key}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select 
        value={region || 'all'} 
        onValueChange={(v) => onRegionChange(v === 'all' ? undefined : v as RegionType)}
      >
        <SelectTrigger className="w-[150px] bg-card border-border">
          <SelectValue placeholder="All Regions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Regions</SelectItem>
          {Object.entries(regionLabels).map(([key, label]) => (
            <SelectItem key={key} value={key}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
