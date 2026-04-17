import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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

export async function generateNVCScenario(input: string, lang: 'zh' | 'en'): Promise<NVCScenario> {
  const langInstruction = lang === 'zh' 
    ? "Output in Traditional Chinese (繁體中文) for all content." 
    : "Output in English for all content.";

  const prompt = `
    You are an expert in Nonviolent Communication (NVC) based on Marshall B. Rosenberg's principles.
    ${langInstruction}
    
    Task: Generate a specific conflict scenario based on the user's input, and provide 5 distinct types of responses.
    
    **CRITICAL REQUIREMENT FOR NVC CHOICE**:
    The "NVC" choice MUST be a complete sentence that explicitly includes ALL four components:
    1. Observation (Fact without judgment)
    2. Feeling (Emotion, not thought)
    3. Need (Universal value/longing)
    4. Request (Specific, doable action)
    The text of the NVC choice must MATCH the "nvcAnalysis" fields exactly.

    **GENERATE 5 TYPES OF RESPONSES**:
    1. **Violent/Jackal (暴力/指責)**: Judging, blaming, or attacking the other person.
    2. **Passive/Turtle (被動/退縮)**: Denying own needs, self-blaming, or avoiding conflict.
    3. **Comparison (比較)**: Comparing the person negatively to others.
    4. **Emotional Blackmail (情緒勒索)**: Using guilt, fear, or obligation.
    5. **NVC/Giraffe (非暴力溝通)**: Strictly OFNR format. Compassionate and clear.

    User Input Conflict: "${input}"

    **JSON OUTPUT FORMAT**:
    Return strict JSON.
    {
      "id": "ai-gen",
      "title": "Short Topic Title (Max 10 chars)",
      "situation": "Context of what happened (approx 100 chars)",
      "trigger": "The specific trigger event/words",
      "choices": [
        { "type": "violent", "text": "...", "feedback": "Analysis of why this is violent", "resultTitle": "Disconnected" },
        { "type": "passive", "text": "...", "feedback": "Analysis of why this is passive", "resultTitle": "Suppressed" },
        { "type": "comparison", "text": "...", "feedback": "Analysis of comparison language", "resultTitle": "Resentment" },
        { "type": "blackmail", "text": "...", "feedback": "Analysis of emotional manipulation", "resultTitle": "Guilt & Fear" },
        { "type": "nvc", "text": "...", "feedback": "Analysis of OFNR components", "resultTitle": "Connection" }
      ],
      "nvcAnalysis": {
        "observation": "...", "feeling": "...", "need": "...", "request": "..."
      }
    }
  `;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7
      }
    });

    const text = response.text.trim();
    const jsonResponse = JSON.parse(text);
    
    if (jsonResponse.choices) {
      jsonResponse.choices.forEach((c: any) => { c.isNVC = (c.type === 'nvc'); });
      jsonResponse.choices = shuffleArray(jsonResponse.choices);
    }
    
    return jsonResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate scenario");
  }
}
