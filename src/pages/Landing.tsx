import { Sparkles, ArrowRight, Eye, ShieldCheck, PersonStanding, ClipboardList, BarChart3, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import cars from '../data/cars.json';
import { rankCarsForDriver, generateProsAndCons } from '../algorithm/scoring';

const features = [
  {
    icon: <PersonStanding className="w-5 h-5 text-[#2196F3]" />,
    title: 'Ergonomic Fit',
    description:
      'We analyse your height, posture, and body proportions to identify vehicles with seat geometry that genuinely supports you.',
  },
  {
    icon: <Eye className="w-5 h-5 text-[#2196F3]" />,
    title: 'Vision-Aware',
    description:
      'Every eye condition is accounted for — from glasses to peripheral vision loss — ensuring you get cockpit layouts that work with your sight.',
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-[#2196F3]" />,
    title: 'Safety First',
    description:
      'We match your experience level and physical profile to vehicles with the right combination of active safety systems for your needs.',
  },
];

const steps = [
  {
    number: '01',
    icon: <ClipboardList className="w-6 h-6 text-[#2196F3]" />,
    title: 'Build Your Profile',
    description: 'Tell us your height, any eye conditions, and whether you have any physical considerations. Takes under 2 minutes.',
  },
  {
    number: '02',
    icon: <BarChart3 className="w-6 h-6 text-[#2196F3]" />,
    title: 'Take the Driver Quiz',
    description: 'Answer a short set of questions about your driving style and experience level so we can calibrate our recommendations.',
  },
  {
    number: '03',
    icon: <Car className="w-6 h-6 text-[#2196F3]" />,
    title: 'Get Your Matches',
    description: 'Receive a personalised ranked list of vehicles with FitScores, detailed pros and cons, and full spec breakdowns.',
  },
];

const stats = [
  { value: '60+', label: 'Vehicles Analysed' },
  { value: '6',   label: 'Car Categories' },
  { value: '30+', label: 'Matching Rules' },
  { value: '100%', label: 'Free to Use' },
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
            <div className="inline-flex items-center gap-2 self-start text-[#2196F3]">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Next-Gen Mobility</span>
            </div>

            <h1 className="font-space-grotesk text-5xl md:text-7xl font-bold leading-[1.05] tracking-tighter text-[#0F172A]">
              The right car, built around you.
            </h1>

            <p className="text-[#475569] text-base leading-relaxed max-w-md">
              FitDrive AI matches your physical profile, vision, and driving experience to the
              vehicles that genuinely suit you — not just the ones that look good on paper.
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
            <div className="w-full aspect-[4/3] rounded-2xl bg-[#0F172A] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1200&q=80"
                alt="Luxury car interior"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Floating card */}
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

        {/* Stats bar */}
        <section className="mt-12 mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ value, label }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
              <p className="font-space-grotesk text-3xl font-bold text-[#0F172A] mb-1">{value}</p>
              <p className="text-sm text-[#475569] font-medium">{label}</p>
            </div>
          ))}
        </section>

        {/* Features */}
        <section id="features" className="py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-[#2196F3] mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">What Sets Us Apart</span>
            </div>
            <h2 className="font-space-grotesk text-4xl md:text-5xl font-bold text-[#0F172A] tracking-tight">
              Matching that goes deeper.
            </h2>
            <p className="text-[#475569] mt-4 max-w-xl mx-auto leading-relaxed">
              Most car finders compare specs. We compare you — your body, your vision, your
              experience — to find vehicles that truly fit.
            </p>
          </div>

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

        {/* How it Works */}
        <section id="how-it-works" className="py-20 border-t border-slate-100">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-[#2196F3] mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">The Process</span>
            </div>
            <h2 className="font-space-grotesk text-4xl md:text-5xl font-bold text-[#0F172A] tracking-tight">
              Three steps to your fit.
            </h2>
            <p className="text-[#475569] mt-4 max-w-xl mx-auto leading-relaxed">
              No account needed, no lengthy forms. Just a quick profile and you'll have
              personalised results in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-[#E2E8F0] z-0" />

            {steps.map((step) => (
              <div key={step.number} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white border-2 border-[#E3F2FD] rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  {step.icon}
                </div>
                <span className="text-xs font-black text-[#2196F3] tracking-widest uppercase mb-2">
                  Step {step.number}
                </span>
                <h3 className="font-space-grotesk text-xl font-bold text-[#0F172A] mb-3">
                  {step.title}
                </h3>
                <p className="text-[#475569] text-sm leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-16 mb-12">
          <div
            className="rounded-3xl px-8 py-16 text-center text-white"
            style={{ background: 'linear-gradient(135deg, #0061a4 0%, #2196f3 100%)' }}
          >
            <h2 className="font-space-grotesk text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Ready to find your fit?
            </h2>
            <p className="text-white/80 text-base max-w-md mx-auto mb-8 leading-relaxed">
              Join thousands of drivers who found their perfect match through data-driven
              ergonomic analysis.
            </p>
            <button
              onClick={() => navigate('/onboarding')}
              className="inline-flex items-center gap-2 bg-white text-[#0061a4] px-8 py-4 rounded-xl font-bold text-base hover:bg-white/90 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              Get Started — It's Free <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-space-grotesk font-bold text-[#0F172A]">FitDrive AI</span>
          <p className="text-sm text-[#475569]">Ergonomic car matching for every driver.</p>
        </div>
      </footer>
    </div>
  );
}
