interface DriverProfile {
  heightInches: number;
  eyeCondition: string;
  experienceLevel: string;
  budget: number;
}

interface Car {
  year: number | string;
  brand: string;
  model: string;
  specs: {
    front_headroom_in: number;
  };
  visibility: {
    score: number;
  };
  handling: {
    difficulty: number;
  };
  price_usd: number;
  safety: Record<string, boolean>;
}

interface ProsAndCons {
  pros: string[];
  cons: string[];
}

interface ClaudeMessageContent {
  text?: string;
}

interface ClaudeResponse {
  content?: ClaudeMessageContent[];
}

export async function generateCarNarrative(
  car: Car,
  driverProfile: DriverProfile,
  prosAndCons: ProsAndCons,
): Promise<string> {
  const { heightInches, eyeCondition, experienceLevel, budget } = driverProfile;
  const heightFt = Math.floor(heightInches / 12);
  const heightIn = heightInches % 12;

  const prompt = `You are FitDrive AI, a car recommendation expert. 
Generate a 3-sentence personalized analysis for this specific driver and car.

Driver Profile:
- Height: ${heightFt}'${heightIn}"
- Eye condition: ${eyeCondition.replace('_', ' ')}
- Driving experience: ${experienceLevel}
- Budget: $${budget.toLocaleString()}

Car: ${car.year} ${car.brand} ${car.model}
- Headroom: ${car.specs.front_headroom_in}"
- Visibility score: ${car.visibility.score}/10
- Handling difficulty: ${car.handling.difficulty}/10
- Price: $${car.price_usd.toLocaleString()}
- Key features: ${Object.entries(car.safety)
    .filter(([, value]) => value === true)
    .map(([key]) => key.replace('has_', '').replace(/_/g, ' '))
    .join(', ')}

Pre-calculated pros: ${prosAndCons.pros.join('; ')}
Pre-calculated cons: ${prosAndCons.cons.join('; ')}

Write 3 concise, conversational sentences explaining why this car is or isn't a great fit for THIS specific driver.
Be specific about their height, eye condition, and experience. Be honest about cons too.
Do not use markdown. Write as if talking to the driver directly.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data: ClaudeResponse = await response.json();
  return data.content?.[0]?.text ?? 'Analysis unavailable.';
}
