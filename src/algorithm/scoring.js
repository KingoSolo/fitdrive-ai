/**
 * FitDrive AI - Core Scoring Engine
 * Multi-factor weighted scoring algorithm to match drivers to cars
 * based on physical attributes, conditions, budget, and experience level.
 */

// ─────────────────────────────────────────────
// CONSTANTS & WEIGHTS
// ─────────────────────────────────────────────

const SCORE_WEIGHTS = {
  ergonomic:   0.30,  // Physical fit (height, shoulder, legroom)
  visibility:  0.25,  // Visibility score adjusted for eye conditions
  safety:      0.20,  // Safety features weighted by experience level
  handling:    0.15,  // Handling difficulty vs experience level
  budget:      0.10,  // How well the car fits within budget
};

const EXPERIENCE_LEVELS = {
  beginner:     1,
  intermediate: 2,
  advanced:     3,
};

// Heights in inches. Average headroom needed by height range.
const HEIGHT_HEADROOM_MAP = [
  { maxHeight: 63,  idealHeadroom: 37.0, minHeadroom: 35.5 }, // <= 5'3"
  { maxHeight: 67,  idealHeadroom: 38.0, minHeadroom: 36.5 }, // 5'4"–5'7"
  { maxHeight: 71,  idealHeadroom: 39.0, minHeadroom: 37.5 }, // 5'8"–5'11"
  { maxHeight: 75,  idealHeadroom: 40.5, minHeadroom: 38.5 }, // 6'0"–6'3"
  { maxHeight: 200, idealHeadroom: 42.0, minHeadroom: 40.0 }, // 6'4"+
];

const HEIGHT_LEGROOM_MAP = [
  { maxHeight: 63,  idealLegroom: 40.0, minLegroom: 38.0 },
  { maxHeight: 67,  idealLegroom: 41.5, minLegroom: 39.5 },
  { maxHeight: 71,  idealLegroom: 42.5, minLegroom: 40.5 },
  { maxHeight: 75,  idealLegroom: 43.5, minLegroom: 41.5 },
  { maxHeight: 200, idealLegroom: 45.0, minLegroom: 42.0 },
];

// Eye conditions that affect visibility requirements
const EYE_CONDITION_PENALTIES = {
  none:             0,
  glasses:         -0.5,  // Minor penalty, manageable
  contacts:        -0.3,  // Minimal penalty
  low_vision:      -3.0,  // Significant — needs high-visibility cars
  night_blindness: -2.5,  // Needs cars with great lighting systems
  peripheral_loss: -2.0,  // Needs wide-angle rear cameras, BSM
  depth_perception:-1.5,  // Needs parking sensors
};

