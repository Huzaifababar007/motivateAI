import React, { useState, useCallback } from 'react';
import type { VoiceOption, ScriptData, Tone } from '../types';
import { generateScript, generateSpeech } from '../services/geminiService';
import { LoadingSpinner, MicrophoneIcon, PlayIcon, StopIcon } from './icons';

interface ScriptGeneratorProps {
    onScriptGenerated: (script: string, audioBase64: string, quote: string) => void;
    tone: Tone;
    setTone: (tone: Tone) => void;
}

const TONES: Tone[] = ['Discipline', 'Ambition', 'Peace', 'Confidence'];

export const ScriptGenerator: React.FC<ScriptGeneratorProps> = ({ onScriptGenerated, tone, setTone }) => {
    const [voice, setVoice] = useState<VoiceOption>('male');
    const [isLoading, setIsLoading] = useState(false);
    const [scriptData, setScriptData] = useState<ScriptData | null>(null);
    const [audioBase64, setAudioBase64] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setScriptData(null);
        setAudioBase64(null);

        if (audioElement) {
            audioElement.pause();
            setIsPlaying(false);
        }

        try {
            const newScriptData = await generateScript(tone);
            setScriptData(newScriptData);
            
            const newAudioBase64 = await generateSpeech(newScriptData.script, voice);
            setAudioBase64(newAudioBase64);
            const audio = new Audio(`data:audio/mpeg;base64,${newAudioBase64}`);
            audio.onended = () => setIsPlaying(false);
            setAudioElement(audio);

        } catch (e) {
            console.error(e);
            setError('Failed to generate script and voiceover. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [voice, audioElement, tone]);

    const handlePlayPause = () => {
        if (!audioElement) return;

        if (isPlaying) {
            audioElement.pause();
        } else {
            audioElement.play();
        }
        setIsPlaying(!isPlaying);
    };
    
    const handleNext = () => {
        if(scriptData && audioBase64) {
            onScriptGenerated(scriptData.script, audioBase64, scriptData.quote);
        }
    };

    return (
        <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Create Your Message</h2>
            <p className="text-gray-400 mb-6">First, select a tone and voice, then generate an inspiring script and voiceover.</p>

            <div className="bg-gray-700/50 p-4 rounded-lg mb-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="flex items-center space-x-2">
                    <label htmlFor="tone-select" className="font-medium text-gray-300">Select Tone:</label>
                    <select
                        id="tone-select"
                        value={tone}
                        onChange={(e) => setTone(e.target.value as Tone)}
                        className="rounded-md border-0 bg-white/10 py-1.5 pl-3 pr-8 text-white ring-1 ring-inset ring-white/20 focus:ring-2 focus:ring-brand-primary"
                    >
                        {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div className="flex items-center space-x-2">
                    <label className="font-medium text-gray-300">Select Voice:</label>
                    <div className="flex rounded-md shadow-sm">
                        <button
                            type="button"
                            onClick={() => setVoice('male')}
                            className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-semibold ${voice === 'male' ? 'bg-brand-primary text-white' : 'bg-gray-800 text-gray-300 ring-1 ring-inset ring-gray-600 hover:bg-gray-700'}`}
                        >
                            Male
                        </button>
                        <button
                            type="button"
                            onClick={() => setVoice('female')}
                            className={`relative -ml-px inline-flex items-center rounded-r-md px-3 py-2 text-sm font-semibold ${voice === 'female' ? 'bg-brand-primary text-white' : 'bg-gray-800 text-gray-300 ring-1 ring-inset ring-gray-600 hover:bg-gray-700'}`}
                        >
                            Female
                        </button>
                    </div>
                </div>
            </div>

            <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white bg-brand-primary rounded-lg shadow-lg hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
                {isLoading ? (
                    <>
                        <LoadingSpinner className="w-5 h-5" />
                        <span>Generating...</span>
                    </>
                ) : (
                    <>
                        <MicrophoneIcon className="w-5 h-5" />
                        <span>Generate Script & Voiceover</span>
                    </>
                )}
            </button>

            {error && <p className="mt-4 text-red-400">{error}</p>}

            {scriptData && (
                <div className="mt-8 w-full text-left bg-gray-900 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-2">Generated Script:</h3>
                    <textarea
                        readOnly
                        value={scriptData.script}
                        className="w-full h-40 bg-gray-800 text-gray-300 p-3 rounded-md border border-gray-700 resize-none focus:ring-2 focus:ring-brand-primary"
                    />
                     {audioBase64 && (
                        <div className="mt-4 flex items-center gap-4">
                            <button
                                onClick={handlePlayPause}
                                className="p-3 bg-brand-primary rounded-full text-white hover:bg-brand-secondary transition-colors"
                            >
                                {isPlaying ? <StopIcon className="w-6 h-6"/> : <PlayIcon className="w-6 h-6"/>}
                            </button>
                            <p className="text-gray-400">Preview the generated voiceover.</p>
                        </div>
                    )}
                </div>
            )}
            
            <div className="mt-8 w-full flex justify-end">
                 <button
                    onClick={handleNext}
                    disabled={!scriptData || !audioBase64}
                    className="px-6 py-2 font-semibold text-white bg-brand-secondary rounded-lg shadow-md hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Next Step &rarr;
                </button>
            </div>
        </div>
    );
};
