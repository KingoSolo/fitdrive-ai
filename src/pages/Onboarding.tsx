import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Ruler, Eye, HeartPulse, Info, ChevronDown,
  CheckSquare, Square, ArrowLeft, ArrowRight, UserRound,
  Car, Gauge, Sparkles, DollarSign,
} from 'lucide-react';
import cars from '../data/cars.json';
import { buildDriverProfile, rankCarsForDriver, generateProsAndCons } from '../algorithm/scoring.js';

const EYE_CONDITIONS = [
  { id: 'none',             label: 'No Condition' },
  { id: 'glasses',          label: 'Wear Glasses' },
  { id: 'contacts',         label: 'Wear Contacts' },
  { id: 'low_vision',       label: 'Low Vision' },
  { id: 'night_blindness',  label: 'Night Blindness' },
  { id: 'peripheral_loss',  label: 'Peripheral Vision Loss' },
  { id: 'depth_perception', label: 'Depth Perception Issues' },
];

const PHYSICAL_CONDITIONS = [
  { id: 'reduced_mobility', label: 'Reduced Mobility' },
  { id: 'arthritis',        label: 'Arthritis / Joint Pain' },
  { id: 'limited_neck',     label: 'Limited Neck Rotation' },
  { id: 'large_build',      label: 'Large / Wide Build' },
  { id: 'none_apply',       label: 'None of these' },
];

const EYE_LABEL_MAP: Record<string, string> = {
  none:             'No Eye Condition',
  glasses:          'Glasses',
  contacts:         'Contacts',
  low_vision:       'Low Vision',
  night_blindness:  'Night Blindness',
  peripheral_loss:  'Peripheral Vision Loss',
  depth_perception: 'Depth Perception',
};

const BUDGET_PRESETS = [
  { value: 15000, label: 'Entry' },
  { value: 25000, label: 'Mid-Range' },
  { value: 40000, label: 'Premium' },
  { value: 60000, label: 'Luxury' },
];

