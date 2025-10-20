export type VoiceOption = 'male' | 'female';
export type Tone = 'Discipline' | 'Ambition' | 'Peace' | 'Confidence';

export interface VideoData {
  script: string;
  audioBase64: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  quote: string;
}

export interface ScriptData {
  script: string;
  quote: string;
}

export interface AccountConnection {
  connected: boolean;
  username: string | null;
  accessToken?: string;
  refreshToken?: string;
}

export interface Connections {
  youtube: AccountConnection;
  instagram: AccountConnection;
}