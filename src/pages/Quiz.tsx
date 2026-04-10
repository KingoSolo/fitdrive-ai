import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Car, Bell, Settings } from 'lucide-react';
import { DRIVER_QUIZ_QUESTIONS, scoreDriverQuiz, type QuizOption } from '../algorithm/scoring.js';

export default function Quiz() {
  const navigate = useNavigate();
  const location = useLocation();
  const { formData, name } = (location.state ?? {}) as {
    formData?: { feet: number; inches: number; eyeCondition: string; otherConditions: string[] };
    name?: string;
  };

  if (!formData) {
    navigate('/onboarding');
    return null;
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questions = DRIVER_QUIZ_QUESTIONS;
  const total = questions.length;
  const question = questions[currentIndex]!;
  const questionNumber = currentIndex + 1;
  const progress = (questionNumber / total) * 100;
  const selected = answers[question.id];

  function selectOption(optionId: string) {
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
  }

  function goNext() {
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
      return;
    }
    // Finished all questions — pass result back to Onboarding step 3 (budget)
    const quizResult = scoreDriverQuiz(answers);
    navigate('/onboarding', { state: { returnStep: 3, formData, quizResult, name } });
  }

  function goBack() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    } else {
      // Back to step 2 of onboarding, restoring form data
      navigate('/onboarding', { state: { returnStep: 2, formData, name } });
    }
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col font-body">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl fixed top-0 w-full z-50 shadow-sm">
        <div className="flex justify-between items-center px-6 py-4 max-w-full">
          <div className="flex items-center gap-3">
            <Car className="w-7 h-7 text-primary" />
            <span className="text-2xl font-bold text-slate-900 font-headline tracking-tight">FitDrive AI</span>
          </div>
          <div className="flex gap-2 items-center">
            <button className="p-2 hover:bg-slate-100/50 transition-colors rounded-full active:scale-95 text-on-surface-variant">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-slate-100/50 transition-colors rounded-full active:scale-95 text-on-surface-variant">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-24 pb-32 px-6 flex flex-col items-center max-w-2xl mx-auto w-full">
        {/* Progress section */}
        <div className="w-full mb-12">
          <div className="flex justify-between items-end mb-4">
            <div className="space-y-1">
              <span className="text-primary font-headline font-bold text-sm tracking-widest uppercase">
                Question {String(questionNumber).padStart(2, '0')} of {String(total).padStart(2, '0')}
              </span>
              <h2 className="text-slate-900 font-headline text-3xl font-extrabold leading-tight">
                Driver Assessment
              </h2>
            </div>
            <div className="text-on-surface-variant font-medium text-lg">
              {Math.round(progress)}%
            </div>
          </div>
          <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(135deg, #0061a4 0%, #2196f3 100%)',
              }}
            />
          </div>
        </div>

        {/* Question */}
        <section className="w-full space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-headline font-bold text-on-surface tracking-tight leading-[1.15]">
              {question.question}
            </h1>
          </div>

          {/* Answer cards */}
          <div className="space-y-4 w-full">
            {question.options.map((option: QuizOption) => {
              const isSelected = selected === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => selectOption(option.id)}
                  className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-300 active:scale-[0.98] ${
                    isSelected
                      ? 'bg-surface-container-lowest border-primary shadow-lg shadow-primary/10 ring-4 ring-primary/5'
                      : 'bg-surface-container-lowest border-transparent hover:bg-surface-bright hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm transition-colors ${
                      isSelected ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant'
                    }`}>
                      {option.id.toUpperCase()}
                    </div>
                    <div className="flex-grow">
                      <h3 className={`font-headline font-bold text-lg ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                        {option.text}
                      </h3>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected ? 'border-primary bg-primary' : 'border-outline-variant'
                    }`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Info card */}
        <div className="mt-12 w-full p-6 rounded-3xl bg-[#e8f0fe] flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-[#c2d4f8]">
            <img
              src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=200&q=80"
              alt="Car on road"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-1">
            <h4 className="font-headline font-bold text-lg text-[#1a237e]">Fine-tuning your results</h4>
            <p className="text-sm text-[#3949ab] leading-relaxed opacity-90">
              Each answer helps us understand your real-world driving style — not just what you think you prefer.
            </p>
          </div>
        </div>
      </main>

      {/* Fixed bottom action bar */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-white/80 backdrop-blur-lg shadow-ambient flex justify-between items-center z-50 border-t border-slate-100">
        <button
          onClick={goBack}
          className="px-8 py-4 text-primary font-bold hover:bg-primary/5 transition-colors rounded-xl active:scale-95"
        >
          Back
        </button>
        <button
          onClick={goNext}
          disabled={!selected}
          className="px-10 py-4 text-white font-headline font-bold rounded-xl active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #0061a4 0%, #2196f3 100%)' }}
        >
          {currentIndex === total - 1 ? 'See My Cars →' : 'Next Question'}
        </button>
      </div>
    </div>
  );
}
