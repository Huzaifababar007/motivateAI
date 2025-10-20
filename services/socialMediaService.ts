import type { Connections } from '../types';

// YouTube API Integration
export class YouTubeService {
  private static readonly CLIENT_ID = import.meta.env.VITE_YOUTUBE_CLIENT_ID;
  private static readonly API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
  private static readonly SCOPES = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.force-ssl'
  ];

  static async authenticate(): Promise<{ accessToken: string; refreshToken: string; username: string }> {
    return new Promise((resolve, reject) => {
      // Create OAuth2 flow
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${this.CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(window.location.origin + '/auth/youtube/callback')}&` +
        `scope=${encodeURIComponent(this.SCOPES.join(' '))}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent`;

      // Open popup window for OAuth
      const popup = window.open(
        authUrl,
        'youtube-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        reject(new Error('Popup blocked. Please allow popups for this site.'));
        return;
      }

      // Listen for popup completion
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          reject(new Error('Authentication cancelled'));
        }
      }, 1000);

      // Listen for message from popup
      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'YOUTUBE_AUTH_SUCCESS') {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          popup.close();
          resolve(event.data.data);
        } else if (event.data.type === 'YOUTUBE_AUTH_ERROR') {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          popup.close();
          reject(new Error(event.data.error));
        }
      };

      window.addEventListener('message', messageListener);
    });
  }

  static async uploadVideo(
    accessToken: string,
    videoData: {
      title: string;
      description: string;
      videoFile: File;
      thumbnail?: string;
    }
  ): Promise<{ videoId: string; url: string }> {
    // First, upload the video file
    const videoUploadResponse = await this.uploadVideoFile(accessToken, videoData.videoFile);
    
    // Then, update the video metadata
    const metadataResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,status&key=${this.API_KEY}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: videoUploadResponse.videoId,
          snippet: {
            title: videoData.title,
            description: videoData.description,
            tags: ['motivation', 'inspiration', 'daily motivation', 'mindset'],
            categoryId: '22', // People & Blogs category
            defaultLanguage: 'en',
            defaultAudioLanguage: 'en'
          },
          status: {
            privacyStatus: 'public',
            selfDeclaredMadeForKids: false
          }
        })
      }
    );

    if (!metadataResponse.ok) {
      throw new Error('Failed to update video metadata');
    }

    const result = await metadataResponse.json();
    return {
      videoId: result.items[0].id,
      url: `https://www.youtube.com/watch?v=${result.items[0].id}`
    };
  }

  private static async uploadVideoFile(accessToken: string, videoFile: File): Promise<{ videoId: string }> {
    const formData = new FormData();
    formData.append('video', videoFile);

    const response = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload video to YouTube');
    }

    const result = await response.json();
    return { videoId: result.id };
  }
}

// Instagram API Integration
export class InstagramService {
  private static readonly CLIENT_ID = import.meta.env.VITE_INSTAGRAM_CLIENT_ID;
  private static readonly SCOPES = ['user_profile', 'user_media'];

  static async authenticate(): Promise<{ accessToken: string; username: string }> {
    return new Promise((resolve, reject) => {
      const authUrl = `https://api.instagram.com/oauth/authorize?` +
        `client_id=${this.CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(window.location.origin + '/auth/instagram/callback')}&` +
        `scope=${encodeURIComponent(this.SCOPES.join(','))}&` +
        `response_type=code`;

      const popup = window.open(
        authUrl,
        'instagram-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        reject(new Error('Popup blocked. Please allow popups for this site.'));
        return;
      }

      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          reject(new Error('Authentication cancelled'));
        }
      }, 1000);

      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'INSTAGRAM_AUTH_SUCCESS') {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          popup.close();
          resolve(event.data.data);
        } else if (event.data.type === 'INSTAGRAM_AUTH_ERROR') {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          popup.close();
          reject(new Error(event.data.error));
        }
      };

      window.addEventListener('message', messageListener);
    });
  }

  static async uploadVideo(
    accessToken: string,
    videoData: {
      title: string;
      description: string;
      videoFile: File;
      thumbnail?: string;
    }
  ): Promise<{ mediaId: string; url: string }> {
    // Instagram requires a two-step process: create media container, then publish
    
    // Step 1: Create media container
    const containerResponse = await fetch(
      `https://graph.instagram.com/v18.0/me/media`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          media_type: 'VIDEO',
          video_url: await this.uploadVideoToTemporaryStorage(videoData.videoFile),
          caption: `${videoData.title}\n\n${videoData.description}\n\n#motivation #inspiration #daily #mindset`
        })
      }
    );

    if (!containerResponse.ok) {
      throw new Error('Failed to create Instagram media container');
    }

    const containerResult = await containerResponse.json();
    const containerId = containerResult.id;

    // Step 2: Publish the media
    const publishResponse = await fetch(
      `https://graph.instagram.com/v18.0/me/media_publish`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creation_id: containerId
        })
      }
    );

    if (!publishResponse.ok) {
      throw new Error('Failed to publish Instagram video');
    }

    const publishResult = await publishResponse.json();
    return {
      mediaId: publishResult.id,
      url: `https://www.instagram.com/p/${publishResult.id}/`
    };
  }

  private static async uploadVideoToTemporaryStorage(videoFile: File): Promise<string> {
    // In a real implementation, you would upload to a temporary storage service
    // For now, we'll create a data URL (this has size limitations)
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(videoFile);
    });
  }
}

// Main service to handle both platforms
export class SocialMediaService {
  static async connectAccount(platform: 'youtube' | 'instagram'): Promise<{ username: string; accessToken: string }> {
    if (platform === 'youtube') {
      const result = await YouTubeService.authenticate();
      return {
        username: result.username,
        accessToken: result.accessToken
      };
    } else {
      const result = await InstagramService.authenticate();
      return {
        username: result.username,
        accessToken: result.accessToken
      };
    }
  }

  static async uploadToAllConnectedAccounts(
    connections: Connections,
    videoData: {
      title: string;
      description: string;
      videoFile: File;
      thumbnail?: string;
    }
  ): Promise<{ youtube?: { videoId: string; url: string }; instagram?: { mediaId: string; url: string } }> {
    const results: any = {};

    // Upload to YouTube if connected
    if (connections.youtube.connected && connections.youtube.accessToken) {
      try {
        results.youtube = await YouTubeService.uploadVideo(
          connections.youtube.accessToken,
          videoData
        );
      } catch (error) {
        console.error('YouTube upload failed:', error);
      }
    }

    // Upload to Instagram if connected
    if (connections.instagram.connected && connections.instagram.accessToken) {
      try {
        results.instagram = await InstagramService.uploadVideo(
          connections.instagram.accessToken,
          videoData
        );
      } catch (error) {
        console.error('Instagram upload failed:', error);
      }
    }

    return results;
  }
}
