import { useState, useCallback } from 'react';
import cars from '../data/cars.json';
import { rankCarsForDriver, buildDriverProfile, generateProsAndCons } from '../algorithm/scoring.js';
import type { DriverProfile, ScoredResult } from '../algorithm/scoring.js';

interface FormData {
  heightFeet: string | number;
  heightInches: string | number;
  eyeCondition?: string;
  experienceLevel?: string;
  budget: number | string;
  otherConditions?: string[];
}

export function useCarRecommendations() {
  const [results, setResults]       = useState<ScoredResult[]>([]);
  const [isLoading, setIsLoading]   = useState(false);
  const [driverProfile, setProfile] = useState<DriverProfile | null>(null);

  const runRecommendations = useCallback((formData: FormData) => {
    setIsLoading(true);

    const profile = buildDriverProfile(formData);
    setProfile(profile);

    const ranked = rankCarsForDriver(cars, profile, 12);

    const withProscons: ScoredResult[] = ranked.map((result) => ({
      ...result,
      prosAndCons: generateProsAndCons(result, profile),
    }));

    setResults(withProscons);
    setIsLoading(false);

    return withProscons;
  }, []);

  return { results, isLoading, driverProfile, runRecommendations };
}
