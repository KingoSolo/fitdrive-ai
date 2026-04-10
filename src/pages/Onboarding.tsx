import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ruler, Eye, HeartPulse, Info, ChevronDown, CheckSquare, Square } from 'lucide-react';

const EYE_CONDITIONS = [
  { id: 'standard', label: 'Standard Vision' },
  { id: 'myopia', label: 'Myopia' },
  { id: 'hyperopia', label: 'Hyperopia' },
  { id: 'astigmatism', label: 'Astigmatism' },
];

const PHYSICAL_CONDITIONS = [
  { id: 'knee_sensitivity', label: 'Knee Sensitivity' },
  { id: 'lower_back_pain', label: 'Lower Back Pain' },
  { id: 'asthma', label: 'Asthma' },
  { id: 'high_blood_pressure', label: 'High Blood Pressure' },
  { id: 'scoliosis', label: 'Scoliosis' },
  { id: 'joint_stiffness', label: 'Joint Stiffness' },
];

export default function Onboarding() {
  const navigate = useNavigate();

  const [feet, setFeet] = useState(6);
  const [inches, setInches] = useState(2);
  const [eyeCondition, setEyeCondition] = useState('standard');
  const [conditions, setConditions] = useState<string[]>(['lower_back_pain']);

  function toggleCondition(id: string) {
    setConditions((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  return (
    <div className="text-on-surface min-h-screen bg-surface font-body">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl px-6 py-6 flex items-center justify-between">
        <span className="text-primary font-headline text-2xl font-bold tracking-tight">FitDrive AI</span>
        <div className="flex gap-2">
          <div className="h-1.5 w-12 rounded-full bg-primary" />
          <div className="h-1.5 w-12 rounded-full bg-surface-container-high" />
          <div className="h-1.5 w-12 rounded-full bg-surface-container-high" />
        </div>
      </header>

      <main className="pt-28 pb-12 px-6 max-w-4xl mx-auto">
        {/* Hero */}
        <div className="mb-12">
          <span className="text-primary font-bold tracking-widest text-xs uppercase mb-2 block">
            Step 1 of 3
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tight mb-4">
            Your Physical Profile
          </h1>
          <p className="text-on-surface-variant text-lg max-w-xl font-medium">
            Precision begins with data. Tell us about your current physical status to calibrate
            your AI-driven training modules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left column */}
          <div className="md:col-span-7 space-y-8">

            {/* Height card */}
            <section className="bg-surface-container-lowest p-8 rounded-xl shadow-ambient">
              <div className="flex items-center gap-3 mb-6">
                <Ruler className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold tracking-tight">Height &amp; Stature</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* Feet */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                    Feet
                  </label>
                  <div className="relative">
                    <select
                      value={feet}
                      onChange={(e) => setFeet(Number(e.target.value))}
                      className="w-full appearance-none bg-surface-container-low border-none rounded-lg py-4 px-4 text-on-surface font-semibold focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    >
                      {[4, 5, 6, 7].map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant w-4 h-4" />
                  </div>
                </div>
                {/* Inches */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                    Inches
                  </label>
                  <div className="relative">
                    <select
                      value={inches}
                      onChange={(e) => setInches(Number(e.target.value))}
                      className="w-full appearance-none bg-surface-container-low border-none rounded-lg py-4 px-4 text-on-surface font-semibold focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant w-4 h-4" />
                  </div>
                </div>
              </div>
            </section>

            {/* Eye condition card */}
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
                      className={`px-6 py-3 rounded-full text-sm font-bold transition-all active:scale-95 ${
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

            {/* Physical conditions card */}
            <section className="bg-surface-container-lowest p-8 rounded-xl shadow-ambient">
              <div className="flex items-center gap-3 mb-6">
                <HeartPulse className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold tracking-tight">Physical Conditions</h2>
              </div>
              <p className="text-sm text-on-surface-variant mb-6 font-medium">
                Select any that apply to help us tailor your safety parameters.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PHYSICAL_CONDITIONS.map(({ id, label }) => {
                  const checked = conditions.includes(id);
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

          {/* Right column */}
          <div className="md:col-span-5">
            <div className="sticky top-28 space-y-6">
              {/* Image */}
              <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-ambient">
                <img
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80"
                  alt="Athlete in a high-tech gym"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                  <p className="text-white font-headline text-lg font-medium leading-tight">
                    "Precision is the difference between movement and performance."
                  </p>
                </div>
              </div>

              {/* Info card */}
              <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                <div className="flex gap-4 items-start">
                  <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-on-primary-container font-bold text-sm mb-1">
                      Why this matters
                    </h4>
                    <p className="text-on-primary-container/80 text-xs leading-relaxed">
                      Your height and physical conditions allow our AI to calculate optimal range
                      of motion and joint load during eccentric movements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

    </div>
  );
}
