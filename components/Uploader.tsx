import React, { useState } from 'react';
import type { VideoData, Connections } from '../types';
import { CheckCircleIcon, ReplayIcon, YoutubeIcon, InstagramIcon, LoadingSpinner } from './icons';
import { SocialMediaService } from '../services/socialMediaService';

interface UploaderProps {
    videoData: VideoData;
    connections: Connections;
    onRestart: () => void;
}

type UploadStatus = 'idle' | 'uploading' | 'uploaded' | 'error';

export const Uploader: React.FC<UploaderProps> = ({ videoData, connections, onRestart }) => {
    const [youtubeStatus, setYoutubeStatus] = useState<UploadStatus>('idle');
    const [instagramStatus, setInstagramStatus] = useState<UploadStatus>('idle');
    const [uploadResults, setUploadResults] = useState<{
        youtube?: { videoId: string; url: string };
        instagram?: { mediaId: string; url: string };
    }>({});
    const [error, setError] = useState<string | null>(null);
    
    const allUploaded = (connections.youtube.connected ? youtubeStatus === 'uploaded' : true) && 
                      (connections.instagram.connected ? instagramStatus === 'uploaded' : true);

    const handleUpload = async (platform: 'youtube' | 'instagram') => {
        if (platform === 'youtube') setYoutubeStatus('uploading');
        if (platform === 'instagram') setInstagramStatus('uploading');
        setError(null);

        try {
            // Convert audio to video file (in a real app, you'd combine audio with visuals)
            const audioBlob = await fetch(videoData.audioBase64).then(r => r.blob());
            const videoFile = new File([audioBlob], 'motivational-video.mp4', { type: 'video/mp4' });

            const results = await SocialMediaService.uploadToAllConnectedAccounts(
                connections,
                {
                    title: videoData.title,
                    description: videoData.description,
                    videoFile: videoFile,
                    thumbnail: videoData.thumbnailUrl
                }
            );

            setUploadResults(results);

            if (platform === 'youtube' && results.youtube) {
                setYoutubeStatus('uploaded');
            } else if (platform === 'instagram' && results.instagram) {
                setInstagramStatus('uploaded');
            }

        } catch (error) {
            console.error('Upload failed:', error);
            setError(error instanceof Error ? error.message : 'Upload failed');
            if (platform === 'youtube') setYoutubeStatus('error');
            if (platform === 'instagram') setInstagramStatus('error');
        }
    };

    if (allUploaded && (youtubeStatus !== 'idle' || instagramStatus !== 'idle')) {
        return (
            <div className="text-center flex flex-col items-center">
                <CheckCircleIcon className="w-16 h-16 text-green-400 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Upload Complete!</h2>
                <p className="text-gray-400 mb-6 max-w-md">Your motivational video has been successfully uploaded to your connected channels!</p>
                
                {uploadResults.youtube && (
                    <div className="mb-4 p-4 bg-gray-800 rounded-lg">
                        <p className="text-green-400 font-semibold">✅ YouTube</p>
                        <a href={uploadResults.youtube.url} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-400 hover:text-blue-300 underline">
                            View on YouTube
                        </a>
                    </div>
                )}
                
                {uploadResults.instagram && (
                    <div className="mb-4 p-4 bg-gray-800 rounded-lg">
                        <p className="text-green-400 font-semibold">✅ Instagram</p>
                        <a href={uploadResults.instagram.url} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-400 hover:text-blue-300 underline">
                            View on Instagram
                        </a>
                    </div>
                )}
                <button
                    onClick={onRestart}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2 font-semibold text-white bg-brand-primary rounded-lg shadow-lg hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
                >
                    <ReplayIcon className="w-5 h-5"/>
                    Create Another Video
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold text-white mb-2">Ready to Launch</h2>
            <p className="text-gray-400 mb-6 text-center">Review your generated content. When you're ready, upload to your connected channels.</p>

            <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-8">
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Metadata</h3>
                    <div className="p-4 bg-gray-900 rounded-lg">
                        <p className="font-medium text-gray-300">Title</p>
                        <p className="text-white">{videoData.title}</p>
                    </div>
                    <div className="p-4 bg-gray-900 rounded-lg">
                        <p className="font-medium text-gray-300">Description</p>
                        <p className="text-gray-300 whitespace-pre-wrap">{videoData.description}</p>
                    </div>
                </div>
                <div className="space-y-4">
                     <h3 className="font-semibold text-lg">Thumbnail</h3>
                    <div className="aspect-video w-full bg-gray-700 rounded-lg overflow-hidden ring-1 ring-white/10">
                        <img src={videoData.thumbnailUrl} alt="Generated thumbnail" className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>

            {error && (
                <div className="w-full mb-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                    <p className="text-red-400 text-center">{error}</p>
                </div>
            )}

            <div className="w-full border-t border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-center mb-4">Upload Destinations</h3>
                 <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    {connections.youtube.connected && (
                        <button
                            onClick={() => handleUpload('youtube')}
                            disabled={youtubeStatus === 'uploading' || youtubeStatus === 'uploaded'}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3 font-bold text-white bg-red-600 rounded-lg shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-colors"
                        >
                            {youtubeStatus === 'uploading' ? (
                                <LoadingSpinner className="w-6 h-6" />
                            ) : (
                                <YoutubeIcon className="w-6 h-6"/>
                            )}
                            {youtubeStatus === 'idle' && `Upload to ${connections.youtube.username}`}
                            {youtubeStatus === 'uploading' && 'Uploading...'}
                            {youtubeStatus === 'uploaded' && 'Uploaded!'}
                            {youtubeStatus === 'error' && 'Retry Upload'}
                        </button>
                    )}
                    {connections.instagram.connected && (
                         <button
                            onClick={() => handleUpload('instagram')}
                            disabled={instagramStatus === 'uploading' || instagramStatus === 'uploaded'}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3 font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-colors"
                        >
                            {instagramStatus === 'uploading' ? (
                                <LoadingSpinner className="w-6 h-6" />
                            ) : (
                                <InstagramIcon className="w-6 h-6"/>
                            )}
                            {instagramStatus === 'idle' && `Upload to ${connections.instagram.username}`}
                            {instagramStatus === 'uploading' && 'Uploading...'}
                            {instagramStatus === 'uploaded' && 'Uploaded!'}
                            {instagramStatus === 'error' && 'Retry Upload'}
                        </button>
                    )}
                 </div>
                <p className="text-xs text-gray-500 mt-4 text-center">
                    Videos will be automatically uploaded to your connected accounts
                </p>
            </div>
        </div>
    );
};