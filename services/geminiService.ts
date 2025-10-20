import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { VoiceOption, ScriptData, Tone } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateScript = async (tone: Tone): Promise<ScriptData> => {
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
        model: "gemini-2.5-pro",
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
    const voiceName = voice === 'male' ? 'Kore' : 'Puck'; // Example voices
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
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
    const prompt = `
        Based on the following motivational script, generate metadata for a video to be posted on YouTube and Instagram.
        
        Script: "${script}"
        
        Guidelines:
        - Title: Create a compelling, SEO-optimized title. It should be short, catchy, and under 60 characters. Use title case.
        - Description: Write an engaging description (3-4 sentences) that hooks the viewer, summarizes the message, and includes a call to subscribe/follow. End the description with a mix of 5-7 relevant hashtags for both YouTube and Instagram (e.g., #DailyMotivation #Mindset #Discipline #Inspiration #InstagramReels #YTShorts).
        
        Return the response as a JSON object with "title" and "description" keys.
    `;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
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
    
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            aspectRatio: '16:9',
            outputMimeType: 'image/jpeg'
        }
    });

    const image = response.generatedImages[0]?.image?.imageBytes;
    if (image) {
        return `data:image/jpeg;base64,${image}`;
    }
    
    throw new Error('Failed to generate thumbnail image.');
};
