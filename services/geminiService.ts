
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";

export async function* streamChat(
  message: string, 
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  images?: string[]
) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "You are Lumina, a helpful and sophisticated AI assistant. You provide concise, accurate, and insightful answers.",
    }
  });

  const parts: any[] = [{ text: message }];
  if (images && images.length > 0) {
    images.forEach(img => {
      const base64Data = img.split(',')[1];
      const mimeType = img.split(',')[0].split(':')[1].split(';')[0];
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      });
    });
  }

  const result = await chat.sendMessageStream({ 
    message: parts.length > 1 ? parts : message 
  });
  
  for await (const chunk of result) {
    const c = chunk as GenerateContentResponse;
    yield c.text || '';
  }
}

export async function searchInformation(query: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: query,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text || '';
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.map((chunk: any) => chunk.web)
    .filter(Boolean) || [];

  return { text, sources };
}

/**
 * Fetches dashboard data using search grounding for real-time accuracy.
 */
export async function fetchPulseData(lat?: number, lon?: number) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const locationContext = lat && lon ? `near coordinates ${lat}, ${lon}` : "globally";
  
  const prompt = `Provide a real-time status update for:
1. Current Weather and 3-day forecast ${locationContext}.
2. Major festivals, holidays, or cultural events happening today or this week ${locationContext}.
3. Top 3 trending news topics in technology and world events.

Return the data in a clear, structured Markdown format with sections for 'Weather', 'Festivals', and 'Trends'. Use emojis for visuals.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return {
    text: response.text || '',
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web)
      .filter(Boolean) || []
  };
}

export async function generateImage(prompt: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
}