// Safety feature weights — beginners benefit more from ADAS features
const SAFETY_FEATURE_WEIGHTS = {
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

/**
 * Clamp a value between 0 and 100
 */
function clamp(val, min = 0, max = 100) {
  return Math.max(min, Math.min(max, val));
}

/**
 * Convert height string (e.g. "5'10\"") to total inches
 */
export function heightToInches(heightStr) {
  if (typeof heightStr === 'number') return heightStr;
  const match = heightStr.match(/(\d+)'(\d+)"/);
  if (match) return parseInt(match[1]) * 12 + parseInt(match[2]);
  return parseInt(heightStr); // assume already inches
}

/**
 * Get ideal headroom and legroom needs based on driver height in inches
 */
function getHeightNeeds(heightInches) {
  const headroomEntry = HEIGHT_HEADROOM_MAP.find(e => heightInches <= e.maxHeight);
  const legroomEntry  = HEIGHT_LEGROOM_MAP.find(e => heightInches <= e.maxHeight);
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

/**
 * Score 1: Ergonomic Fit (0–100)
 * Evaluates headroom, legroom, and shoulder room relative to driver height
 */
function scoreErgonomics(car, heightInches) {
  const { idealHeadroom, minHeadroom, idealLegroom, minLegroom } = getHeightNeeds(heightInches);
  const carHeadroom  = car.specs.front_headroom_in;
  const carLegroom   = car.specs.front_legroom_in;

  // Headroom score
  let headroomScore;
  if (carHeadroom >= idealHeadroom) {
    headroomScore = 100; // Perfect or excess headroom
  } else if (carHeadroom >= minHeadroom) {
    headroomScore = 60 + ((carHeadroom - minHeadroom) / (idealHeadroom - minHeadroom)) * 40;
  } else {
    // Below minimum: harsh penalty
    const deficit = minHeadroom - carHeadroom;
    headroomScore = Math.max(0, 60 - deficit * 15);
  }

  // Legroom score
  let legroomScore;
  if (carLegroom >= idealLegroom) {
    legroomScore = 100;
  } else if (carLegroom >= minLegroom) {
    legroomScore = 60 + ((carLegroom - minLegroom) / (idealLegroom - minLegroom)) * 40;
  } else {
    const deficit = minLegroom - carLegroom;
    legroomScore = Math.max(0, 60 - deficit * 12);
  }

  // Shoulder room score (normalized to average comfortable range 54–62 inches)
  const shoulderRoom = car.specs.front_shoulder_room_in;
  const shoulderScore = clamp(((shoulderRoom - 50) / 14) * 100);

  return clamp((headroomScore * 0.45) + (legroomScore * 0.40) + (shoulderScore * 0.15));
}

/**
 * Score 2: Visibility (0–100)
 * Adjusts base car visibility score by driver's eye conditions
 */
function scoreVisibility(car, eyeCondition) {
  const baseScore    = car.visibility.score; // 1–10
  const normalised   = (baseScore / 10) * 100; // Convert to 0–100
  const penalty      = EYE_CONDITION_PENALTIES[eyeCondition] ?? 0;

  // Scale penalty relative to severity of eye condition
  const adjustedPenalty = Math.abs(penalty) * 10; // Convert to 0–100 scale
  return clamp(normalised - adjustedPenalty);
}

/**
 * Score 3: Safety Fit (0–100)
 * Higher score = car has the ADAS features most important for this experience level
 */
function scoreSafety(car, experienceLevel) {
  const weights = SAFETY_FEATURE_WEIGHTS[experienceLevel] ?? SAFETY_FEATURE_WEIGHTS.beginner;
  const safetyFeatures = car.safety;

  let earned = 0;
  let maxPossible = 0;

  for (const [feature, weight] of Object.entries(weights)) {
    maxPossible += weight;
    if (safetyFeatures[feature] === true) {
      earned += weight;
    }
  }

  // Include NHTSA overall rating as 30% of safety score
  const nhtsaScore = ((safetyFeatures.nhtsa_overall ?? 3) / 5) * 100;
  const featureScore = maxPossible > 0 ? (earned / maxPossible) * 100 : 0;

  return clamp((featureScore * 0.70) + (nhtsaScore * 0.30));
}

/**
 * Score 4: Handling Appropriateness (0–100)
 * Beginners need easy cars. Advanced drivers can handle performance cars.
 */
function scoreHandling(car, experienceLevel) {
  const difficulty   = car.handling.difficulty; // 1–10, lower = easier
  const expLevel     = EXPERIENCE_LEVELS[experienceLevel] ?? 1;
  const maxAllowedDifficulty = expLevel * 3 + 1; // beginner=4, intermediate=7, advanced=10

  if (difficulty <= maxAllowedDifficulty) {
    // Within capability: full score, with bonus for right-level challenge
    const challengeBonus = experienceLevel === 'beginner' ? 0 :
      Math.max(0, ((difficulty - 1) / (maxAllowedDifficulty - 1)) * 20);
    return clamp(80 + challengeBonus);
  } else {
    // Over capability: significant penalty
    const overDifficulty = difficulty - maxAllowedDifficulty;
    return clamp(80 - (overDifficulty * 20));
  }
}

/**
 * Score 5: Budget Fit (0–100)
 * Higher score = better value or under budget
 */
function scoreBudget(car, budget) {
  const price = car.price_usd;

  if (price <= budget) {
    // Under budget: perfect score, slight bonus for good value
    const savings      = budget - price;
    const savingsRatio = savings / budget;
    // Slight penalty for being too far under (may indicate low quality)
    if (savingsRatio > 0.6) {
      return 75; // Way under budget, might be too basic
    }
    return 100;
  } else {
    // Over budget: penalty proportional to how over
    const overage = price - budget;
    const overRatio = overage / budget;
    return clamp(100 - (overRatio * 120));
  }
}

// ─────────────────────────────────────────────
// CONSTRAINT FILTERS
// ─────────────────────────────────────────────

/**
 * Hard filter — disqualify cars that are fundamentally incompatible
 * Returns { eligible: bool, reason: string }
 */
function filterConstraints(car, driverProfile) {
  const { heightInches, eyeCondition, experienceLevel, budget } = driverProfile;
  const expNum = EXPERIENCE_LEVELS[experienceLevel] ?? 1;
  const carExpNum = EXPERIENCE_LEVELS[car.experience_required] ?? 1;

  // Block cars that are way above experience level
  if (carExpNum > expNum + 1) {
    return { eligible: false, reason: `Requires ${car.experience_required} experience` };
  }

  // Block critical visibility mismatches
  if (['low_vision', 'night_blindness', 'peripheral_loss'].includes(eyeCondition)) {
    if (car.visibility.score < 6) {
      return { eligible: false, reason: 'Poor visibility score not suitable for your eye condition' };
    }
  }

  // Block if way over budget (>80% over)
  if (car.price_usd > budget * 1.8) {
    return { eligible: false, reason: `Price $${car.price_usd.toLocaleString()} significantly exceeds budget` };
  }

  // Block if headroom is critically low for very tall drivers
  const { minHeadroom } = getHeightNeeds(heightInches);
  if (car.specs.front_headroom_in < minHeadroom - 1.5) {
    return { eligible: false, reason: 'Insufficient headroom for your height' };
  }

  return { eligible: true, reason: null };
}

// ─────────────────────────────────────────────
// MAIN SCORING FUNCTION
// ─────────────────────────────────────────────

/**
 * Score a single car against a driver profile
 * Returns a full scoring breakdown object
 */
export function scoreCar(car, driverProfile) {
  const { heightInches, eyeCondition, experienceLevel, budget } = driverProfile;

  const constraint = filterConstraints(car, driverProfile);
  if (!constraint.eligible) {
    return {
      car,
      eligible: false,
      disqualifyReason: constraint.reason,
      totalScore: 0,
      breakdown: null,
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
    budgetScore     * SCORE_WEIGHTS.budget
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

/**
 * Main entry: rank all cars for a given driver profile
 * Returns top N eligible cars sorted by score
 */
export function rankCarsForDriver(cars, driverProfile, topN = 10) {
  const results = cars.map(car => scoreCar(car, driverProfile));

  const eligible = results
    .filter(r => r.eligible)
    .sort((a, b) => b.totalScore - a.totalScore);

  return eligible.slice(0, topN);
}

// ─────────────────────────────────────────────
// PRO/CON GENERATOR
// ─────────────────────────────────────────────

/**
 * Generate data-driven pros and cons for a scored car result.
 * This feeds into the AI narrative prompt — or can stand alone.
 */
export function generateProsAndCons(scoredResult, driverProfile) {
  const { car, breakdown } = scoredResult;
  const { heightInches, eyeCondition, experienceLevel, budget } = driverProfile;
  const pros = [];
  const cons = [];

  // Ergonomics
  if (breakdown.ergonomic >= 80) {
    pros.push(`Excellent physical fit for your ${heightInches < 67 ? 'shorter' : heightInches > 71 ? 'taller' : 'average'} frame`);
  } else if (breakdown.ergonomic < 55) {
    cons.push(`May feel cramped — headroom or legroom is below your ideal range`);
  }

  // Visibility
  if (breakdown.visibility >= 80) {
    pros.push(`Outstanding visibility score (${car.visibility.score}/10) — great for your eye condition`);
  } else if (breakdown.visibility < 55) {
    cons.push(`Visibility is limited (${car.visibility.score}/10) — could be challenging with ${eyeCondition.replace('_', ' ')}`);
  }

  // Safety
  if (breakdown.safety >= 85) {
    pros.push(`Top-tier safety suite ideal for a ${experienceLevel} driver`);
  } else if (breakdown.safety < 60) {
    cons.push(`Lacks some ADAS features recommended for ${experienceLevel} drivers`);
  }

  // Specific safety features
  if (car.safety.has_automatic_emergency_braking) {
    pros.push(`Automatic Emergency Braking adds crucial safety net`);
  }
  if (car.safety.has_blind_spot_monitoring && eyeCondition !== 'none') {
    pros.push(`Blind spot monitoring compensates for reduced peripheral awareness`);
  }

  // Handling
  if (breakdown.handling >= 85) {
    pros.push(`Handling difficulty (${car.handling.difficulty}/10) is well within your experience level`);
  } else if (breakdown.handling < 60) {
    cons.push(`Handling complexity (${car.handling.difficulty}/10) exceeds what's recommended for ${experienceLevel} drivers`);
  }

  // Budget
  if (car.price_usd <= budget) {
    const savingsPct = Math.round(((budget - car.price_usd) / budget) * 100);
    pros.push(`$${(budget - car.price_usd).toLocaleString()} under your budget (${savingsPct}% savings)`);
  } else {
    const overPct = Math.round(((car.price_usd - budget) / budget) * 100);
    cons.push(`$${(car.price_usd - budget).toLocaleString()} over your budget (${overPct}% above)`);
  }

  // Category-specific
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

/**
 * Build a normalized driver profile from raw form inputs
 */
export function buildDriverProfile({
  heightFeet,
  heightInches: rawInches,
  eyeCondition = 'none',
  experienceLevel = 'beginner',
  budget,
  otherConditions = [],
}) {
  const totalHeightInches = (parseInt(heightFeet) * 12) + parseInt(rawInches);

  // Apply additional physical conditions
  let adjustedEyeCondition = eyeCondition;
  if (otherConditions.includes('reduced_mobility') || otherConditions.includes('arthritis')) {
    // These users benefit even more from easy handling
    // Handled downstream in scoring
  }

  return {
    heightInches:    totalHeightInches,
    eyeCondition:    adjustedEyeCondition,
    experienceLevel: experienceLevel,
    budget:          parseInt(budget),
    otherConditions: otherConditions,
  };
}

// ─────────────────────────────────────────────
// DRIVER CAPABILITY QUIZ SCORER
// ─────────────────────────────────────────────

/**
 * Evaluate a completed driver quiz and return an experience profile.
 * Quiz answers are scored to determine real capability level.
 * Used for the "experienced driver" flow.
 *
 * @param {Object} answers - Map of questionId -> answerId
 * @returns {{ level: string, score: number, profile: string }}
 */
export function scoreDriverQuiz(answers) {
  const scoringMap = {
    // q1: Years of driving experience
    q1: { a: 0, b: 5, c: 10, d: 15 },
    // q2: Most complex road you regularly drive
    q2: { a: 3, b: 8, c: 12, d: 18 },
    // q3: Parking comfort level
    q3: { a: 0, b: 5, c: 10, d: 15 },
    // q4: Highway driving comfort
    q4: { a: 0, b: 5, c: 10, d: 15 },
    // q5: Adverse weather experience
    q5: { a: 0, b: 5, c: 12, d: 18 },
    // q6: Manual/performance car experience
    q6: { a: 0, b: 5, c: 12, d: 20 },
  };

  let totalScore = 0;
  for (const [questionId, answerId] of Object.entries(answers)) {
    totalScore += scoringMap[questionId]?.[answerId] ?? 0;
  }

  let level, profile;
  if (totalScore <= 20) {
    level = 'beginner';
    profile = 'Cautious City Driver';
  } else if (totalScore <= 50) {
    level = 'intermediate';
    profile = 'Confident Commuter';
  } else if (totalScore <= 75) {
    level = 'intermediate';
    profile = 'Experienced All-Rounder';
  } else {
    level = 'advanced';
    profile = 'Performance-Ready Driver';
  }

  return { level, score: totalScore, profile };
}

export const DRIVER_QUIZ_QUESTIONS = [
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
      { id: 'd', text: 'I can park any car anywhere without much thought' },
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