# FitDrive AI 🚗

> The right car, built around you.

FitDrive AI is an intelligent car recommendation engine that goes beyond price filters.
It matches drivers to vehicles using a 5-factor scoring algorithm that accounts for:

- **Ergonomic Fit** — headroom, legroom, and shoulder room relative to your height
- **Vision Compatibility** — visibility score adjusted for eye conditions
- **Safety Alignment** — ADAS features weighted by your experience level  
- **Handling Appropriateness** — difficulty score matched to driver capability
- **Budget Efficiency** — smart budget matching with transparent overage flags

## How It Works

1. Enter your physical profile (height, eye conditions)
2. Select your experience level — new drivers get a curated beginner-safe list
3. Experienced drivers take our 6-question Driver Profile Quiz to unlock full range
4. Set your budget — we show cars within range and flag slight overages
5. Our algorithm scores every car in our database (80+ vehicles, 15+ brands)
6. Get a ranked list with FitScore™, detailed breakdowns, and AI-generated personal analysis

## Tech Stack
- React + Vite + Tailwind CSS
- Custom multi-factor scoring algorithm (vanilla JS)
- Claude AI API for personalized narrative analysis
- 80+ car database with ergonomic and safety specifications
- Deployed on Vercel

## Setup
\`\`\`bash
npm install
### Add VITE_CLAUDE_API_KEY=your_key to .env
npm run dev
\`\`\`

### Scoring Algorithm
 
FitDrive AI uses a 5-factor weighted scoring algorithm that runs entirely in the browser:
 
| Factor | Weight | What it measures |
|---|---|---|
| Ergonomic Fit | 30% | Headroom/legroom relative to driver height |
| Visibility | 25% | Car visibility score adjusted for eye conditions |
| Safety | 20% | ADAS features weighted by experience level |
| Handling | 15% | Difficulty score vs driver capability envelope |
| Budget | 10% | Price fit with smart overage tolerance |
 
Hard constraint filters disqualify cars that are fundamentally incompatible (critical headroom deficit, experience level mismatch, severe visibility issue with low-score car).
 
