/**
 * FitDrive AI - Core Scoring Engine
 * Multi-factor weighted scoring algorithm to match drivers to cars
 * based on physical attributes, conditions, budget, and experience level.
 */

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface DriverProfile {
  heightInches: number;
  eyeCondition: string;
  experienceLevel: string;
  budget: number;
  otherConditions: string[];
}

export interface CarSpec {
  front_headroom_in: number;
  front_legroom_in: number;
  front_shoulder_room_in: number;
  length_in: number;
  width_in: number;
  height_in: number;
  turning_radius_ft: number;
  weight_lbs: number;
}

export interface CarSafety {
  nhtsa_overall: number;
  has_backup_camera: boolean;
  has_blind_spot_monitoring: boolean;
  has_lane_assist: boolean;
  has_automatic_emergency_braking: boolean;
  has_adaptive_cruise: boolean;
}

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  price_usd: number;
  specs: CarSpec;
  safety: CarSafety;
  visibility: { score: number; notes: string };
  handling: { difficulty: number; notes: string };
  experience_required: string;
  eye_condition_friendly: boolean;
  tall_driver_friendly: boolean;
  short_driver_friendly: boolean;
}

export interface ScoreBreakdown {
  ergonomic: number;
  visibility: number;
  safety: number;
  handling: number;
  budget: number;
}

export interface ProsAndCons {
  pros: string[];
  cons: string[];
}

export interface ScoredResult {
  car: Car;
  eligible: boolean;
  totalScore: number;
  breakdown: ScoreBreakdown;
  prosAndCons?: ProsAndCons;
  disqualifyReason?: string | null;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

export interface QuizResult {
  level: string;
  score: number;
  profile: string;
}

// ─────────────────────────────────────────────
// CONSTANTS & WEIGHTS
// ─────────────────────────────────────────────

const SCORE_WEIGHTS = {
  ergonomic:  0.30,
  visibility: 0.25,
  safety:     0.20,
  handling:   0.15,
  budget:     0.10,
};

const EXPERIENCE_LEVELS: Record<string, number> = {
  beginner:     1,
  intermediate: 2,
  advanced:     3,
};

const HEIGHT_HEADROOM_MAP = [
  { maxHeight: 63,  idealHeadroom: 37.0, minHeadroom: 35.5 },
  { maxHeight: 67,  idealHeadroom: 38.0, minHeadroom: 36.5 },
  { maxHeight: 71,  idealHeadroom: 39.0, minHeadroom: 37.5 },
  { maxHeight: 75,  idealHeadroom: 40.5, minHeadroom: 38.5 },
  { maxHeight: 200, idealHeadroom: 42.0, minHeadroom: 40.0 },
];

const HEIGHT_LEGROOM_MAP = [
  { maxHeight: 63,  idealLegroom: 40.0, minLegroom: 38.0 },
  { maxHeight: 67,  idealLegroom: 41.5, minLegroom: 39.5 },
  { maxHeight: 71,  idealLegroom: 42.5, minLegroom: 40.5 },
  { maxHeight: 75,  idealLegroom: 43.5, minLegroom: 41.5 },
  { maxHeight: 200, idealLegroom: 45.0, minLegroom: 42.0 },
];

const EYE_CONDITION_PENALTIES: Record<string, number> = {
  none:             0,
  glasses:         -0.5,
  contacts:        -0.3,
  low_vision:      -3.0,
  night_blindness: -2.5,
  peripheral_loss: -2.0,
  depth_perception:-1.5,
};

const SAFETY_FEATURE_WEIGHTS: Record<string, Record<string, number>> = {
  beginner: {
    has_automatic_emergency_braking: 3.0,
    has_lane_assist:                 2.5,
    has_blind_spot_monitoring:       2.5,
    has_backup_camera:               2.0,
    has_adaptive_cruise:             1.5,
  },
  intermediate: {
    has_automatic_emergency_braking: 2.0,
    has_blind_spot_monitoring:       2.0,
    has_lane_assist:                 1.5,
    has_backup_camera:               1.5,
    has_adaptive_cruise:             2.0,
  },
  advanced: {
    has_backup_camera:               1.0,
    has_blind_spot_monitoring:       1.5,
    has_automatic_emergency_braking: 1.0,
    has_lane_assist:                 0.5,
    has_adaptive_cruise:             1.5,
  },
};

// ─────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────

function clamp(val: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, val));
}

