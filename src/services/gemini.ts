
export interface NVCChoice {
  type: 'violent' | 'passive' | 'comparison' | 'blackmail' | 'nvc';
  text: string;
  feedback: string;
  resultTitle: string;
  isNVC?: boolean;
}

export interface NVCScenario {
  id: string;
  title: string;
  situation: string;
  trigger: string;
  choices: NVCChoice[];
  nvcAnalysis: {
    observation: string;
    feeling: string;
    need: string;
    request: string;
  };
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Dynamic API endpoint resolver (CORS Bridge for GitHub Pages or static frontend hosts)
function getApiEndpoint(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // When running on GitHub Pages or standalone external frontend
    if (hostname.includes('github.io')) {
      return 'https://ais-pre-pzqtwrdnelptigyerdv3kg-163051268893.asia-northeast1.run.app/api/generate';
    }
  }
  return '/api/generate';
}

export async function generateNVCScenario(input: string, lang: 'zh' | 'en'): Promise<NVCScenario> {
  const endpoint = getApiEndpoint();
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input, lang }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to generate scenario");
  }

  const jsonResponse = await response.json();
  
  if (jsonResponse.choices) {
    jsonResponse.choices.forEach((c: any) => { c.isNVC = (c.type === 'nvc'); });
    jsonResponse.choices = shuffleArray(jsonResponse.choices);
  }
  
  return jsonResponse;
}
