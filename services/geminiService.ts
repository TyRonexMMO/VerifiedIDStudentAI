import { GoogleGenAI, Type } from "@google/genai";
import { StudentParentPair } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export async function generateSignatureImage(
    name: string, 
    scale: number = 1, 
    aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9' = '4:3'
): Promise<string | null> {
  if (!API_KEY) {
    alert("API key is not configured. Cannot generate signature.");
    return null;
  }
  
  try {
    // A more detailed prompt for higher quality and better adherence to requirements.
    const prompt = `Generate a hyperrealistic, high-resolution, professional handwritten signature for the name '${name}'.
- **Ink:** The signature MUST be in solid, crisp black ink, simulating a fine-tip pen.
- **Background:** The background MUST be a pure, solid white (#FFFFFF). There should be absolutely no shadows, gradients, textures, or any other artifacts. The signature must appear as if it is on a clean sheet of paper.
- **Style:** The signature style should be an elegant, legible cursive script suitable for an official document.
- **Isolation:** The final image must contain ONLY the signature. No other elements, text, or borders.`;

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: aspectRatio,
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/png;base64,${base64ImageBytes}`;
    }
    return null;
  } catch (error) {
    console.error("Error generating signature:", error);
    alert("Failed to generate signature. Please check the console for details.");
    return null;
  }
}

export async function generatePrincipalName(): Promise<string | null> {
    if (!API_KEY) {
      alert("API key is not configured. Cannot generate name.");
      return null;
    }
    try {
      const prompt = "Generate a single, realistic full name for a school principal or accountant in India. The name should sound professional. Do not add any extra text, titles, or quotation marks. Just the name.";
  
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
  
      const name = response.text.trim();
      // Basic validation that we got a reasonable name
      if (name && name.split(' ').length >= 2 && !name.includes('"')) {
        return name;
      }
      console.warn("Generated name was not in the expected format:", name);
      return null;
  
    } catch (error) {
      console.error("Error generating principal name:", error);
      alert("Failed to generate a name for the signature. Please check the console for details.");
      return null;
    }
}

export async function generateIndianNames(count: number): Promise<StudentParentPair[] | null> {
  if (!API_KEY) {
    alert("API key is not configured. Cannot generate names.");
    return null;
  }
  if (count <= 0 || count > 100) {
    alert("Please enter a number between 1 and 100.");
    return null;
  }

  try {
    const prompt = `Generate ${count} realistic, unique, and diverse Indian full names for students. For each student, also generate a corresponding realistic parent/guardian name (e.g., using a title like 'Mr.' or 'Mrs.' with the student's last name).`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              studentName: {
                type: Type.STRING,
                description: "The full name of the student.",
              },
              parentName: {
                type: Type.STRING,
                description: "The full name of the student's parent or guardian.",
              },
            },
            required: ['studentName', 'parentName'],
          },
        },
      },
    });

    const jsonStr = response.text.trim();
    const namePairs = JSON.parse(jsonStr);
    
    if (Array.isArray(namePairs) && namePairs.every(item => typeof item === 'object' && item !== null && 'studentName' in item && 'parentName' in item && typeof item.studentName === 'string' && typeof item.parentName === 'string')) {
      return namePairs as StudentParentPair[];
    }
    
    console.error("Generated names response was not in the expected format:", namePairs);
    return null;

  } catch (error) {
    console.error("Error generating Indian names:", error);
    alert("Failed to generate names. Please check the console for details.");
    return null;
  }
}
