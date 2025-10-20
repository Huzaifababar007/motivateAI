import React, { useState } from 'react';
import type { VideoData, Connections } from '../types';
import { CheckCircleIcon, ReplayIcon, YoutubeIcon, InstagramIcon } from './icons';

interface UploaderProps {
    videoData: VideoData;
    connections: Connections;
    onRestart: () => void;
}

type UploadStatus = 'idle' | 'uploading' | 'uploaded';

export const Uploader: React.FC<UploaderProps> = ({ videoData, connections, onRestart }) => {
    const [youtubeStatus, setYoutubeStatus] = useState<UploadStatus>('idle');
    const [instagramStatus, setInstagramStatus] = useState<UploadStatus>('idle');
    
    const allUploaded = (connections.youtube.connected ? youtubeStatus === 'uploaded' : true) && 
                      (connections.instagram.connected ? instagramStatus === 'uploaded' : true);

    const handleUpload = (platform: 'youtube' | 'instagram') => {
        if (platform === 'youtube') setYoutubeStatus('uploading');
        if (platform === 'instagram') setInstagramStatus('uploading');

        // Simulate upload delay
        setTimeout(() => {
            if (platform === 'youtube') setYoutubeStatus('uploaded');
            if (platform === 'instagram') setInstagramStatus('uploaded');
        }, 2000);
    };

    if (allUploaded && (youtubeStatus !== 'idle' || instagramStatus !== 'idle')) {
        return (
            <div className="text-center flex flex-col items-center">
                <CheckCircleIcon className="w-16 h-16 text-green-400 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Upload Complete!</h2>
                <p className="text-gray-400 mb-6 max-w-md">Your motivational video package is ready. In a real application, it would now be live on your connected channels.</p>
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

            <div className="w-full border-t border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-center mb-4">Upload Destinations</h3>
                 <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    {connections.youtube.connected && (
                        <button
                            onClick={() => handleUpload('youtube')}
                            disabled={youtubeStatus !== 'idle'}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3 font-bold text-white bg-red-600 rounded-lg shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-colors"
                        >
                            <YoutubeIcon className="w-6 h-6"/>
                            {youtubeStatus === 'idle' && `Upload to ${connections.youtube.username}`}
                            {youtubeStatus === 'uploading' && 'Uploading...'}
                            {youtubeStatus === 'uploaded' && 'Uploaded!'}
                        </button>
                    )}
                    {connections.instagram.connected && (
                         <button
                            onClick={() => handleUpload('instagram')}
                            disabled={instagramStatus !== 'idle'}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3 font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-colors"
                        >
                            <InstagramIcon className="w-6 h-6"/>
                            {instagramStatus === 'idle' && `Upload to ${connections.instagram.username}`}
                            {instagramStatus === 'uploading' && 'Uploading...'}
                            {instagramStatus === 'uploaded' && 'Uploaded!'}
                        </button>
                    )}
                 </div>
                <p className="text-xs text-gray-500 mt-4 text-center">(This is a simulated upload)</p>
            </div>
        </div>
    );
};