export function heightToInches(heightStr: string | number): number {
  if (typeof heightStr === 'number') return heightStr;
  const match = heightStr.match(/(\d+)'(\d+)"/);
  if (match) return parseInt(match[1]!) * 12 + parseInt(match[2]!);
  return parseInt(heightStr);
}

function getHeightNeeds(heightInches: number) {
  const headroomEntry = HEIGHT_HEADROOM_MAP.find((e) => heightInches <= e.maxHeight);
  const legroomEntry  = HEIGHT_LEGROOM_MAP.find((e) => heightInches <= e.maxHeight);
  return {
    idealHeadroom: headroomEntry?.idealHeadroom ?? 42.0,
    minHeadroom:   headroomEntry?.minHeadroom   ?? 40.0,
    idealLegroom:  legroomEntry?.idealLegroom   ?? 45.0,
    minLegroom:    legroomEntry?.minLegroom      ?? 42.0,
  };
}

// ─────────────────────────────────────────────
// INDIVIDUAL SCORING MODULES
// ─────────────────────────────────────────────

function scoreErgonomics(car: Car, heightInches: number): number {
  const { idealHeadroom, minHeadroom, idealLegroom, minLegroom } = getHeightNeeds(heightInches);
  const carHeadroom = car.specs.front_headroom_in;
  const carLegroom  = car.specs.front_legroom_in;

  let headroomScore: number;
  if (carHeadroom >= idealHeadroom) {
    headroomScore = 100;
  } else if (carHeadroom >= minHeadroom) {
    headroomScore = 60 + ((carHeadroom - minHeadroom) / (idealHeadroom - minHeadroom)) * 40;
  } else {
    headroomScore = Math.max(0, 60 - (minHeadroom - carHeadroom) * 15);
  }

  let legroomScore: number;
  if (carLegroom >= idealLegroom) {
    legroomScore = 100;
  } else if (carLegroom >= minLegroom) {
    legroomScore = 60 + ((carLegroom - minLegroom) / (idealLegroom - minLegroom)) * 40;
  } else {
    legroomScore = Math.max(0, 60 - (minLegroom - carLegroom) * 12);
  }

  const shoulderScore = clamp(((car.specs.front_shoulder_room_in - 50) / 14) * 100);
  return clamp((headroomScore * 0.45) + (legroomScore * 0.40) + (shoulderScore * 0.15));
}

function scoreVisibility(car: Car, eyeCondition: string): number {
  const normalised      = (car.visibility.score / 10) * 100;
  const penalty         = EYE_CONDITION_PENALTIES[eyeCondition] ?? 0;
  const adjustedPenalty = Math.abs(penalty) * 10;
  return clamp(normalised - adjustedPenalty);
}

function scoreSafety(car: Car, experienceLevel: string): number {
  const weights      = SAFETY_FEATURE_WEIGHTS[experienceLevel] ?? SAFETY_FEATURE_WEIGHTS['beginner']!;
  const safetyFeatures = car.safety as unknown as Record<string, boolean | number>;

  let earned = 0;
  let maxPossible = 0;

  for (const [feature, weight] of Object.entries(weights)) {
    maxPossible += weight;
    if (safetyFeatures[feature] === true) earned += weight;
  }

  const nhtsaScore   = ((car.safety.nhtsa_overall ?? 3) / 5) * 100;
  const featureScore = maxPossible > 0 ? (earned / maxPossible) * 100 : 0;
  return clamp((featureScore * 0.70) + (nhtsaScore * 0.30));
}

function scoreHandling(car: Car, experienceLevel: string): number {
  const difficulty           = car.handling.difficulty;
  const expLevel             = EXPERIENCE_LEVELS[experienceLevel] ?? 1;
  const maxAllowedDifficulty = expLevel * 3 + 1;

  if (difficulty <= maxAllowedDifficulty) {
    const challengeBonus = experienceLevel === 'beginner' ? 0 :
      Math.max(0, ((difficulty - 1) / (maxAllowedDifficulty - 1)) * 20);
    return clamp(80 + challengeBonus);
  }
  return clamp(80 - (difficulty - maxAllowedDifficulty) * 20);
}

function scoreBudget(car: Car, budget: number): number {
  const price = car.price_usd;
  if (price <= budget) {
    return (budget - price) / budget > 0.6 ? 75 : 100;
  }
  return clamp(100 - ((price - budget) / budget) * 120);
}

// ─────────────────────────────────────────────
// CONSTRAINT FILTER
// ─────────────────────────────────────────────

function filterConstraints(car: Car, driverProfile: DriverProfile): { eligible: boolean; reason: string | null } {
  const { heightInches, eyeCondition, experienceLevel, budget } = driverProfile;
  const expNum    = EXPERIENCE_LEVELS[experienceLevel] ?? 1;
  const carExpNum = EXPERIENCE_LEVELS[car.experience_required] ?? 1;

  if (carExpNum > expNum + 1) {
    return { eligible: false, reason: `Requires ${car.experience_required} experience` };
  }
  if (['low_vision', 'night_blindness', 'peripheral_loss'].includes(eyeCondition)) {
    if (car.visibility.score < 6) {
      return { eligible: false, reason: 'Poor visibility score not suitable for your eye condition' };
    }
  }
  if (car.price_usd > budget * 1.8) {
    return { eligible: false, reason: `Price $${car.price_usd.toLocaleString()} significantly exceeds budget` };
  }
  const { minHeadroom } = getHeightNeeds(heightInches);
  if (car.specs.front_headroom_in < minHeadroom - 1.5) {
    return { eligible: false, reason: 'Insufficient headroom for your height' };
  }
  return { eligible: true, reason: null };
}

// ─────────────────────────────────────────────
// MAIN SCORING
// ─────────────────────────────────────────────

export function scoreCar(car: Car, driverProfile: DriverProfile): ScoredResult {
  const { heightInches, eyeCondition, experienceLevel, budget } = driverProfile;
  const constraint = filterConstraints(car, driverProfile);

  if (!constraint.eligible) {
    return {
      car,
      eligible: false,
      disqualifyReason: constraint.reason,
      totalScore: 0,
      breakdown: { ergonomic: 0, visibility: 0, safety: 0, handling: 0, budget: 0 },
    };
  }

  const ergonomicScore  = scoreErgonomics(car, heightInches);
  const visibilityScore = scoreVisibility(car, eyeCondition);
  const safetyScore     = scoreSafety(car, experienceLevel);
  const handlingScore   = scoreHandling(car, experienceLevel);
  const budgetScore     = scoreBudget(car, budget);

  const totalScore = clamp(
    ergonomicScore  * SCORE_WEIGHTS.ergonomic +
    visibilityScore * SCORE_WEIGHTS.visibility +
    safetyScore     * SCORE_WEIGHTS.safety +
    handlingScore   * SCORE_WEIGHTS.handling +
    budgetScore     * SCORE_WEIGHTS.budget,
  );

  return {
    car,
    eligible: true,
    totalScore: Math.round(totalScore),
    breakdown: {
      ergonomic:  Math.round(ergonomicScore),
      visibility: Math.round(visibilityScore),
      safety:     Math.round(safetyScore),
      handling:   Math.round(handlingScore),
      budget:     Math.round(budgetScore),
    },
  };
}

export function rankCarsForDriver(cars: Car[], driverProfile: DriverProfile, topN = 10): ScoredResult[] {
  return cars
    .map((car) => scoreCar(car, driverProfile))
    .filter((r) => r.eligible)
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, topN);
}

