
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { Job, EnhancedCV } from "../types";

// Always initialize GoogleGenAI with the apiKey from process.env.API_KEY.
export const getGeminiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function searchJobs(role: string, location: string, cvContent?: string): Promise<{ jobs: Job[], sources: any[] }> {
  const ai = getGeminiClient();
  
  const matchPromptPart = cvContent 
    ? `For each job found, compare it with this CV: """${cvContent}""". Calculate an estimated match score (matchPercentage) between 0 and 100 based on required skills and experience.` 
    : "The user has not provided a CV yet, so matchPercentage should be 0.";

  const prompt = `List 5 real current job openings for "${role}" in "${location}". 
    Use your internal search capability to find real data.
    ${matchPromptPart}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            company: { type: Type.STRING },
            location: { type: Type.STRING },
            link: { type: Type.STRING },
            descriptionSnippet: { type: Type.STRING },
            matchPercentage: { type: Type.NUMBER, description: "Match score percentage (0-100)" }
          },
          required: ["title", "company", "location", "link", "descriptionSnippet", "matchPercentage"]
        }
      }
    }
  });

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

  try {
    const jobs = JSON.parse(response.text || "[]");
    return { jobs, sources: groundingChunks };
  } catch (e) {
    console.error("Failed to parse jobs", e);
    return { jobs: [], sources: [] };
  }
}

export async function enhanceCV(cvContent: string, jobDescription: string): Promise<EnhancedCV> {
  const ai = getGeminiClient();
  const prompt = `You are a world-class Executive CV Writer. 
  TASK: Rewrite and optimize this CV to perfectly match the target job description.
  
  Current CV: """${cvContent}"""
  Target Job: """${jobDescription}"""
  
  OUTPUT FORMAT: A highly structured JSON object that fits a two-column professional layout.
  - jobTitle: A strategic professional title (e.g., "Digital Marketing Strategist").
  - contact: Current phone, email, and location.
  - summary: A powerful, visionary profile summary.
  - experience: Detailed roles including Company, Dates, Location, a high-level description, and 4-6 bulleted Key Achievements.
  - education: Degree, Institution, Location/Dates, and optional Specialization notes.
  - certifications: Name and Issuer/Year.
  - skills: Grouped skills into categories (e.g., "Technical & Development", "Strategy").
  - techStack: A comma-separated list of tools and technologies.
  - languages: A descriptive list of languages and proficiency (e.g. "English (Fluent - C1)").
  - score: ATS match score (0-100).
  - analysis: HR feedback on the optimization.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          jobTitle: { type: Type.STRING },
          contact: {
            type: Type.OBJECT,
            properties: {
              phone: { type: Type.STRING },
              email: { type: Type.STRING },
              location: { type: Type.STRING }
            },
            required: ["phone", "email", "location"]
          },
          summary: { type: Type.STRING },
          experience: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                role: { type: Type.STRING },
                company: { type: Type.STRING },
                dates: { type: Type.STRING },
                location: { type: Type.STRING },
                description: { type: Type.STRING },
                achievements: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["role", "company", "dates", "location", "description", "achievements"]
            }
          },
          education: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                degree: { type: Type.STRING },
                institution: { type: Type.STRING },
                locationAndDates: { type: Type.STRING },
                specialization: { type: Type.STRING }
              },
              required: ["degree", "institution", "locationAndDates"]
            }
          },
          certifications: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                issuerAndYear: { type: Type.STRING }
              },
              required: ["name", "issuerAndYear"]
            }
          },
          skills: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                items: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["category", "items"]
            }
          },
          techStack: { type: Type.STRING },
          languages: { type: Type.STRING },
          analysis: { type: Type.STRING },
          score: { type: Type.NUMBER }
        },
        required: ["jobTitle", "contact", "summary", "experience", "education", "certifications", "skills", "techStack", "languages", "analysis", "score"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