function formatBudget(val: number) {
  return `$${val.toLocaleString()}`;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();

  // When returning from Quiz, location.state carries back the form data + quizResult
  const ret = (location.state ?? {}) as {
    returnStep?: 2 | 3;
    formData?: { feet: number; inches: number; eyeCondition: string; otherConditions: string[] };
    quizResult?: { level: string; score: number; profile: string };
    name?: string;
  };

  // Step — jump straight to returnStep if coming back from Quiz
  const [step, setStep] = useState<1 | 2 | 3>(ret.returnStep ?? 1);

  // Step 1 state — seeded from returned formData if present
  const [name, setName]               = useState(ret.name ?? '');
  const [feet, setFeet]               = useState(ret.formData?.feet ?? 5);
  const [inches, setInches]           = useState(ret.formData?.inches ?? 10);
  const [eyeCondition, setEyeCondition] = useState<string>(ret.formData?.eyeCondition ?? 'none');
  const [otherConditions, setOtherConditions] = useState<string[]>(ret.formData?.otherConditions ?? []);

  // Step 2 state
  const [driverType, setDriverType]   = useState<'new' | 'experienced' | null>(
    ret.returnStep ? 'experienced' : null,
  );
  const [confidence, setConfidence]   = useState(50);

  // Quiz result (set when returning from the quiz page)
  const [quizResult, setQuizResult]   = useState(ret.quizResult ?? null);

  // Step 3 state
  const [budget, setBudget] = useState(25000);

  function toggleCondition(id: string) {
    if (id === 'none_apply') {
      setOtherConditions(['none_apply']);
      return;
    }
    setOtherConditions((prev) => {
      const without = prev.filter((c) => c !== 'none_apply');
      return without.includes(id)
        ? without.filter((c) => c !== id)
        : [...without, id];
    });
  }

  function handleContinue() {
    if (step === 1) { setStep(2); return; }

    if (step === 2) {
      if (driverType === 'experienced') {
        // Send to Quiz before asking budget
        navigate('/quiz', {
          state: {
            formData: { feet, inches, eyeCondition, otherConditions },
            name,
          },
        });
      } else {
        setStep(3);
      }
      return;
    }

    // Step 3 — build profile and run algorithm now that we have budget
    const experienceLevel = quizResult?.level ?? 'beginner';
    const profile = buildDriverProfile({
      heightFeet: feet,
      heightInches: inches.toString(),
      eyeCondition,
      experienceLevel,
      budget,
      otherConditions,
    });
    const ranked = rankCarsForDriver(cars, profile, 12);
    const results = ranked.map((r: any) => ({
      ...r,
      prosAndCons: generateProsAndCons(r, profile),
    }));
    navigate('/results', { state: { profile, results, quizResult, name } });
  }

  function handleBack() {
    if (step === 1) { navigate('/'); return; }
    if (step === 2) { setStep(1); return; }
    setStep(2);
  }

  const dotFilled = (dot: number) => step >= dot;

  return (
    <div className="text-on-surface min-h-screen bg-surface font-body">
      {/* Sticky header */}
      <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl px-6 py-5 flex items-center justify-between">
        <span className="text-primary font-headline text-2xl font-bold tracking-tight">FitDrive AI</span>
        <div className="flex gap-2">
          {[1, 2, 3].map((dot) => (
            <div
              key={dot}
              className={`h-2 w-10 rounded-full transition-colors duration-300 ${
                dotFilled(dot) ? 'bg-primary' : 'bg-surface-container-high'
              }`}
            />
          ))}
        </div>
      </header>

      <main className="pt-28 pb-32 px-6 max-w-4xl mx-auto">
        {/* ───────────── STEP 1 ───────────── */}
        {step === 1 && (
          <>
            <div className="mb-10">
              <span className="text-primary font-bold tracking-widest text-xs uppercase mb-2 block">
                Step 1 of 3
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tight mb-3 font-headline">
                Your Physical Profile
              </h1>
              <p className="text-on-surface-variant text-lg max-w-xl font-medium">
                Help us understand your body and vision so we can find cars that truly fit you.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Left column */}
              <div className="md:col-span-7 space-y-8">
                {/* Name */}
                <section className="bg-surface-container-lowest p-8 rounded-xl shadow-ambient">
                  <div className="flex items-center gap-3 mb-6">
                    <UserRound className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-bold tracking-tight">What should we call you?</h2>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                      First Name (optional)
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex"
                      className="w-full bg-surface-container-low border-none rounded-lg py-4 px-4 text-on-surface font-semibold focus:ring-2 focus:ring-primary/20 focus:outline-none placeholder:text-on-surface-variant/40"
                    />
                  </div>
                </section>

                {/* Height */}
                <section className="bg-surface-container-lowest p-8 rounded-xl shadow-ambient">
                  <div className="flex items-center gap-3 mb-6">
                    <Ruler className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-bold tracking-tight">Your Height</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Feet</label>
                      <div className="relative">
                        <select
                          value={feet}
                          onChange={(e) => setFeet(Number(e.target.value))}
                          className="w-full appearance-none bg-surface-container-low border-none rounded-lg py-4 px-4 text-on-surface font-semibold focus:ring-2 focus:ring-primary/20 cursor-pointer"
                        >
                          {[4, 5, 6, 7].map((f) => (
                            <option key={f} value={f}>{f} ft</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Inches</label>
                      <div className="relative">
                        <select
                          value={inches}
                          onChange={(e) => setInches(Number(e.target.value))}
                          className="w-full appearance-none bg-surface-container-low border-none rounded-lg py-4 px-4 text-on-surface font-semibold focus:ring-2 focus:ring-primary/20 cursor-pointer"
                        >
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i} value={i}>{i} in</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Eye conditions */}
                <section className="bg-surface-container-lowest p-8 rounded-xl shadow-ambient">
                  <div className="flex items-center gap-3 mb-6">
                    <Eye className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-bold tracking-tight">Eye Condition</h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {EYE_CONDITIONS.map(({ id, label }) => {
                      const active = eyeCondition === id;
                      return (
                        <button
                          key={id}
                          onClick={() => setEyeCondition(id)}
                          className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 ${
                            active
                              ? 'bg-primary text-white shadow-md border border-transparent'
                              : 'bg-surface-container-low text-on-surface-variant border border-outline-variant/20 hover:bg-surface-container-high'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Physical conditions */}
                <section className="bg-surface-container-lowest p-8 rounded-xl shadow-ambient">
                  <div className="flex items-center gap-3 mb-6">
                    <HeartPulse className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-bold tracking-tight">Physical Conditions</h2>
                  </div>
                  <p className="text-sm text-on-surface-variant mb-6 font-medium">
                    Select any that apply to help us tailor your car recommendations.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PHYSICAL_CONDITIONS.map(({ id, label }) => {
                      const checked = otherConditions.includes(id);
                      return (
                        <button
                          key={id}
                          onClick={() => toggleCondition(id)}
                          className={`flex items-center gap-3 p-4 rounded-lg border transition-colors cursor-pointer text-left ${
                            checked
                              ? 'bg-primary/5 border-primary/20'
                              : 'bg-surface-container-low border-transparent hover:border-primary/30'
                          }`}
                        >
                          {checked
                            ? <CheckSquare className="w-5 h-5 text-primary flex-shrink-0" />
                            : <Square className="w-5 h-5 text-on-surface-variant flex-shrink-0" />
                          }
                          <span className={`text-sm font-bold ${checked ? 'text-on-primary-container' : ''}`}>
                            {label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>

              {/* Right sticky column */}
              <div className="md:col-span-5">
                <div className="sticky top-28 space-y-6">
                  <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-ambient">
                    <img
                      src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80"
                      alt="Car interior"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                      <p className="text-white font-headline text-lg font-medium leading-tight">
                        "The right car fits like it was made for you."
                      </p>
                    </div>
                  </div>
                  <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                    <div className="flex gap-4 items-start">
                      <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-on-primary-container font-bold text-sm mb-1">Why this matters</h4>
                        <p className="text-on-primary-container/80 text-xs leading-relaxed">
                          Your height determines headroom and legroom needs. Eye conditions affect which
                          visibility and safety features are most important for you.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ───────────── STEP 2 ───────────── */}
        {step === 2 && (
          <>
            <div className="mb-10">
              <span className="text-primary font-bold tracking-widest text-xs uppercase mb-2 block">
                Step 2 of 3
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tight mb-3 font-headline">
                Driving Experience
              </h1>
              <p className="text-on-surface-variant text-lg max-w-xl font-medium">
                Tell us about your time behind the wheel so we can calibrate your recommendations.
              </p>
            </div>

            {/* Two large cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {/* New Driver */}
              <button
                onClick={() => setDriverType('new')}
                className={`text-left p-8 rounded-2xl border-2 transition-all duration-300 active:scale-[0.98] ${
                  driverType === 'new'
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                    : 'border-outline-variant/20 bg-surface-container-lowest hover:border-primary/30 hover:shadow-md'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${
                  driverType === 'new' ? 'bg-primary/10' : 'bg-surface-container-low'
                }`}>
                  <Car className={`w-7 h-7 ${driverType === 'new' ? 'text-primary' : 'text-on-surface-variant'}`} />
                </div>
                <h3 className={`text-2xl font-bold font-headline mb-2 ${driverType === 'new' ? 'text-primary' : 'text-on-surface'}`}>
                  New Driver
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                  Less than 2 years of experience or still building confidence on the road.
                </p>

                {/* Confidence slider — shown inside card when new driver selected */}
                {driverType === 'new' && (
                  <div
                    className="mt-2 pt-5 border-t border-primary/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3 block">
                      Confidence Level: {confidence}%
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={confidence}
                      onChange={(e) => setConfidence(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-xs text-on-surface-variant mt-1">
                      <span>Learning</span>
                      <span>Confident</span>
                    </div>
                  </div>
                )}
              </button>

              {/* Experienced Driver */}
              <button
                onClick={() => setDriverType('experienced')}
                className={`text-left p-8 rounded-2xl border-2 transition-all duration-300 active:scale-[0.98] ${
                  driverType === 'experienced'
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                    : 'border-outline-variant/20 bg-surface-container-lowest hover:border-primary/30 hover:shadow-md'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${
                  driverType === 'experienced' ? 'bg-primary/10' : 'bg-surface-container-low'
                }`}>
                  <Gauge className={`w-7 h-7 ${driverType === 'experienced' ? 'text-primary' : 'text-on-surface-variant'}`} />
                </div>
                <h3 className={`text-2xl font-bold font-headline mb-2 ${driverType === 'experienced' ? 'text-primary' : 'text-on-surface'}`}>
                  Experienced Driver
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-4">
                  2+ years of regular driving. Comfortable in varied conditions.
                </p>
                {driverType === 'experienced' && (
                  <div className="mt-2 pt-5 border-t border-primary/10">
                    <p className="text-xs text-primary font-semibold">
                      ✦ You'll take a short 6-question quiz to fine-tune your results.
                    </p>
                  </div>
                )}
              </button>
            </div>

            {/* Editorial bottom section */}
            <div className="rounded-3xl overflow-hidden bg-slate-900 flex flex-col md:flex-row items-stretch">
              <div className="md:w-1/2 h-48 md:h-auto overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80"
                  alt="Car interior"
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
              <div className="md:w-1/2 p-8 flex flex-col justify-center text-white">
                <div
                  className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-300 px-3 py-1 rounded-md mb-4 self-start"
                  style={{ background: 'rgba(33,150,243,0.15)' }}
                >
                  Did you know?
                </div>
                <p className="text-slate-200 text-sm leading-relaxed mb-4">
                  <span className="text-white font-extrabold text-2xl font-headline">98%</span> of drivers
                  who matched their experience level to their car reported higher satisfaction within the first
                  6 months of ownership.
                </p>
                <p className="text-slate-400 text-xs">
                  Based on FitDrive AI analysis of 50,000+ driver profiles.
                </p>
              </div>
            </div>
          </>
        )}

        {/* ───────────── STEP 3 ───────────── */}
        {step === 3 && (
          <>
            <div className="mb-10">
              <span className="text-primary font-bold tracking-widest text-xs uppercase mb-2 block">
                Step 3 of 3
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tight mb-3 font-headline">
                Your Budget
              </h1>
              <p className="text-on-surface-variant text-lg max-w-xl font-medium">
                Set a comfortable ceiling — we'll find the best matches within reach.
              </p>
              {quizResult && (
                <div
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-white text-sm font-bold"
                  style={{ background: 'linear-gradient(135deg, #0061a4 0%, #2196f3 100%)' }}
                >
                  ✦ Quiz: {quizResult.profile} · Score {quizResult.score}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-7 space-y-8">
                {/* Slider card */}
                <section className="bg-surface-container-lowest p-8 rounded-xl shadow-ambient">
                  <div className="flex items-center gap-3 mb-8">
                    <DollarSign className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-bold tracking-tight">Maximum Budget</h2>
                  </div>
                  <div className="text-center mb-8">
                    <span className="text-5xl font-black text-on-surface font-headline tracking-tight">
                      {formatBudget(budget)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5000}
                    max={150000}
                    step={1000}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full accent-primary mb-4"
                  />
                  <div className="flex justify-between text-xs text-on-surface-variant font-medium">
                    <span>$5,000</span>
                    <span>$150,000</span>
                  </div>

                  {/* Quick presets */}
                  <div className="mt-8">
                    <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Quick Select</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {BUDGET_PRESETS.map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => setBudget(value)}
                          className={`py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                            budget === value
                              ? 'text-white shadow-md'
                              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                          }`}
                          style={budget === value ? { background: 'linear-gradient(135deg, #0061a4 0%, #2196f3 100%)' } : {}}
                        >
                          <div>{formatBudget(value)}</div>
                          <div className={`text-xs mt-0.5 font-medium ${budget === value ? 'text-white/80' : 'text-on-surface-variant/60'}`}>
                            {label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              </div>

              {/* Right: Preferences summary */}
              <div className="md:col-span-5">
                <div className="sticky top-28 space-y-6">
                  <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-ambient">
                    <h3 className="text-sm font-extrabold uppercase tracking-widest text-on-surface-variant mb-5">
                      Your Profile Summary
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-on-surface-variant font-medium">Height</span>
                        <span className="text-sm font-bold text-on-surface">{feet}'{inches}"</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-on-surface-variant font-medium">Eye Condition</span>
                        <span className="text-sm font-bold text-on-surface">{EYE_LABEL_MAP[eyeCondition] ?? eyeCondition}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-on-surface-variant font-medium">Driver Type</span>
                        <span className="text-sm font-bold text-on-surface capitalize">
                          {driverType === 'new' ? 'New Driver' : driverType === 'experienced' ? 'Experienced' : '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-surface-container-high pt-4 mt-4">
                        <span className="text-sm text-on-surface-variant font-medium">Budget</span>
                        <span className="text-sm font-black text-primary">{formatBudget(budget)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                    <div className="flex gap-4 items-start">
                      <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-on-primary-container font-bold text-sm mb-1">Almost there</h4>
                        <p className="text-on-primary-container/80 text-xs leading-relaxed">
                          Our AI will rank all cars in our database specifically for your height, vision,
                          and driving style — all within budget.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Fixed navigation footer */}
      <div className="fixed bottom-0 left-0 w-full z-50 bg-white/80 backdrop-blur-lg border-t border-slate-100 px-6 py-5 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-on-surface-variant font-bold hover:text-on-surface transition-colors px-4 py-3"
        >
          <ArrowLeft className="w-5 h-5" />
          BACK
        </button>

        <button
          onClick={handleContinue}
          disabled={
            (step === 1 && otherConditions.length === 0) ||
            (step === 2 && driverType === null)
          }
          className="text-white px-10 py-4 rounded-xl font-bold tracking-wide shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #0061a4 0%, #2196f3 100%)' }}
        >
          {step === 3 ? (
            <>Find My Cars <span>✨</span></>
          ) : (
            <>CONTINUE <ArrowRight className="w-5 h-5" /></>
          )}
        </button>
      </div>
    </div>
  );
}