// ─────────────────────────────────────────────
// PRO/CON GENERATOR
// ─────────────────────────────────────────────

export function generateProsAndCons(scoredResult: ScoredResult, driverProfile: DriverProfile): ProsAndCons {
  const { car, breakdown } = scoredResult;
  const { heightInches, eyeCondition, experienceLevel, budget } = driverProfile;
  const pros: string[] = [];
  const cons: string[] = [];

  if (breakdown.ergonomic >= 80) {
    pros.push(`Excellent physical fit for your ${heightInches < 67 ? 'shorter' : heightInches > 71 ? 'taller' : 'average'} frame`);
  } else if (breakdown.ergonomic < 55) {
    cons.push(`May feel cramped — headroom or legroom is below your ideal range`);
  }

  if (breakdown.visibility >= 80) {
    pros.push(`Outstanding visibility score (${car.visibility.score}/10) — great for your eye condition`);
  } else if (breakdown.visibility < 55) {
    cons.push(`Visibility is limited (${car.visibility.score}/10) — could be challenging with ${eyeCondition.replace('_', ' ')}`);
  }

  if (breakdown.safety >= 85) {
    pros.push(`Top-tier safety suite ideal for a ${experienceLevel} driver`);
  } else if (breakdown.safety < 60) {
    cons.push(`Lacks some ADAS features recommended for ${experienceLevel} drivers`);
  }

  if (car.safety.has_automatic_emergency_braking) {
    pros.push(`Automatic Emergency Braking adds crucial safety net`);
  }
  if (car.safety.has_blind_spot_monitoring && eyeCondition !== 'none') {
    pros.push(`Blind spot monitoring compensates for reduced peripheral awareness`);
  }

  if (breakdown.handling >= 85) {
    pros.push(`Handling difficulty (${car.handling.difficulty}/10) is well within your experience level`);
  } else if (breakdown.handling < 60) {
    cons.push(`Handling complexity (${car.handling.difficulty}/10) exceeds what's recommended for ${experienceLevel} drivers`);
  }

  if (car.price_usd <= budget) {
    const savingsPct = Math.round(((budget - car.price_usd) / budget) * 100);
    pros.push(`$${(budget - car.price_usd).toLocaleString()} under your budget (${savingsPct}% savings)`);
  } else {
    const overPct = Math.round(((car.price_usd - budget) / budget) * 100);
    cons.push(`$${(car.price_usd - budget).toLocaleString()} over your budget (${overPct}% above)`);
  }

  if (car.category === 'suv' && heightInches > 70) {
    pros.push(`SUV's higher seating position suits your height well`);
  }
  if (car.category === 'hatchback' && experienceLevel === 'beginner') {
    pros.push(`Hatchback form factor is ideal for learning to drive`);
  }
  if (car.category === 'sports' && experienceLevel === 'beginner') {
    cons.push(`Sports cars have higher stakes learning curves`);
  }

  return { pros: pros.slice(0, 4), cons: cons.slice(0, 4) };
}

