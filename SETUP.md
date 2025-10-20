# MotivateAI Setup Guide

This guide will help you set up MotivateAI with real social media integrations.

## Prerequisites

1. **Google Cloud Console Account** (for YouTube API)
2. **Meta Developer Account** (for Instagram API)
3. **Google AI Studio Account** (for Gemini API)

## API Keys Setup

### 1. Gemini API Key (Already Set)
✅ Your Gemini API key is already configured: `AIzaSyDFA58LJ7ziIxt_P2vuezaKqV4j9zECQ00`

### 2. YouTube API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the YouTube Data API v3
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `https://motivateai.netlify.app/auth/youtube/callback`
   - `http://localhost:3000/auth/youtube/callback` (for local development)
7. Copy the Client ID and API Key

### 3. Instagram API Setup

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Instagram Basic Display product
4. Configure OAuth redirect URIs:
   - `https://motivateai.netlify.app/auth/instagram/callback`
   - `http://localhost:3000/auth/instagram/callback` (for local development)
5. Copy the App ID and App Secret

## Environment Variables

Set these environment variables in Netlify:

```bash
# Already set
VITE_GEMINI_API_KEY=AIzaSyDFA58LJ7ziIxt_P2vuezaKqV4j9zECQ00

# YouTube API (you need to set these)
VITE_YOUTUBE_CLIENT_ID=your_youtube_client_id_here
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here

# Instagram API (you need to set these)
VITE_INSTAGRAM_CLIENT_ID=your_instagram_app_id_here
```

## Setting Environment Variables in Netlify

1. Go to your Netlify dashboard
2. Navigate to your MotivateAI project
3. Go to Site settings → Environment variables
4. Add each variable with its value
5. Redeploy your site

## How It Works

### Authentication Flow
1. User clicks "Connect" for YouTube/Instagram
2. OAuth popup opens with the respective platform
3. User authorizes the app
4. Access tokens are stored securely
5. App can now upload videos automatically

### Upload Process
1. User generates content (script, audio, metadata, thumbnail)
2. User clicks "Upload" for desired platforms
3. App automatically:
   - Converts audio to video format
   - Uploads to YouTube with metadata
   - Uploads to Instagram with caption
   - Provides direct links to uploaded content

### Security Features
- OAuth 2.0 authentication
- Secure token storage
- HTTPS-only communication
- No sensitive data in client-side code

## Current Status

✅ **Working:**
- Gemini API integration (script generation, metadata, thumbnails)
- Real OAuth authentication flow
- Automatic video upload to connected accounts
- Error handling and user feedback

⚠️ **Needs API Keys:**
- YouTube API credentials
- Instagram API credentials

## Testing

Once you set up the API keys:

1. Visit https://motivateai.netlify.app
2. Click "Connect" for YouTube and/or Instagram
3. Complete OAuth authentication
4. Generate a motivational video
5. Upload to your connected accounts
6. Get direct links to your published content!

## Troubleshooting

### Common Issues:
1. **"API key not configured"** - Set the environment variables in Netlify
2. **"Popup blocked"** - Allow popups for the site
3. **"Authentication failed"** - Check OAuth redirect URIs match exactly
4. **"Upload failed"** - Verify API permissions and quotas

### Support:
- Check browser console for detailed error messages
- Verify all environment variables are set correctly
- Ensure OAuth redirect URIs match your domain exactly
