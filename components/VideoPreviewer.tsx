import React, { useState, useEffect, useRef } from 'react';
import type { VideoData } from '../types';
import { PlayIcon, PauseIcon } from './icons';

interface VideoPreviewerProps {
    videoData: VideoData;
    onPreviewFinished: () => void;
}

// Array of high-quality, royalty-free background videos
const BACKGROUND_VIDEOS = [
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
];

export const VideoPreviewer: React.FC<VideoPreviewerProps> = ({ videoData, onPreviewFinished }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [subtitles, setSubtitles] = useState<string[]>([]);
    const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
    const subtitleIntervalRef = useRef<number | null>(null);
    const [videoUrl, setVideoUrl] = useState('');
    
    // Select a random video on component mount
    useEffect(() => {
        setVideoUrl(BACKGROUND_VIDEOS[Math.floor(Math.random() * BACKGROUND_VIDEOS.length)]);
    }, []);


    useEffect(() => {
        if (videoData.script) {
            const sentences = videoData.script.split(/[.!?]+\s/).filter(s => s.trim().length > 0).map(s => s.trim());
            setSubtitles(sentences);
        }

        if (videoData.audioBase64) {
            const audio = new Audio(`data:audio/mpeg;base64,${videoData.audioBase64}`);
            audioRef.current = audio;
            
            audio.addEventListener('ended', () => {
                setIsPlaying(false);
                if (videoRef.current) videoRef.current.pause();
                if(subtitleIntervalRef.current) clearInterval(subtitleIntervalRef.current);
            });
             audio.addEventListener('loadedmetadata', () => {
                // Ensure we have a valid duration
                if (videoRef.current && isFinite(audio.duration)) {
                    videoRef.current.playbackRate = videoRef.current.duration / audio.duration;
                }
            });
        }
    }, [videoData.script, videoData.audioBase64]);

    const handlePlayPause = () => {
        const video = videoRef.current;
        const audio = audioRef.current;
        if (!video || !audio) return;
        
        if (isPlaying) {
            video.pause();
            audio.pause();
            if (subtitleIntervalRef.current) clearInterval(subtitleIntervalRef.current);
        } else {
            video.currentTime = 0;
            audio.currentTime = 0;
            setCurrentSubtitleIndex(0);
            
            video.play().catch(e => console.error("Video play error:", e));
            audio.play().catch(e => console.error("Audio play error:", e));
            
            const audioDuration = audio.duration;
            if (isFinite(audioDuration) && subtitles.length > 0) {
                const interval = (audioDuration / subtitles.length) * 1000;
                subtitleIntervalRef.current = window.setInterval(() => {
                    setCurrentSubtitleIndex(prev => {
                        if (prev < subtitles.length - 1) {
                            return prev + 1;
                        }
                        if (subtitleIntervalRef.current) clearInterval(subtitleIntervalRef.current);
                        return prev;
                    });
                }, interval);
            }
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold text-white mb-2">Preview Your Creation</h2>
            <p className="text-gray-400 mb-6 text-center">This is a simulation of your final video. Press play to preview.</p>

            <div className="relative w-full max-w-2xl mx-auto aspect-video bg-black rounded-lg overflow-hidden ring-2 ring-brand-primary/50 shadow-lg">
                <video
                    ref={videoRef}
                    src={videoUrl}
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-8">
                     {!isPlaying && (
                        <button
                            onClick={handlePlayPause}
                            className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-4 rounded-full text-white hover:bg-white/30 transition-all"
                        >
                            <PlayIcon className="w-12 h-12" />
                        </button>
                    )}
                    <div 
                        onClick={handlePlayPause} 
                        className="absolute inset-0 w-full h-full cursor-pointer"
                    ></div>
                    <p className="text-white text-2xl md:text-3xl font-bold text-center shadow-text transition-opacity duration-500"
                       style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
                        {subtitles[currentSubtitleIndex]}
                    </p>
                </div>
            </div>

            <div className="mt-8 w-full flex justify-end">
                <button
                    onClick={onPreviewFinished}
                    disabled={isPlaying}
                    className="px-6 py-2 font-semibold text-white bg-brand-secondary rounded-lg shadow-md hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Final Step &rarr;
                </button>
            </div>
        </div>
    );
};
