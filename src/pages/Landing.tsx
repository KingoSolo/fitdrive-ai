import { Sparkles, ArrowRight, Eye, ShieldCheck, PersonStanding } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import cars from '../data/cars.json';
import { rankCarsForDriver, generateProsAndCons } from '../algorithm/scoring.js';

const features = [
  {
    icon: <PersonStanding className="w-5 h-5 text-[#2196F3]" />,
    title: 'Ergonomic Fit',
    description:
      'AI analyzes your posture and spinal alignment to recommend vehicles with the most supportive seat geometry.',
  },
  {
    icon: <Eye className="w-5 h-5 text-[#2196F3]" />,
    title: 'Vision-Aware',
    description:
      'Optimized cockpit layouts that match your line of sight, reducing neck strain and increasing peripheral awareness.',
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-[#2196F3]" />,
    title: 'Safety First',
    description:
      'Predictive safety systems that calibrate to your reaction times, creating a seamless bond between car and driver.',
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-manrope">
      {/* Navigation */}
      <header className="sticky top-0 z-50 h-16 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-6 md:px-8 h-full flex items-center justify-between">
          <span className="font-space-grotesk font-bold text-lg text-[#0F172A]">FitDrive AI</span>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-[#475569] hover:text-[#0F172A] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-[#475569] hover:text-[#0F172A] transition-colors">
              How it Works
            </a>
          </nav>

          <button
            onClick={() => navigate('/onboarding')}
            className="inline-flex items-center gap-2 bg-[#2196F3] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#1976D2] transition-colors"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Hero */}
        <section className="py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Text column */}
          <div className="flex flex-col gap-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 self-start text-[#2196F3]">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Next-Gen Mobility</span>
            </div>

            <h1 className="font-space-grotesk text-5xl md:text-7xl font-bold leading-[1.05] tracking-tighter text-[#0F172A]">
              The right car, built around you.
            </h1>

            <p className="text-[#475569] text-base leading-relaxed max-w-md">
              Experience the first AI-driven ergonomic matching system. We synchronize your
              physical profile with vehicle dynamics for unparalleled comfort.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => navigate('/onboarding')}
                className="inline-flex items-center gap-2 bg-[#2196F3] text-white px-6 py-3.5 rounded-lg font-semibold transition-all duration-200 hover:bg-[#1976D2] hover:shadow-lg hover:-translate-y-0.5"
              >
                Find My Perfect Car
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  const defaultProfile = {
                    heightInches: 68,
                    eyeCondition: 'none',
                    experienceLevel: 'intermediate',
                    budget: 60000,
                    otherConditions: [],
                  };
                  const ranked = rankCarsForDriver(cars, defaultProfile, 60);
                  const results = ranked.map((r: any) => ({
                    ...r,
                    prosAndCons: generateProsAndCons(r, defaultProfile),
                  }));
                  navigate('/results', { state: { profile: defaultProfile, results, exploreMode: true } });
                }}
                className="text-[#2196F3] font-semibold px-4 py-3.5 hover:underline transition-all"
              >
                Explore Fleet
              </button>
            </div>
          </div>

          {/* Image column */}
          <div className="relative">
            {/* Car image */}
            <div className="w-full aspect-[4/3] rounded-2xl bg-[#0F172A] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1200&q=80"
                alt="Luxury car"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Floating Biomechanics card */}
            <div className="absolute -bottom-5 left-6 bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 shadow-lg w-56">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-[#E3F2FD] rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#2196F3]" />
                </div>
                <span className="font-manrope font-bold text-sm text-[#0F172A]">
                  Biomechanics Check
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full mb-1.5">
                <div className="h-full w-[88%] bg-[#2196F3] rounded-full" />
              </div>
              <p className="text-xs text-[#475569]">88% Lumbar Support Match</p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white p-8 rounded-2xl border border-slate-100 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-default"
              >
                <div className="w-11 h-11 bg-[#E3F2FD] rounded-xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="font-manrope text-xl font-bold text-[#0F172A] mb-3">
                  {feature.title}
                </h3>
                <p className="text-base text-[#475569] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
