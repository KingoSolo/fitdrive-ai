import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Bell, Settings, Search, ArrowRight,
  SlidersHorizontal, Home, Car, Bookmark, User, Heart,
  DollarSign, ClipboardList, X, TrendingUp,
} from 'lucide-react';
import { getCarImage } from '../utils/carImages';

type Category = 'all' | 'sedan' | 'suv' | 'hatchback' | 'sports' | 'truck';
type SortBy = 'score' | 'price' | 'safety';
type ActiveView = 'explore' | 'inventory' | 'garage';

const EYE_LABEL_MAP: Record<string, string> = {
  none:             'No Eye Condition',
  glasses:          'Glasses',
  contacts:         'Contacts',
  low_vision:       'Low Vision',
  night_blindness:  'Night Blindness',
  peripheral_loss:  'Peripheral Vision Loss',
  depth_perception: 'Depth Perception',
};

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'all',      label: 'All' },
  { id: 'sedan',    label: 'Sedan' },
  { id: 'suv',      label: 'SUV' },
  { id: 'hatchback',label: 'Hatchback' },
  { id: 'sports',   label: 'Sports' },
  { id: 'truck',    label: 'Truck' },
];

export default function Results() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { profile, results, quizResult, name, exploreMode } =
    (location.state ?? {}) as {
      profile: any;
      results: any[];
      quizResult?: any;
      name?: string;
      exploreMode?: boolean;
    };

  if (!profile || !results) {
    navigate('/onboarding');
    return null;
  }

  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [sortBy, setSortBy] = useState<SortBy>('score');
  const [activeView, setActiveView] = useState<ActiveView>('explore');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showCompare, setShowCompare] = useState(false);

  // Height display
  const heightFt  = Math.floor(profile.heightInches / 12);
  const heightIn  = profile.heightInches % 12;

  function toggleSave(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function budgetBadge(price: number) {
    if (price <= profile.budget) {
      return { label: 'Within Budget', className: 'bg-emerald-100 text-emerald-800' };
    }
    if (price <= profile.budget * 1.2) {
      return { label: 'Slightly Over', className: 'bg-amber-100 text-amber-800' };
    }
    return { label: 'Over Budget', className: 'bg-red-100 text-red-800' };
  }

  // Explore: category + sort filter
  const exploreFiltered = (() => {
    let list = activeCategory === 'all'
      ? [...results]
      : results.filter((r: any) => r.car.category === activeCategory);
    if (sortBy === 'score') list.sort((a: any, b: any) => b.totalScore - a.totalScore);
    else if (sortBy === 'price') list.sort((a: any, b: any) => a.car.price_usd - b.car.price_usd);
    else list.sort((a: any, b: any) => b.breakdown.safety - a.breakdown.safety);
    return list;
  })();

  // Inventory: all cars sorted cheapest first
  const inventoryList = [...results].sort((a: any, b: any) => a.car.price_usd - b.car.price_usd);

  // Garage: saved cars
  const garageList = results.filter((r: any) => savedIds.has(r.car.id));

  // Top 3 for compare (always by score)
  const top3 = [...results]
    .sort((a: any, b: any) => b.totalScore - a.totalScore)
    .slice(0, 3);

  const filtered = activeView === 'inventory'
    ? inventoryList
    : activeView === 'garage'
    ? garageList
    : exploreFiltered;

  const pageTitle = activeView === 'garage'
    ? 'Your Garage'
    : activeView === 'inventory'
    ? 'Full Inventory'
    : exploreMode
    ? 'Explore Our Fleet'
    : name
    ? `Results for ${name}'s Profile`
    : 'Your Top Matches';

  const navLinks: { id: ActiveView; label: string }[] = [
    { id: 'explore',   label: 'Explore' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'garage',    label: 'Garage' },
  ];

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-8">
          <span className="text-2xl font-bold text-slate-900 font-headline tracking-tight">FitDrive AI</span>
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveView(id)}
                className={`py-1 text-sm font-semibold transition-colors ${
                  activeView === id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex bg-surface-container px-4 py-2 rounded-full items-center gap-2">
            <Search className="w-4 h-4 text-on-surface-variant" />
            <input className="bg-transparent border-none focus:outline-none text-sm w-40" placeholder="Search cars..." />
          </div>
          <button className="p-2 rounded-full hover:bg-slate-100/50 transition-colors text-on-surface-variant">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-slate-100/50 transition-colors text-on-surface-variant">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
        {/* Quiz result banner */}
        {quizResult && activeView === 'explore' && (
          <div
            className="mb-6 px-5 py-3 rounded-xl text-white text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #0061a4 0%, #2196f3 100%)' }}
          >
            Quiz Result: <strong>{quizResult.profile}</strong> &nbsp;·&nbsp; Score: {quizResult.score}
          </div>
        )}

        {/* Header */}
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-on-surface mb-4 font-headline">
                {pageTitle}
              </h1>

              {/* Subheading per view */}
              {activeView === 'inventory' && (
                <p className="text-on-surface-variant text-sm mb-4">
                  All {results.length} vehicles · sorted by price (lowest first)
                </p>
              )}
              {activeView === 'garage' && (
                <p className="text-on-surface-variant text-sm mb-4">
                  {savedIds.size} saved {savedIds.size === 1 ? 'car' : 'cars'}
                </p>
              )}

              {/* Profile pills — explore only */}
              {activeView === 'explore' && (
                exploreMode ? (
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 text-xs font-medium bg-surface-container-low text-on-surface-variant rounded-full">
                      Browsing all cars — results not personalised
                    </span>
                    <button
                      onClick={() => navigate('/onboarding')}
                      className="px-3 py-1 text-xs font-bold bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
                    >
                      Get My Personal Matches →
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 text-xs font-bold bg-primary/10 text-primary rounded-full">
                      {heightFt}'{heightIn}"
                    </span>
                    <span className="px-3 py-1 text-xs font-bold bg-primary/10 text-primary rounded-full">
                      {EYE_LABEL_MAP[profile.eyeCondition] ?? profile.eyeCondition}
                    </span>
                    <span className="px-3 py-1 text-xs font-bold bg-primary/10 text-primary rounded-full capitalize">
                      {profile.experienceLevel}
                    </span>
                    <span className="px-3 py-1 text-xs font-bold bg-primary/10 text-primary rounded-full">
                      ${profile.budget.toLocaleString()}
                    </span>
                    <button
                      onClick={() => navigate('/onboarding')}
                      className="px-3 py-1 text-xs font-bold bg-surface-container-low text-on-surface-variant rounded-full hover:text-primary transition-colors"
                    >
                      Edit Profile
                    </button>
                  </div>
                )
              )}

              <p className="text-sm text-on-surface-variant font-medium">
                {exploreMode
                  ? `${results.length} vehicles · showing ${filtered.length}`
                  : `${results.length} cars analysed · showing ${filtered.length}`}
              </p>
            </div>

            {/* Filters — explore only */}
            {activeView === 'explore' && (
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex gap-1 bg-surface-container-low rounded-xl p-1">
                  {(['score', 'price', 'safety'] as SortBy[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSortBy(s)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                        sortBy === s ? 'text-white shadow' : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                      style={sortBy === s ? { background: 'linear-gradient(135deg, #0061a4 0%, #2196f3 100%)' } : {}}
                    >
                      {s === 'score' ? 'Best Match' : s === 'price' ? 'Price ↑' : 'Safety'}
                    </button>
                  ))}
                </div>
                <button className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold flex items-center gap-2 shadow-md">
                  <SlidersHorizontal className="w-4 h-4" /> Filters
                </button>
              </div>
            )}
          </div>

          {/* Category chips — explore only */}
          {activeView === 'explore' && (
            <div className="flex gap-2 mt-6 overflow-x-auto pb-1">
              {CATEGORIES.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveCategory(id)}
                  className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    activeCategory === id
                      ? 'text-white shadow-md'
                      : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/20 hover:bg-surface-container-low'
                  }`}
                  style={activeCategory === id ? { background: 'linear-gradient(135deg, #0061a4 0%, #2196f3 100%)' } : {}}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </header>

        {/* Garage empty state */}
        {activeView === 'garage' && garageList.length === 0 ? (
          <div className="w-full max-w-md mx-auto text-center py-24 space-y-4">
            <div className="w-20 h-20 mx-auto bg-surface-container-low rounded-full flex items-center justify-center">
              <Bookmark className="w-10 h-10 text-on-surface-variant" />
            </div>
            <h2 className="text-2xl font-bold font-headline text-on-surface">Your garage is empty</h2>
            <p className="text-on-surface-variant text-sm">
              Heart any car from Explore or Inventory to save it here for easy comparison later.
            </p>
            <button
              onClick={() => setActiveView('explore')}
              className="mt-4 px-6 py-3 text-white font-bold rounded-xl"
              style={{ background: 'linear-gradient(135deg, #0061a4 0%, #2196f3 100%)' }}
            >
              Browse Cars
            </button>
          </div>
        ) : filtered.length === 0 ? (
          /* Explore empty state */
          <div className="w-full max-w-2xl mx-auto text-center space-y-8 py-12">
            <div className="relative inline-block">
              <div className="absolute -inset-4 bg-primary/5 rounded-[3rem] -rotate-3" />
              <div className="relative bg-surface-container-lowest p-12 rounded-[2.5rem] shadow-ambient">
                <div className="w-48 h-48 mx-auto">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXZ-vfyqOaIYLynx2-UF7F5ILi0kSfO4nLnUgsvYT44LG4Ztyal6ZTL8DLk2Ud81M4eP0EC0ke5hDUOqO2V2WkRMXvIX34593Hjle7i6JK4fD6qrHGuGLem1lKNuGa8yVEdt8KjkciyRRADi7ZE8fI52rmzbGUPnhlE8r9FFXxJEJjRCI_XyzPKlp3AwQlgkbxMcu_wo1pTRhyeG_cYB0iNPExmgn9NcU3UkeMFuoD4Ks3Nvcy9OKCdoMz6CbsaLCDRb98mF_Vdfeh"
                    alt="No results"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-on-surface">
                No perfect matches found
              </h1>
              <p className="text-lg text-on-surface-variant max-w-md mx-auto leading-relaxed">
                {activeCategory !== 'all'
                  ? `No ${activeCategory} cars match your profile. Try a different category or adjust your preferences.`
                  : "We couldn't find a vehicle that fits all your current criteria. Try adjusting your preferences to see more results."}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <button
                onClick={() => navigate('/onboarding')}
                className="group flex flex-col items-start p-6 bg-surface-container-lowest rounded-xl text-left transition-all duration-300 hover:shadow-ambient active:scale-95"
              >
                <div className="p-3 bg-primary/10 text-primary rounded-lg mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <DollarSign className="w-6 h-6" />
                </div>
                <span className="font-headline font-bold text-lg text-on-surface">Adjust Budget</span>
                <p className="text-sm text-on-surface-variant mt-1">Slightly increasing your limit can unlock 12+ new options.</p>
              </button>
              <button
                onClick={() => navigate('/onboarding')}
                className="group flex flex-col items-start p-6 bg-surface-container-lowest rounded-xl text-left transition-all duration-300 hover:shadow-ambient active:scale-95"
              >
                <div className="p-3 bg-amber-100 text-amber-700 rounded-lg mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <span className="font-headline font-bold text-lg text-on-surface">Retake Quiz</span>
                <p className="text-sm text-on-surface-variant mt-1">Update your profile for a fresh set of AI recommendations.</p>
              </button>
              <button
                onClick={() => { setActiveCategory('all'); setSortBy('score'); }}
                className="group flex flex-col items-start p-6 bg-surface-container-lowest rounded-xl text-left transition-all duration-300 hover:shadow-ambient active:scale-95"
              >
                <div className="p-3 bg-secondary/10 text-secondary rounded-lg mb-4 group-hover:bg-secondary group-hover:text-white transition-colors">
                  <SlidersHorizontal className="w-6 h-6" />
                </div>
                <span className="font-headline font-bold text-lg text-on-surface">Change Filters</span>
                <p className="text-sm text-on-surface-variant mt-1">Broaden your search by removing category or sort filters.</p>
              </button>
            </div>
            <div className="pt-4">
              <button
                onClick={() => navigate('/onboarding')}
                className="px-8 py-4 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all active:scale-95 font-label"
                style={{ background: 'linear-gradient(135deg, #0061a4 0%, #2196f3 100%)' }}
              >
                Start Over
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((result: any, index: number) => {
              const { car, totalScore, breakdown, prosAndCons } = result;
              const badge = budgetBadge(car.price_usd);
              const isBestMatch = !exploreMode && activeView === 'explore' && index === 0;
              const isSaved = savedIds.has(car.id);
              return (
                <div
                  key={car.id}
                  className="bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-ambient flex flex-col group border border-transparent hover:border-primary/10 transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/car/${car.id}`, { state: { result, profile } })}
                >
                  {isBestMatch && (
                    <div
                      className="text-white text-xs font-black uppercase tracking-wider text-center py-2"
                      style={{ background: 'linear-gradient(135deg, #0061a4 0%, #2196f3 100%)' }}
                    >
                      Best Match 🏆
                    </div>
                  )}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={getCarImage(car.brand, 600)}
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div
                      className="absolute top-4 left-4 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #0061a4 0%, #2196f3 100%)' }}
                    >
                      FitScore {totalScore}
                    </div>
                    <button
                      onClick={(e) => toggleSave(car.id, e)}
                      className={`absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-colors ${
                        isSaved
                          ? 'bg-primary text-white'
                          : 'bg-white/20 text-white hover:bg-white/40'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isSaved ? 'fill-white' : ''}`} />
                    </button>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-xs font-bold text-primary tracking-widest uppercase mb-1 capitalize">
                          {car.category}
                        </p>
                        <h3 className="text-xl font-bold text-on-surface font-headline leading-tight">
                          {car.year} {car.brand} {car.model}
                        </h3>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <p className="text-lg font-extrabold text-on-surface">
                          ${car.price_usd.toLocaleString()}
                        </p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge.className}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { label: 'Ergonomic', val: breakdown.ergonomic },
                        { label: 'Visibility', val: breakdown.visibility },
                        { label: 'Safety',     val: breakdown.safety },
                      ].map(({ label, val }) => (
                        <div key={label} className="bg-surface-container-low rounded-lg p-2 text-center">
                          <div className="text-lg font-black text-on-surface">{val}</div>
                          <div className="text-[10px] text-on-surface-variant font-medium">{label}</div>
                        </div>
                      ))}
                    </div>
                    {prosAndCons?.pros?.length > 0 && (
                      <div className="mb-4 space-y-1">
                        {prosAndCons.pros.slice(0, 2).map((pro: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-emerald-700">
                            <span className="mt-0.5 flex-shrink-0">✓</span>
                            <span>{pro}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      className="mt-auto w-full py-3 rounded-xl text-sm font-bold text-primary border-2 border-primary/20 hover:bg-primary/5 transition-colors active:scale-95 flex items-center justify-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/car/${car.id}`, { state: { result, profile } });
                      }}
                    >
                      View Details <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-white/80 backdrop-blur-lg z-50 rounded-t-3xl border-t border-slate-100">
        {[
          { icon: <Car className="w-5 h-5" />,      label: 'Explore',   view: 'explore'    as ActiveView },
          { icon: <Home className="w-5 h-5" />,     label: 'Inventory', view: 'inventory'  as ActiveView },
          { icon: <Bookmark className="w-5 h-5" />, label: 'Garage',    view: 'garage'     as ActiveView },
          { icon: <User className="w-5 h-5" />,     label: 'Profile',   view: null },
        ].map(({ icon, label, view }) => (
          <button
            key={label}
            onClick={() => view && setActiveView(view)}
            className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${
              activeView === view ? 'text-blue-600 bg-blue-50' : 'text-slate-400'
            }`}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Compare Top 3 — results mode only */}
      {!exploreMode && (
        <button
          onClick={() => setShowCompare(true)}
          className="fixed bottom-10 right-10 z-40 hidden md:flex items-center gap-3 text-white px-6 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #0061a4 0%, #2196f3 100%)' }}
        >
          <TrendingUp className="w-5 h-5" />
          Compare Top 3
        </button>
      )}

      {/* Compare modal */}
      {showCompare && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowCompare(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between px-8 py-5 rounded-t-3xl text-white"
              style={{ background: 'linear-gradient(135deg, #0061a4 0%, #2196f3 100%)' }}
            >
              <div>
                <h2 className="text-2xl font-bold font-headline">Top 3 Comparison</h2>
                <p className="text-white/80 text-sm mt-0.5">Your highest-scoring matches, side by side</p>
              </div>
              <button
                onClick={() => setShowCompare(false)}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
              {/* Car headers */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {top3.map((r: any, i: number) => (
                  <div key={r.car.id} className="text-center">
                    <div className="relative h-32 rounded-2xl overflow-hidden mb-3">
                      <img
                        src={getCarImage(r.car.brand, 600)}
                        alt={r.car.brand}
                        className="w-full h-full object-cover"
                      />
                      {i === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                          <span className="text-2xl">🏆</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-0.5 capitalize">{r.car.category}</p>
                    <h3 className="font-bold text-on-surface font-headline text-sm leading-tight">
                      {r.car.year} {r.car.brand} {r.car.model}
                    </h3>
                  </div>
                ))}
              </div>

              {/* Metrics table */}
              {[
                { label: 'FitScore', key: (r: any) => r.totalScore, highlight: true },
                { label: 'Price', key: (r: any) => `$${r.car.price_usd.toLocaleString()}` },
                { label: 'Ergonomic', key: (r: any) => r.breakdown.ergonomic },
                { label: 'Visibility', key: (r: any) => r.breakdown.visibility },
                { label: 'Safety', key: (r: any) => r.breakdown.safety },
                { label: 'Budget Fit', key: (r: any) => budgetBadge(r.car.price_usd).label },
              ].map(({ label, key, highlight }) => {
                const vals = top3.map(key);
                const max = typeof vals[0] === 'number' ? Math.max(...(vals as number[])) : null;
                return (
                  <div key={label} className="grid grid-cols-4 gap-4 py-3 border-b border-slate-100 last:border-0 items-center">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{label}</span>
                    {top3.map((r: any, i: number) => {
                      const val = key(r);
                      const isTop = max !== null && val === max;
                      return (
                        <div
                          key={i}
                          className={`text-center text-sm font-bold rounded-lg py-2 ${
                            highlight && isTop
                              ? 'text-white'
                              : 'text-on-surface'
                          }`}
                          style={highlight && isTop ? { background: 'linear-gradient(135deg, #0061a4 0%, #2196f3 100%)' } : {}}
                        >
                          {String(val)}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Action buttons */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                {top3.map((r: any) => (
                  <button
                    key={r.car.id}
                    onClick={() => {
                      setShowCompare(false);
                      navigate(`/car/${r.car.id}`, { state: { result: r, profile } });
                    }}
                    className="py-2.5 rounded-xl text-sm font-bold text-primary border-2 border-primary/20 hover:bg-primary/5 transition-colors"
                  >
                    View Details
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
