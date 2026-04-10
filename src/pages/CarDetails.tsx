import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Car, ArrowLeft, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { generateCarNarrative } from '../utils/narrativeEngine';
import { getCarImage } from '../utils/carImages';
import type { ScoredResult, DriverProfile } from '../algorithm/scoring';


const SCORE_LABELS: Record<string, string> = {
  ergonomic:  'Ergonomic Fit',
  visibility: 'Visibility',
  safety:     'Safety Rating',
  handling:   'Handling Match',
  budget:     'Budget Fit',
};

const SAFETY_FEATURES = [
  { key: 'has_backup_camera',               label: 'Backup Camera' },
  { key: 'has_blind_spot_monitoring',       label: 'Blind Spot Monitor' },
  { key: 'has_lane_assist',                 label: 'Lane Departure Alert' },
  { key: 'has_automatic_emergency_braking', label: 'Auto Emergency Braking' },
  { key: 'has_adaptive_cruise',             label: 'Adaptive Cruise Control' },
];

function ScoreRing({ score }: { score: number }) {
  const [animated, setAnimated] = useState(0);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 150);
    return () => clearTimeout(t);
  }, [score]);

  const offset = circumference - (animated / 100) * circumference;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={radius} fill="transparent" stroke="#e6e8ea" strokeWidth="8" />
        <circle
          cx="80" cy="80" r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <span className="absolute text-5xl font-headline font-bold text-on-surface">{score}</span>
    </div>
  );
}

