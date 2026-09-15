
import { GoogleGenAI } from "@google/genai";

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
  _modelUsed?: string;
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

const CLIENT_MODEL_CHAIN = [
  "gemini-3.8-flash",      // 主力旗艦 (深度推理)
  "gemini-3.1-flash-lite", // 輕量降級 (高吞吐、低延遲)
  "gemini-2.5-flash",      // 標準備援
  "gemini-2.5-flash-lite", // 極限低延遲備援
  "gemini-2.0-flash",      // 穩健相容備援
  "gemini-1.5-flash"       // 最終兜底
];

function buildPrompt(input: string, lang: 'zh' | 'en'): string {
  const langInstruction = lang === 'zh' 
    ? "Output in Traditional Chinese (繁體中文) for all content." 
    : "Output in English for all content.";

  return `
    You are an expert in Nonviolent Communication (NVC) based on Marshall B. Rosenberg's principles.
    ${langInstruction}
    
    Task: Generate a specific conflict scenario based on the user's input, and provide 5 distinct types of responses.
    
    **CRITICAL CONTEXT CONSISTENCY**:
    The "choices" MUST be strictly derived from the "situation" and "trigger". 
    DO NOT mention unrelated topics (e.g., if the situation is about money, DO NOT mention grades; if the situation is about work, DO NOT mention health).
    Each choice must feel like a direct response to the "trigger" words.

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
}

// Client-side fallback generator for static hosting (GitHub Pages)
async function generateClientSideWithFallback(
  input: string, 
  lang: 'zh' | 'en', 
  apiKey: string, 
  modelIndex = 0
): Promise<NVCScenario> {
  if (modelIndex >= CLIENT_MODEL_CHAIN.length) {
    throw new Error(lang === 'zh' ? "所有 Gemini 備援模型皆呼叫失敗，請稍後再試。" : "All Gemini fallback models exhausted.");
  }

  const modelName = CLIENT_MODEL_CHAIN[modelIndex];
  const ai = new GoogleGenAI({ apiKey });
  const prompt = buildPrompt(input, lang);

  try {
    console.log(`[Client AI Router] Attempting model: ${modelName} (${modelIndex + 1}/${CLIENT_MODEL_CHAIN.length})`);
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7
      }
    });

    const rawText = response.text?.trim() || "{}";
    const cleanedText = rawText.replace(/^```json\n?|\n?```$/g, '').trim();
    const parsed = JSON.parse(cleanedText);

    if (parsed.choices) {
      parsed.choices.forEach((c: any) => { c.isNVC = (c.type === 'nvc'); });
      parsed.choices = shuffleArray(parsed.choices);
    }

    parsed._modelUsed = modelName;
    console.log(`[Client AI Router] Successfully generated with: ${modelName}`);
    return parsed;
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    console.warn(`[Client AI Router] Model ${modelName} failed (${errorMsg}). Degrading to next model...`);

    if (modelIndex + 1 < CLIENT_MODEL_CHAIN.length) {
      return generateClientSideWithFallback(input, lang, apiKey, modelIndex + 1);
    }
    throw new Error(errorMsg);
  }
}

export async function generateNVCScenario(input: string, lang: 'zh' | 'en'): Promise<NVCScenario> {
  const isStaticHost = typeof window !== 'undefined' && (
    window.location.hostname.includes('github.io') ||
    window.location.protocol === 'file:'
  );

  const clientApiKey = typeof process !== 'undefined' ? (process.env.GEMINI_API_KEY || '') : '';

  // On GitHub Pages or static hosts, execute directly on client with 4-tier model fallback
  if (isStaticHost) {
    if (!clientApiKey || clientApiKey.trim() === '') {
      throw new Error(
        lang === 'zh'
          ? "偵測到您正在 GitHub Pages 靜態網站運行。請確認您的 GitHub 倉庫已在 Settings > Secrets and variables > Actions 中設定 GEMINI_API_KEY，以供自動構建時注入。"
          : "Running on GitHub Pages. Please configure GEMINI_API_KEY in your GitHub Repository Secrets."
      );
    }
    return generateClientSideWithFallback(input, lang, clientApiKey);
  }

  // In AI Studio preview or full-stack environments, attempt server API route first
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input, lang }),
    });

    if (response.ok) {
      const jsonResponse = await response.json();
      if (jsonResponse.choices) {
        jsonResponse.choices.forEach((c: any) => { c.isNVC = (c.type === 'nvc'); });
        jsonResponse.choices = shuffleArray(jsonResponse.choices);
      }
      return jsonResponse;
    }

    // If server responded with error, check if client fallback is possible
    const errorText = await response.text();
    let parsedError = "API error";
    try {
      const errorJson = JSON.parse(errorText);
      parsedError = errorJson.error || errorText;
    } catch {
      parsedError = `HTTP ${response.status}: ${errorText.slice(0, 100)}`;
    }

    if (clientApiKey) {
      console.warn("Server API failed, falling back to client-side Gemini execution:", parsedError);
      return generateClientSideWithFallback(input, lang, clientApiKey);
    }

    throw new Error(parsedError);
  } catch (networkError: any) {
    // If fetch failed completely (e.g. offline, 404 static server) and client API key is available
    if (clientApiKey) {
      console.warn("Network fetch failed, attempting client-side Gemini execution:", networkError);
      return generateClientSideWithFallback(input, lang, clientApiKey);
    }
    throw networkError;
  }
}
