import React, { useState, useCallback } from 'react';
import { ConnectAccounts } from './components/ConnectAccounts';
import { ScriptGenerator } from './components/ScriptGenerator';
import { MetadataGenerator } from './components/MetadataGenerator';
import { VideoPreviewer } from './components/VideoPreviewer';
import { Uploader } from './components/Uploader';
import { StepIndicator } from './components/StepIndicator';
import { FlameIcon } from './components/icons';
import type { VideoData, Tone, Connections } from './types';

const App: React.FC = () => {
  const [step, setStep] = useState(1);
  const [connections, setConnections] = useState<Connections>({ 
    youtube: { connected: false, username: null }, 
    instagram: { connected: false, username: null } 
  });
  const [selectedTone, setSelectedTone] = useState<Tone>('Discipline');
  const [videoData, setVideoData] = useState<VideoData>({
    script: '',
    audioBase64: '',
    title: '',
    description: '',
    thumbnailUrl: '',
    quote: '',
  });

  const handleAccountsConnected = useCallback((newConnections: Connections) => {
    setConnections(newConnections);
    setStep(2);
  }, []);

  const handleScriptGenerated = useCallback((script: string, audioBase64: string, quote: string) => {
    setVideoData(prev => ({ ...prev, script, audioBase64, quote }));
    setStep(3);
  }, []);

  const handleMetadataGenerated = useCallback((title: string, description: string, thumbnailUrl: string) => {
    setVideoData(prev => ({ ...prev, title, description, thumbnailUrl }));
    setStep(4);
  }, []);

  const handlePreviewFinished = useCallback(() => {
    setStep(5);
  }, []);

  const handleRestart = useCallback(() => {
    setVideoData({
      script: '',
      audioBase64: '',
      title: '',
      description: '',
      thumbnailUrl: '',
      quote: '',
    });
    setConnections({ 
      youtube: { connected: false, username: null }, 
      instagram: { connected: false, username: null } 
    });
    setStep(1);
  }, []);

  const renderStep = () => {
    switch (step) {
      case 1:
        return <ConnectAccounts onConnected={handleAccountsConnected} initialConnections={connections} />;
      case 2:
        return <ScriptGenerator onScriptGenerated={handleScriptGenerated} tone={selectedTone} setTone={setSelectedTone} />;
      case 3:
        return <MetadataGenerator script={videoData.script} quote={videoData.quote} onMetadataGenerated={handleMetadataGenerated} />;
      case 4:
        return <VideoPreviewer videoData={videoData} onPreviewFinished={handlePreviewFinished} />;
      case 5:
        return <Uploader videoData={videoData} connections={connections} onRestart={handleRestart} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
            <div className="inline-flex items-center justify-center gap-3 mb-4">
                <FlameIcon className="w-10 h-10 text-brand-primary" />
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                    Motivate<span className="text-brand-primary">AI</span>
                </h1>
            </div>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Your personal AI assistant for creating and launching daily motivational videos.
            </p>
        </header>
        
        <main className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl ring-1 ring-white/10 p-6 sm:p-8 lg:p-10">
          <StepIndicator currentStep={step} totalSteps={5} />
          <div className="mt-12">
            {renderStep()}
          </div>
        </main>

        <footer className="text-center mt-8 text-gray-500 text-sm">
            <p>This is a frontend demonstration. Full automation requires a backend service.</p>
            <p>&copy; {new Date().getFullYear()} MotivateAI. All Rights Reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;