function AnimatedBar({ value }: { value: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 200);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div className="h-3 bg-surface-container rounded-full overflow-hidden">
      <div
        className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

export default function CarDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { result, profile } = (location.state ?? {}) as {
    result: ScoredResult;
    profile: DriverProfile;
  };

  const [narrative, setNarrative] = useState<string | null>(null);
  const [narrativeLoading, setNarrativeLoading] = useState(false);

  useEffect(() => {
    if (!result || !profile) navigate('/onboarding');
  }, []);

  if (!result || !profile) return null;

  const { car, totalScore, breakdown, prosAndCons } = result;
  const heroImage = getCarImage(car.brand, 1200);

  function analyzeCompatibility() {
    if (narrative || narrativeLoading) return;
    setNarrativeLoading(true);
    const text = generateCarNarrative(car, profile, prosAndCons ?? { pros: [], cons: [] });
    setNarrative(text);
    setNarrativeLoading(false);
  }

  const budgetLabel =
    car.price_usd <= profile.budget ? 'Within Budget' :
    car.price_usd <= profile.budget * 1.2 ? 'Slightly Over' : 'Over Budget';
  const budgetColor =
    car.price_usd <= profile.budget ? 'bg-green-100 text-green-700' :
    car.price_usd <= profile.budget * 1.2 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen">
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-3">
          <Car className="w-7 h-7 text-primary" />
          <span className="text-2xl font-bold text-slate-900 font-headline tracking-tight">FitDrive AI</span>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary font-semibold text-sm hover:bg-primary/5 px-4 py-2 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Results
        </button>
      </nav>

      <main className="pt-24 pb-32 max-w-7xl mx-auto px-6">

        {/* ── Hero Section ── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          {/* Hero image */}
          <div className="lg:col-span-8 bg-surface-container-lowest rounded-3xl overflow-hidden relative min-h-[400px] lg:min-h-[500px]">
            <img
              src={heroImage}
              alt={`${car.brand} ${car.model}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
            {/* Budget badge */}
            <div className={`absolute top-5 right-5 px-3 py-1.5 rounded-full text-xs font-bold ${budgetColor}`}>
              {budgetLabel}
            </div>
            <div className="absolute bottom-0 left-0 w-full p-8">
              <span className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-2 block">
                {car.year} · {car.category.charAt(0).toUpperCase() + car.category.slice(1)}
              </span>
              <h1 className="text-white text-4xl md:text-5xl font-headline font-bold tracking-tight leading-tight">
                {car.brand} {car.model}
              </h1>
              <p className="text-white/75 text-lg mt-2 font-medium">
                ${car.price_usd.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Score + CTA column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-surface-container-lowest p-8 rounded-3xl flex flex-col items-center justify-center text-center flex-grow">
              <span className="text-on-surface-variant font-bold uppercase tracking-widest text-xs mb-5">
                FitDrive AI Score
              </span>
              <ScoreRing score={totalScore} />
              <div className="mt-6 min-h-[60px] flex items-center justify-center">
                {narrativeLoading ? (
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating analysis…
                  </div>
                ) : narrative ? (
                  <p className="text-on-surface-variant text-sm leading-relaxed">{narrative}</p>
                ) : (
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    Click below to get your personalised AI compatibility analysis.
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={analyzeCompatibility}
              disabled={narrativeLoading || !!narrative}
              className="text-white py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-default"
              style={{ background: 'linear-gradient(135deg, #0061a4 0%, #2196f3 100%)' }}
            >
              <Sparkles className="w-5 h-5" />
              {narrative ? 'Analysis Complete' : 'Analyze Compatibility'}
            </button>
          </div>
        </section>

        {/* ── Bento Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {/* Score breakdown bars — 2 cols */}
          <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm lg:col-span-2">
            <h3 className="text-2xl font-headline font-bold mb-8">Detailed Fit Breakdown</h3>
            {breakdown && (
              <div className="space-y-6">
                {Object.entries(breakdown).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-bold uppercase tracking-wide text-on-surface-variant">
                      <span>{SCORE_LABELS[key] ?? key}</span>
                      <span className="text-on-surface">{value}%</span>
                    </div>
                    <AnimatedBar value={value} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pros / Cons — 1 col */}
          <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm">
            <h3 className="text-2xl font-headline font-bold mb-6">AI Fit Analysis</h3>
            <div className="space-y-6">
              {prosAndCons?.pros && prosAndCons.pros.length > 0 && (
                <div>
                  <span className="text-primary font-bold text-xs uppercase tracking-widest block mb-3">
                    Key Strengths
                  </span>
                  <ul className="space-y-3">
                    {prosAndCons.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-on-surface text-sm leading-snug">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {prosAndCons?.cons && prosAndCons.cons.length > 0 && (
                <div>
                  <span className="text-amber-600 font-bold text-xs uppercase tracking-widest block mb-3">
                    Considerations
                  </span>
                  <ul className="space-y-3">
                    {prosAndCons.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span className="text-on-surface text-sm leading-snug">{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Specs & Safety ── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Key Specs */}
          <div className="bg-surface-container-low p-8 rounded-3xl">
            <h3 className="text-2xl font-headline font-bold mb-8">Key Specifications</h3>
            <div className="grid grid-cols-2 gap-y-8 gap-x-12">
              {[
                { label: 'Front Headroom',  value: `${car.specs.front_headroom_in}"` },
                { label: 'Front Legroom',   value: `${car.specs.front_legroom_in}"` },
                { label: 'Shoulder Room',   value: `${car.specs.front_shoulder_room_in}"` },
                { label: 'Turning Radius',  value: `${car.specs.turning_radius_ft} ft` },
                { label: 'Car Length',      value: `${car.specs.length_in}"` },
                { label: 'Kerb Weight',     value: `${car.specs.weight_lbs.toLocaleString()} lbs` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest block mb-1">
                    {label}
                  </span>
                  <span className="text-xl font-headline font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Safety features */}
          <div className="bg-surface-container-low p-8 rounded-3xl">
            <h3 className="text-2xl font-headline font-bold mb-8">Safety &amp; Security</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SAFETY_FEATURES.map(({ key, label }) => {
                const hasIt = car.safety[key as keyof typeof car.safety] as boolean;
                return (
                  <div
                    key={key}
                    className={`bg-surface-container-lowest p-4 rounded-xl flex items-center gap-4 transition-opacity ${
                      hasIt ? 'opacity-100' : 'opacity-40'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${hasIt ? 'bg-primary/10' : 'bg-surface-container'}`}>
                      <CheckCircle2 className={`w-5 h-5 ${hasIt ? 'text-primary' : 'text-on-surface-variant'}`} />
                    </div>
                    <span className="text-sm font-semibold">{label}</span>
                  </div>
                );
              })}
            </div>
            {/* NHTSA badge */}
            <div className="mt-6 p-4 bg-primary/5 rounded-2xl flex items-center gap-3">
              <span className="text-primary text-xl">★</span>
              <span className="text-primary font-bold text-sm">
                NHTSA Overall Safety Rating: {car.safety.nhtsa_overall} / 5
              </span>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
