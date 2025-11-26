import { GoogleGenAI, Type } from "@google/genai";
import { InventoryItem, Job, Prediction } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const predictInventoryNeeds = async (
  inventory: InventoryItem[],
  jobs: Job[]
): Promise<Prediction[]> => {
  
  if (inventory.length === 0) return [];

  const prompt = `
    You are an AI inventory manager for a commercial cleaning business in Kenya.
    Your goal is to prevent 'pilferage' (theft) and ensure supplies don't run out.
    
    Current Stock:
    ${JSON.stringify(inventory.map(i => ({ id: i.id, name: i.name, qty: i.quantity, unit: i.unit, min: i.minThreshold })))}

    Upcoming Jobs Schedule (Next 7 days):
    ${JSON.stringify(jobs.map(j => ({ type: j.type, date: j.date })))}

    Task:
    Analyze usage.
    1. Calculate when items will run out.
    2. If an item has VERY low stock but few upcoming jobs, mark it as "Critical" and mention "Suspicious usage detected" or "Potential waste" in the recommendation.
    
    Return a JSON array of predictions.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              itemId: { type: Type.STRING },
              itemName: { type: Type.STRING },
              daysRemaining: { type: Type.NUMBER },
              runOutDate: { type: Type.STRING, description: "ISO Date string YYYY-MM-DD" },
              status: { type: Type.STRING, enum: ["Safe", "Low", "Critical"] },
              recommendation: { type: Type.STRING }
            },
            required: ["itemId", "itemName", "daysRemaining", "runOutDate", "status", "recommendation"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as Prediction[];
  } catch (error) {
    console.error("Gemini Prediction Error:", error);
    return [];
  }
};

export const identifyItemFromImage = async (base64Image: string): Promise<{ name: string, category: string, quantityEstimate: number, confidence: string } | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          },
          {
            text: `Identify this product for a Kenyan cleaning business inventory. 
            Read the label text carefully to find the Brand Name and Product Type.
            
            Specific Mappings:
            - 'OMO', 'Persil', 'Sunlight' -> Map to 'Detergent' (Category: Chemicals)
            - 'Jik', 'Clorox' -> Map to 'Bleach' (Category: Chemicals)
            - 'Harpic' -> Map to 'Toilet Cleaner' (Category: Chemicals)
            - 'Pledge' -> Map to 'Furniture Polish' (Category: Chemicals)
            - 'Blueband', 'Prestige' -> Map to 'Margarine' (Category: Kitchen)
            - 'Colgate', 'Aquafresh' -> Map to 'Toothpaste' (Category: General)
            - 'Downy', 'Comfort' -> Map to 'Fabric Softener' (Category: Chemicals)
            - 'Vim', 'Axion' -> Map to 'Scouring Paste' (Category: Soaps)
            
            Construct the 'name' as "Brand + Type" (e.g. "OMO Detergent", "Blueband Margarine").
            
            Return JSON with:
            - name: string
            - category: One of ['Chemicals', 'Soaps', 'Tools', 'PPE', 'Paper Products', 'Kitchen', 'General']
            - quantityEstimate: number (default 1)
            - confidence: 'High' | 'Medium' | 'Low'`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        safetySettings: [
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' }
        ],
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { type: Type.STRING },
            quantityEstimate: { type: Type.NUMBER },
            confidence: { type: Type.STRING }
          }
        }
      }
    });

    let text = response.text;
    if (!text) return null;
    
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return null;
  }
};