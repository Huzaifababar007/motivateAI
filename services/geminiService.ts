import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { VoiceOption, ScriptData, Tone } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("VITE_GEMINI_API_KEY environment variable not set. API calls will fail.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const generateScript = async (tone: Tone): Promise<ScriptData> => {
    if (!ai) {
        throw new Error("API key not configured. Please set VITE_GEMINI_API_KEY environment variable.");
    }
    
    const prompt = `
        Generate a premium, cinematic motivational script for a 30-60 second video.
        The desired tone is: "${tone}".
        The script should be between 100-150 words.
        Structure it like a short story: start with a relatable struggle, build towards a moment of realization or a powerful insight, and end with a strong call to action.
        Use vivid imagery and metaphors. The language must be eloquent and inspiring.
        Conclude with a profound and relevant quote from a philosopher, leader, or great thinker that matches the script's tone.
        
        Return the response in JSON format with two keys: "script" and "quote".
        The "script" should be the main body of the speech.
        The "quote" should be the final quote string, including the author.
    `;
    
    const response = await ai.models.generateContent({
        model: "gemini-1.5-pro",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    script: { type: Type.STRING },
                    quote: { type: Type.STRING }
                },
                required: ["script", "quote"]
            }
        }
    });
    
    const jsonText = response.text;
    try {
        const parsed = JSON.parse(jsonText);
        if(parsed.script && parsed.quote){
            return parsed;
        }
        throw new Error("Invalid JSON structure");
    } catch (e) {
        console.error("Failed to parse script JSON:", e);
        throw new Error("Could not generate script.");
    }
};

export const generateSpeech = async (text: string, voice: VoiceOption): Promise<string> => {
    if (!ai) {
        throw new Error("API key not configured. Please set VITE_GEMINI_API_KEY environment variable.");
    }
    
    const voiceName = voice === 'male' ? 'Kore' : 'Puck'; // Example voices
    
    const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ parts: [{ text: `Say with a confident and inspiring tone: ${text}` }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: voiceName },
                },
            },
        },
    });

    const audioPart = response.candidates?.[0]?.content?.parts?.[0];
    if (audioPart && audioPart.inlineData?.data) {
        return audioPart.inlineData.data;
    }
    throw new Error('Failed to generate audio from text.');
};

export const generateMetadata = async (script: string): Promise<{ title: string; description: string }> => {
    if (!ai) {
        throw new Error("API key not configured. Please set VITE_GEMINI_API_KEY environment variable.");
    }
    
    const prompt = `
        Based on the following motivational script, generate metadata for a video to be posted on YouTube and Instagram.
        
        Script: "${script}"
        
        Guidelines:
        - Title: Create a compelling, SEO-optimized title. It should be short, catchy, and under 60 characters. Use title case.
        - Description: Write an engaging description (3-4 sentences) that hooks the viewer, summarizes the message, and includes a call to subscribe/follow. End the description with a mix of 5-7 relevant hashtags for both YouTube and Instagram (e.g., #DailyMotivation #Mindset #Discipline #Inspiration #InstagramReels #YTShorts).
        
        Return the response as a JSON object with "title" and "description" keys.
    `;
    
    const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING }
                },
                required: ["title", "description"]
            }
        }
    });

    try {
        return JSON.parse(response.text);
    } catch (e) {
        console.error("Failed to parse metadata JSON:", e);
        throw new Error("Could not generate metadata.");
    }
};


export const generateThumbnail = async (quote: string): Promise<string> => {
    if (!ai) {
        throw new Error("API key not configured. Please set VITE_GEMINI_API_KEY environment variable.");
    }
    
    const prompt = `
        Create a premium, modern, and visually striking thumbnail image for a motivational YouTube video.
        The thumbnail must feature the quote: "${quote}".
        
        Design Principles:
        - Aesthetic: Minimalist and professional.
        - Typography: Use an ultra-readable, bold, and elegant font for the text.
        - Color Palette: Employ cinematic color grading.
        - Background: Use a deep, textured background like dark marble, brushed metal, or a subtle abstract gradient to make the text pop.
        - Overall Feel: The thumbnail should look inspiring, high-end, and avoid stock photo clichés.
    `;
    
    // For now, return a placeholder image URL since image generation might not be available
    // In a real implementation, you would use a proper image generation service
    const placeholderImage = `data:image/svg+xml;base64,${btoa(`
        <svg width="400" height="225" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#7C3AED;stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grad)"/>
            <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" font-weight="bold" 
                  text-anchor="middle" dominant-baseline="middle" fill="white">
                ${quote.length > 50 ? quote.substring(0, 50) + '...' : quote}
            </text>
        </svg>
    `)}`;
    
    return placeholderImage;
};
