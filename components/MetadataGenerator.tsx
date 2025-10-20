
import React, { useState, useCallback, useEffect } from 'react';
import { generateMetadata, generateThumbnail } from '../services/geminiService';
import { LoadingSpinner, PencilIcon, ImageIcon } from './icons';

interface MetadataGeneratorProps {
    script: string;
    quote: string;
    onMetadataGenerated: (title: string, description: string, thumbnailUrl: string) => void;
}

export const MetadataGenerator: React.FC<MetadataGeneratorProps> = ({ script, quote, onMetadataGenerated }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [metadata, thumbUrl] = await Promise.all([
                generateMetadata(script),
                generateThumbnail(quote)
            ]);

            setTitle(metadata.title);
            setDescription(metadata.description);
            setThumbnailUrl(thumbUrl);
        } catch (e) {
            console.error(e);
            setError('Failed to generate metadata or thumbnail. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [script, quote]);
    
    // Auto-generate on component mount
    useEffect(() => {
        handleGenerate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleNext = () => {
        if(title && description && thumbnailUrl) {
            onMetadataGenerated(title, description, thumbnailUrl);
        }
    };
    
    return (
        <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold text-white mb-2">Craft Your Video's Identity</h2>
            <p className="text-gray-400 mb-6 text-center">AI is generating an SEO-friendly title, description, and thumbnail for you.</p>

            {isLoading && (
                 <div className="flex flex-col items-center justify-center p-8 bg-gray-700/50 rounded-lg">
                    <LoadingSpinner className="w-12 h-12 text-brand-primary" />
                    <p className="mt-4 text-lg text-gray-300">Generating content...</p>
                 </div>
            )}
            
            {error && <p className="mt-4 text-red-400">{error}</p>}
            
            {!isLoading && (title || description || thumbnailUrl) && (
                <div className="w-full space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-300">Title</label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="block w-full rounded-md border-0 bg-white/5 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-brand-primary/50 focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-300">Description</label>
                            <div className="mt-2">
                                <textarea
                                    id="description"
                                    rows={5}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="block w-full rounded-md border-0 bg-white/5 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-brand-primary/50 focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>
                    </div>
                    {thumbnailUrl && (
                        <div>
                            <h3 className="text-sm font-medium leading-6 text-gray-300 mb-2">Generated Thumbnail</h3>
                            <div className="aspect-video w-full max-w-md mx-auto bg-gray-700 rounded-lg overflow-hidden ring-2 ring-brand-primary/50">
                                <img src={thumbnailUrl} alt="Generated motivational thumbnail" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            <div className="mt-8 w-full flex justify-end">
                <button
                    onClick={handleNext}
                    disabled={isLoading || !title || !description || !thumbnailUrl}
                    className="px-6 py-2 font-semibold text-white bg-brand-secondary rounded-lg shadow-md hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Next Step &rarr;
                </button>
            </div>
        </div>
    );
};
   