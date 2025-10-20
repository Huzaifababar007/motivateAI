import React, { useState, Fragment } from 'react';
import type { Connections } from '../types';
import { YoutubeIcon, InstagramIcon, CheckCircleIcon, LoadingSpinner, GoogleIcon } from './icons';

interface ConnectAccountsProps {
  onConnected: (connections: Connections) => void;
  initialConnections: Connections;
}

type Platform = 'youtube' | 'instagram';

const PLATFORM_DETAILS = {
  youtube: {
    name: "YouTube",
    icon: <YoutubeIcon className="w-8 h-8 text-red-500" />,
    authProvider: "Google",
    authProviderIcon: <GoogleIcon className="w-6 h-6" />,
    permissions: [
      "Upload videos to your channel",
      "Manage your videos, titles, and descriptions",
      "View your YouTube account details"
    ],
    simulatedUsername: "MotivationalChannel"
  },
  instagram: {
    name: "Instagram",
    icon: <InstagramIcon className="w-8 h-8 text-pink-500" />,
    authProvider: "Meta",
    authProviderIcon: <InstagramIcon className="w-6 h-6" />,
     permissions: [
      "Publish videos to your feed",
      "Access your profile and posts",
      "Create and manage content on your behalf"
    ],
    simulatedUsername: "DailyMotivation"
  }
}

const SimulatedAuthModal: React.FC<{
  platform: Platform;
  onClose: () => void;
  onAllow: (platform: Platform, username: string) => void;
}> = ({ platform, onClose, onAllow }) => {
  const details = PLATFORM_DETAILS[platform];
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleAllow = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
        onAllow(platform, details.simulatedUsername);
        setIsAuthenticating(false);
        onClose();
    }, 1500)
  }

  return (
     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-md ring-1 ring-white/10" onClick={e => e.stopPropagation()}>
          <div className="p-8 text-center">
            <div className="flex justify-center items-center gap-4 mb-4">
              {details.icon}
              <div className="w-px h-8 bg-gray-600"></div>
              <h2 className="text-2xl font-bold text-white">Motivate<span className="text-brand-primary">AI</span></h2>
            </div>
            <h3 className="text-lg font-semibold text-white mt-6">MotivateAI wants to access your <br/>{details.name} Account</h3>
            <p className="text-sm text-gray-400 mt-2">This will allow MotivateAI to:</p>
            <ul className="text-left text-sm text-gray-300 mt-4 space-y-2 list-none p-0 mx-auto max-w-xs">
              {details.permissions.map(perm => (
                <li key={perm} className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>{perm}</span>
                </li>
              ))}
            </ul>
             <p className="text-xs text-gray-500 mt-6">By clicking Allow, you agree to the Terms of Service. This is a simulated authentication.</p>
          </div>
          <div className="bg-gray-900/50 p-6 rounded-b-2xl flex flex-col items-center gap-4">
             <button
                onClick={handleAllow}
                disabled={isAuthenticating}
                className="w-full inline-flex items-center justify-center gap-3 px-4 py-2.5 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 transition-colors"
             >
                {isAuthenticating ? <LoadingSpinner className="w-5 h-5" /> : details.authProviderIcon}
                {isAuthenticating ? "Authenticating..." : `Continue with ${details.authProvider}`}
             </button>
             <button onClick={onClose} className="text-sm text-gray-400 hover:text-white">Cancel</button>
          </div>
      </div>
     </div>
  )
}

export const ConnectAccounts: React.FC<ConnectAccountsProps> = ({ onConnected, initialConnections }) => {
  const [connections, setConnections] = useState<Connections>(initialConnections);
  const [modalPlatform, setModalPlatform] = useState<Platform | null>(null);

  const handleConnectClick = (platform: Platform) => {
    if (connections[platform].connected) return;
    setModalPlatform(platform);
  };
  
  const handleAllowAccess = (platform: Platform, username: string) => {
    setConnections(prev => ({
      ...prev,
      [platform]: { connected: true, username: username }
    }))
  };

  const handleNext = () => {
    onConnected(connections);
  };

  const isNextDisabled = !connections.youtube.connected && !connections.instagram.connected;

  return (
    <div className="flex flex-col items-center text-center">
      {modalPlatform && <SimulatedAuthModal platform={modalPlatform} onClose={() => setModalPlatform(null)} onAllow={handleAllowAccess}/>}

      <h2 className="text-2xl font-bold text-white mb-2">Connect Your Accounts</h2>
      <p className="text-gray-400 mb-8">
        Connect the social media accounts where you want to upload your videos.
      </p>

      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        {Object.keys(connections).map(p => {
          const platform = p as Platform;
          const isConnected = connections[platform].connected;
          return (
            <button
              key={platform}
              onClick={() => handleConnectClick(platform)}
              disabled={isConnected}
              className="w-64 inline-flex flex-col items-center justify-center px-6 py-4 font-semibold text-white bg-gray-700/80 rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {PLATFORM_DETAILS[platform].icon}
              <span className="mt-2 text-lg">{PLATFORM_DETAILS[platform].name}</span>
              {isConnected ? (
                <div className="mt-1 text-sm font-normal text-green-400 flex items-center gap-1">
                  <CheckCircleIcon className="w-4 h-4" /> 
                  Connected as {connections[platform].username}
                </div>
              ) : (
                <div className="mt-1 text-sm font-normal text-gray-400">Click to connect</div>
              )}
            </button>
          )
        })}
      </div>
      
      <p className="text-xs text-gray-500 mb-8">(Connections are simulated for this demo)</p>

      <div className="w-full flex justify-end">
        <button
          onClick={handleNext}
          disabled={isNextDisabled}
          className="px-6 py-2 font-semibold text-white bg-brand-secondary rounded-lg shadow-md hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next Step &rarr;
        </button>
      </div>
    </div>
  );
};