// ─────────────────────────────────────────────
// DRIVER PROFILE BUILDER
// ─────────────────────────────────────────────

export function buildDriverProfile(formData: {
  heightFeet: string | number;
  heightInches: string | number;
  eyeCondition?: string;
  experienceLevel?: string;
  budget: number | string;
  otherConditions?: string[];
}): DriverProfile {
  const totalHeightInches = (parseInt(String(formData.heightFeet)) * 12) + parseInt(String(formData.heightInches));
  return {
    heightInches:    totalHeightInches,
    eyeCondition:    formData.eyeCondition ?? 'none',
    experienceLevel: formData.experienceLevel ?? 'beginner',
    budget:          parseInt(String(formData.budget)),
    otherConditions: formData.otherConditions ?? [],
  };
}

// ─────────────────────────────────────────────
// QUIZ SCORER
// ─────────────────────────────────────────────

export function scoreDriverQuiz(answers: Record<string, string>): QuizResult {
  const scoringMap: Record<string, Record<string, number>> = {
    q1: { a: 0, b: 5,  c: 10, d: 15 },
    q2: { a: 3, b: 8,  c: 12, d: 18 },
    q3: { a: 0, b: 5,  c: 10, d: 15 },
    q4: { a: 0, b: 5,  c: 10, d: 15 },
    q5: { a: 0, b: 5,  c: 12, d: 18 },
    q6: { a: 0, b: 5,  c: 12, d: 20 },
  };

  let totalScore = 0;
  for (const [questionId, answerId] of Object.entries(answers)) {
    totalScore += scoringMap[questionId]?.[answerId] ?? 0;
  }

  let level: string;
  let profile: string;

  if (totalScore <= 20) {
    level = 'beginner'; profile = 'Cautious City Driver';
  } else if (totalScore <= 50) {
    level = 'intermediate'; profile = 'Confident Commuter';
  } else if (totalScore <= 75) {
    level = 'intermediate'; profile = 'Experienced All-Rounder';
  } else {
    level = 'advanced'; profile = 'Performance-Ready Driver';
  }

  return { level, score: totalScore, profile };
}

export const DRIVER_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'How long have you been driving?',
    options: [
      { id: 'a', text: 'Less than 1 year' },
      { id: 'b', text: '1–3 years' },
      { id: 'c', text: '3–7 years' },
      { id: 'd', text: '7+ years' },
    ],
  },
  {
    id: 'q2',
    question: 'What type of road do you drive most often?',
    options: [
      { id: 'a', text: 'Quiet residential streets' },
      { id: 'b', text: 'City roads and light traffic' },
      { id: 'c', text: 'Busy city roads and dual carriageways' },
      { id: 'd', text: 'Highways, motorways, and mixed conditions' },
    ],
  },
  {
    id: 'q3',
    question: 'How comfortable are you with parallel parking?',
    options: [
      { id: 'a', text: 'I avoid it at all costs' },
      { id: 'b', text: 'I can do it but it takes time' },
      { id: 'c', text: 'I can do it confidently in most spots' },
      { id: 'd', text: "I can park any car anywhere without much thought" },
    ],
  },
  {
    id: 'q4',
    question: 'How comfortable are you driving at high speeds (80+ mph / 130+ km/h)?',
    options: [
      { id: 'a', text: "I don't drive at those speeds" },
      { id: 'b', text: 'A little nervous but manageable' },
      { id: 'c', text: 'Comfortable, I maintain focus' },
      { id: 'd', text: 'Very comfortable, I enjoy highway driving' },
    ],
  },
  {
    id: 'q5',
    question: 'Have you driven in adverse weather (heavy rain, snow, fog)?',
    options: [
      { id: 'a', text: 'Never, I avoid it' },
      { id: 'b', text: 'A few times, felt uncomfortable' },
      { id: 'c', text: 'Yes, regularly, I can manage it' },
      { id: 'd', text: "Yes, frequently — it doesn't phase me" },
    ],
  },
  {
    id: 'q6',
    question: 'Have you ever driven a manual, sports, or high-performance car?',
    options: [
      { id: 'a', text: 'No, only standard automatics' },
      { id: 'b', text: 'Tried once or twice' },
      { id: 'c', text: 'Yes, I drive manual or spirited cars occasionally' },
      { id: 'd', text: 'Yes, regularly — I know how to handle power' },
    ],
  },
];
