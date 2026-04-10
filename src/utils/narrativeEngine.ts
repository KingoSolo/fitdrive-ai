interface DriverProfile {
  heightInches: number;
  eyeCondition: string;
  experienceLevel: string;
  budget: number;
  otherConditions?: string[];
}

interface Car {
  year: number | string;
  brand: string;
  model: string;
  category?: string;
  specs: { front_headroom_in: number };
  visibility: { score: number };
  handling: { difficulty: number };
  price_usd: number;
  safety?: {
    has_auto_emergency_braking?: boolean;
    has_lane_assist?: boolean;
    has_blind_spot_monitor?: boolean;
    has_parking_sensors?: boolean;
    has_adaptive_cruise?: boolean;
  };
}

interface ProsAndCons {
  pros: string[];
  cons: string[];
}

type SentenceFn = (car: Car, profile: DriverProfile) => string;

interface Rule {
  condition: (car: Car, profile: DriverProfile) => boolean;
  variants: SentenceFn[];
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function clean(s: string): string {
  return s.replace(/\.$/, '').trim();
}

// ─────────────────────────────────────────────────────────────────
// RULE ENGINE  (30 rules across 5 categories)
// ─────────────────────────────────────────────────────────────────

const RULES: Rule[] = [

  // ── ERGONOMICS ──────────────────────────────────────────────────

  {
    // Very tall + tight headroom
    condition: (car, p) => p.heightInches >= 74 && car.specs.front_headroom_in < 38,
    variants: [
      (car) => `At ${car.specs.front_headroom_in}" of front headroom, taller drivers often feel pressed against the ceiling on longer trips.`,
      (car) => `The ${car.specs.front_headroom_in}" headroom is on the snug side for taller builds — sitting in one first would be a smart move.`,
      (_c, p) => `At ${Math.floor(p.heightInches / 12)}'${p.heightInches % 12}", the headroom may feel a touch restrictive over extended drives.`,
    ],
  },
  {
    // Tall + generous headroom
    condition: (car, p) => p.heightInches >= 74 && car.specs.front_headroom_in >= 39,
    variants: [
      (car) => `The generous ${car.specs.front_headroom_in}" of front headroom is a real asset for taller drivers — you won't feel cramped at all.`,
      (car) => `${car.specs.front_headroom_in}" of headroom gives tall drivers proper clearance without compromising posture.`,
      (_c, p) => `At ${Math.floor(p.heightInches / 12)}'${p.heightInches % 12}", your height should fit this cabin very comfortably.`,
    ],
  },
  {
    // Short driver, lots of headroom
    condition: (car, p) => p.heightInches < 65 && car.specs.front_headroom_in >= 39,
    variants: [
      () => `There's far more overhead space than you'll ever need — the interior will feel open and airy rather than tight.`,
      (car) => `The ${car.specs.front_headroom_in}" headroom means the cabin feels spacious and unconfined regardless of stature.`,
    ],
  },
  {
    // Average height + adequate headroom
    condition: (car, p) =>
      p.heightInches >= 65 && p.heightInches <= 73 && car.specs.front_headroom_in >= 37,
    variants: [
      (car) => `Your height falls right in the sweet spot for this cabin — ${car.specs.front_headroom_in}" of headroom should feel just right.`,
      () => `Average-height drivers tend to feel well-proportioned in this layout; the seating position should suit you naturally.`,
    ],
  },
  {
    // Tall driver in an SUV or truck
    condition: (car, p) =>
      p.heightInches >= 70 && (car.category === 'suv' || car.category === 'truck'),
    variants: [
      () => `The elevated SUV seating position works naturally with a taller frame, giving a commanding view without feeling boxed in.`,
      () => `Taller builds tend to feel right at home in SUVs — the upright posture and generous proportions translate well.`,
    ],
  },
  {
    // Short driver in a hatchback
    condition: (car, p) => p.heightInches < 66 && car.category === 'hatchback',
    variants: [
      () => `Compact hatchbacks suit shorter drivers very naturally — intuitive reach to controls and a nimble, connected feel behind the wheel.`,
      () => `The proportions of a hatchback work well for shorter drivers; everything feels close at hand and easy to manage.`,
    ],
  },

  // ── VISIBILITY ──────────────────────────────────────────────────

  {
    // Low vision + high visibility score
    condition: (car, p) => p.eyeCondition === 'low_vision' && car.visibility.score >= 8,
    variants: [
      (car) => `Given your low vision, the strong ${car.visibility.score}/10 visibility score is a meaningful advantage — open sightlines reduce the guesswork.`,
      (car) => `A ${car.visibility.score}/10 visibility rating genuinely helps for someone managing low vision; fewer blind spots to compensate for.`,
    ],
  },
  {
    // Low vision + poor visibility score
    condition: (car, p) => p.eyeCondition === 'low_vision' && car.visibility.score < 6,
    variants: [
      (car) => `With low vision, the ${car.visibility.score}/10 visibility score is worth taking seriously — thick pillars can limit sightlines considerably.`,
      (car) => `The below-average visibility rating (${car.visibility.score}/10) is a genuine consideration for drivers managing low vision.`,
    ],
  },
  {
    // Night blindness + good visibility
    condition: (car, p) => p.eyeCondition === 'night_blindness' && car.visibility.score >= 7,
    variants: [
      (car) => `The ${car.visibility.score}/10 visibility score helps offset night blindness — wide glass areas improve your sense of the road after dark.`,
      (car) => `Good sightlines (${car.visibility.score}/10) are a plus for night driving; more natural light into the cabin works in your favour.`,
    ],
  },
  {
    // Night blindness + poor visibility
    condition: (car, p) => p.eyeCondition === 'night_blindness' && car.visibility.score < 6,
    variants: [
      (car) => `Night blindness paired with a ${car.visibility.score}/10 visibility score makes after-dark driving something to think carefully about.`,
      (car) => `Restricted sightlines (${car.visibility.score}/10) can amplify the challenges of night blindness — extra caution at night would be warranted.`,
    ],
  },
  {
    // Peripheral vision loss + strong visibility
    condition: (car, p) => p.eyeCondition === 'peripheral_loss' && car.visibility.score >= 7,
    variants: [
      (car) => `The open sightlines (${car.visibility.score}/10) help offset peripheral vision loss when merging or changing lanes.`,
      (car) => `A ${car.visibility.score}/10 visibility score is reassuring for peripheral vision challenges — fewer structural blind spots to manage.`,
    ],
  },
  {
    // Glasses or contacts + excellent visibility
    condition: (car, p) =>
      (p.eyeCondition === 'glasses' || p.eyeCondition === 'contacts') &&
      car.visibility.score >= 8,
    variants: [
      (car) => `The ${car.visibility.score}/10 visibility pairs well with corrective lenses — expansive sightlines reduce visual fatigue on longer drives.`,
      (car) => `Strong outward visibility (${car.visibility.score}/10) complements glasses or contacts; everything you need to see is easy to see.`,
    ],
  },
  {
    // No eye condition + exceptional visibility
    condition: (car, p) => p.eyeCondition === 'none' && car.visibility.score >= 8,
    variants: [
      (car) => `The ${car.visibility.score}/10 visibility score means excellent all-round sightlines — very little gets lost in blind spots.`,
      (car) => `Class-leading visibility (${car.visibility.score}/10) keeps you fully connected to what's happening around the car at all times.`,
    ],
  },
  {
    // Depth perception challenges + demanding handling
    condition: (car, p) =>
      p.eyeCondition === 'depth_perception' && car.handling.difficulty >= 7,
    variants: [
      (car) => `Depth perception challenges can make precise cornering feel less intuitive — the ${car.handling.difficulty}/10 handling difficulty is worth factoring in.`,
      (car) => `A demanding handling character (${car.handling.difficulty}/10) may amplify depth perception difficulties in dynamic situations.`,
    ],
  },

  // ── EXPERIENCE vs HANDLING ───────────────────────────────────────

  {
    // Beginner + high difficulty
    condition: (car, p) => p.experienceLevel === 'beginner' && car.handling.difficulty >= 8,
    variants: [
      (car) => `A handling difficulty of ${car.handling.difficulty}/10 makes this a fairly demanding drive — it may push beyond where a newer driver feels fully comfortable.`,
      (car) => `This car has a reactive, rewarding character (${car.handling.difficulty}/10 difficulty) that tends to suit drivers with more experience behind the wheel.`,
      (car) => `The ${car.handling.difficulty}/10 handling difficulty works best once you've built a solid foundation of driving confidence.`,
    ],
  },
  {
    // Beginner + easy handling
    condition: (car, p) => p.experienceLevel === 'beginner' && car.handling.difficulty <= 4,
    variants: [
      (car) => `The forgiving ${car.handling.difficulty}/10 handling difficulty is ideal for building confidence — it'll rarely catch you off guard.`,
      (car) => `Easy, predictable dynamics (${car.handling.difficulty}/10) make this a natural partner for newer drivers learning the road.`,
      (car) => `At ${car.handling.difficulty}/10 difficulty, the car does much of the heavy lifting, which is exactly what beginner drivers benefit from.`,
    ],
  },
  {
    // Experienced + high difficulty
    condition: (car, p) =>
      (p.experienceLevel === 'experienced' || p.experienceLevel === 'advanced') &&
      car.handling.difficulty >= 7,
    variants: [
      (car) => `With your experience level, the ${car.handling.difficulty}/10 handling difficulty will feel engaging rather than intimidating.`,
      (car) => `Seasoned drivers often gravitate toward cars like this — the demanding dynamics (${car.handling.difficulty}/10) keep driving genuinely interesting.`,
      (car) => `The ${car.handling.difficulty}/10 difficulty is well-matched to an experienced driver who wants to feel connected to the road.`,
    ],
  },
  {
    // Experienced + very easy handling
    condition: (car, p) =>
      (p.experienceLevel === 'experienced' || p.experienceLevel === 'advanced') &&
      car.handling.difficulty <= 3,
    variants: [
      (car) => `The relaxed ${car.handling.difficulty}/10 handling difficulty prioritises comfort over engagement — a trade-off worth consciously weighing.`,
      (car) => `As an experienced driver, the ${car.handling.difficulty}/10 difficulty may feel a little underwhelming if you enjoy dynamic driving.`,
    ],
  },
  {
    // Intermediate + balanced handling
    condition: (car, p) =>
      p.experienceLevel === 'intermediate' &&
      car.handling.difficulty >= 4 &&
      car.handling.difficulty <= 7,
    variants: [
      (car) => `The ${car.handling.difficulty}/10 handling difficulty strikes a nice balance — engaging enough to be fun without crossing into stressful territory.`,
      (car) => `As an intermediate driver, the ${car.handling.difficulty}/10 difficulty level should feel natural and well within your abilities.`,
    ],
  },
  {
    // Near-effortless dynamics for anyone
    condition: (car) => car.handling.difficulty <= 2,
    variants: [
      () => `This is one of the most approachable cars dynamically — it asks very little from the driver, whoever you are.`,
      () => `Near-effortless handling means almost any driver will feel comfortable and at home within minutes.`,
    ],
  },
  {
    // Sports car + beginner
    condition: (car, p) => car.category === 'sports' && p.experienceLevel === 'beginner',
    variants: [
      () => `Sports cars reward skill and experience, so as a newer driver there's a genuine learning curve — though the payoff as you grow is real.`,
      () => `Give yourself time to grow into everything a sports car offers; the adjustment is worth it, but it takes patience.`,
    ],
  },

  // ── SAFETY FEATURES ──────────────────────────────────────────────

  {
    // Auto emergency braking
    condition: (car) => !!car.safety?.has_auto_emergency_braking,
    variants: [
      () => `Automatic emergency braking is a standout feature that can genuinely prevent accidents when reaction time runs short.`,
      () => `The AEB system adds a meaningful safety net — intervening in moments where human reflexes may not be fast enough.`,
    ],
  },
  {
    // Lane-keeping assist
    condition: (car) => !!car.safety?.has_lane_assist,
    variants: [
      () => `Lane-keeping assist is a welcome co-pilot on motorway stretches, reducing the mental load of sustained highway driving.`,
      () => `Built-in lane assist keeps you centred without constant micro-corrections — particularly useful on longer journeys.`,
    ],
  },
  {
    // Blind spot monitor + peripheral vision loss (priority match)
    condition: (car, p) =>
      !!car.safety?.has_blind_spot_monitor && p.eyeCondition === 'peripheral_loss',
    variants: [
      () => `The blind spot monitor is especially valuable given your peripheral vision condition — it directly covers the angles you may naturally miss.`,
      () => `Blind spot monitoring pairs particularly well with peripheral vision loss, compensating electronically where vision falls short.`,
    ],
  },
  {
    // Blind spot monitor (everyone else)
    condition: (car, p) =>
      !!car.safety?.has_blind_spot_monitor && p.eyeCondition !== 'peripheral_loss',
    variants: [
      () => `Blind spot monitoring takes the guesswork out of lane changes in dense traffic.`,
      () => `The blind spot detection adds a quiet layer of awareness whenever you're navigating alongside other vehicles.`,
    ],
  },
  {
    // Adaptive cruise control
    condition: (car) => !!car.safety?.has_adaptive_cruise,
    variants: [
      () => `Adaptive cruise control makes motorway driving noticeably less fatiguing, adjusting speed automatically to maintain a safe gap.`,
      () => `The adaptive cruise system is a commuter's friend — it holds safe following distances so you can stay relaxed on long stretches.`,
    ],
  },
  {
    // Parking sensors
    condition: (car) => !!car.safety?.has_parking_sensors,
    variants: [
      () => `Parking sensors take the stress out of tight urban spaces and parallel parking situations.`,
      () => `Built-in parking sensors make manoeuvring in busy car parks considerably less nerve-wracking.`,
    ],
  },
  {
    // Thin safety suite (≤ 1 feature)
    condition: (car) => {
      const s = car.safety ?? {};
      const count = [
        s.has_auto_emergency_braking,
        s.has_lane_assist,
        s.has_blind_spot_monitor,
        s.has_parking_sensors,
        s.has_adaptive_cruise,
      ].filter(Boolean).length;
      return count <= 1;
    },
    variants: [
      () => `The safety package is fairly minimal — you're relying primarily on your own awareness rather than electronic driver assists.`,
      () => `Modern driver-assist technology is thin on the ground here; it takes a more traditional approach to safety.`,
    ],
  },
  {
    // Comprehensive safety suite (≥ 4 features)
    condition: (car) => {
      const s = car.safety ?? {};
      const count = [
        s.has_auto_emergency_braking,
        s.has_lane_assist,
        s.has_blind_spot_monitor,
        s.has_parking_sensors,
        s.has_adaptive_cruise,
      ].filter(Boolean).length;
      return count >= 4;
    },
    variants: [
      () => `The full suite of safety assists makes this one of the more comprehensively protected options in this range.`,
      () => `Strong across safety technology — it's hard to find meaningful gaps in what's on offer here.`,
    ],
  },

  // ── BUDGET ────────────────────────────────────────────────────────

  {
    // Well under budget (≤ 75 %)
    condition: (car, p) => car.price_usd <= p.budget * 0.75,
    variants: [
      (car, p) => `At $${car.price_usd.toLocaleString()}, it lands well within your $${p.budget.toLocaleString()} budget — leaving meaningful room for running costs or extras.`,
      (car, p) => `The $${car.price_usd.toLocaleString()} price tag gives you a comfortable buffer under your ceiling, which is always worth having.`,
      (car, p) => `Priced at $${car.price_usd.toLocaleString()}, there's a healthy financial gap beneath your $${p.budget.toLocaleString()} limit.`,
    ],
  },
  {
    // Within budget (75–100 %)
    condition: (car, p) =>
      car.price_usd > p.budget * 0.75 && car.price_usd <= p.budget,
    variants: [
      (car, p) => `At $${car.price_usd.toLocaleString()}, it fits within your budget though without a lot left to spare.`,
      (car, p) => `The price sits within your $${p.budget.toLocaleString()} ceiling, using a fair portion of your available range.`,
    ],
  },
  {
    // Slightly over budget (100–115 %)
    condition: (car, p) =>
      car.price_usd > p.budget && car.price_usd <= p.budget * 1.15,
    variants: [
      (car, p) => `At $${car.price_usd.toLocaleString()}, it nudges marginally above your $${p.budget.toLocaleString()} budget — worth deciding whether the overall fit justifies the stretch.`,
      (car, p) => `It's slightly over budget ($${car.price_usd.toLocaleString()} vs $${p.budget.toLocaleString()}), but if the scores align, a modest stretch may be worthwhile.`,
    ],
  },
  {
    // Significantly over budget (> 115 %)
    condition: (car, p) => car.price_usd > p.budget * 1.15,
    variants: [
      (car, p) => `The $${car.price_usd.toLocaleString()} price tag runs notably above your $${p.budget.toLocaleString()} budget — factor in whether the features justify the premium.`,
      (_c, p) => `This one stretches meaningfully beyond your budget; carefully weigh the benefits against the extra financial outlay.`,
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// PRO / CON WRAPPERS
// ─────────────────────────────────────────────────────────────────

const PRO_WRAPPERS: Array<(pro: string) => string> = [
  (pro) => `A clear strength: ${clean(pro)}.`,
  (pro) => `Worth highlighting — ${clean(pro)}.`,
  (pro) => `One standout quality: ${clean(pro)}.`,
  (pro) => `On the plus side: ${clean(pro)}.`,
  (pro) => `Notable advantage: ${clean(pro)}.`,
];

const CON_WRAPPERS: Array<(con: string) => string> = [
  (con) => `One trade-off: ${clean(con)}.`,
  (con) => `Worth considering — ${clean(con)}.`,
  (con) => `A potential drawback: ${clean(con)}.`,
  (con) => `Something to keep in mind: ${clean(con)}.`,
  (con) => `On the flip side: ${clean(con)}.`,
];

// ─────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────

export function generateCarNarrative(
  car: Car,
  profile: DriverProfile,
  prosAndCons: ProsAndCons,
): string {
  // Evaluate all rules and collect matching sentences
  const matching: string[] = [];
  for (const rule of RULES) {
    if (rule.condition(car, profile)) {
      matching.push(pick(rule.variants)(car, profile));
    }
  }

  // Shuffle and take up to 2 rule-based sentences
  const selected: string[] = shuffle(matching).slice(0, 2);

  // Weave in top pro
  if (prosAndCons.pros.length > 0) {
    selected.push(pick(PRO_WRAPPERS)(prosAndCons.pros[0]!));
  }

  // Weave in top con
  if (prosAndCons.cons.length > 0) {
    selected.push(pick(CON_WRAPPERS)(prosAndCons.cons[0]!));
  }

  // Final shuffle so pro/con don't always land at the end
  const final = shuffle(selected).slice(0, 4);

  if (final.length === 0) {
    return 'This vehicle has been matched to your profile based on ergonomic fit, visibility, and safety criteria. Review the scores above for a full breakdown.';
  }

  return final.join(' ');
}

export default generateCarNarrative;
