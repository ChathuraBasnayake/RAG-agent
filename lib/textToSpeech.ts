/**
 * Text-to-Speech Module
 * Handles conversion of text to speech using Google Cloud TTS or Browser TTS fallback
 */

import * as googleTTS from '@google-cloud/text-to-speech';

let ttsClient: googleTTS.TextToSpeechClient | null = null;
let useBrowserTTS = false; // Fallback flag

/**
 * Get or initialize the Google Cloud TTS client
 */
export function getTTSClient() {
  if (!ttsClient && !useBrowserTTS) {
    try {
      ttsClient = new googleTTS.TextToSpeechClient({
        apiKey: process.env.GOOGLE_API_KEY,
      });
    } catch (error) {
      console.warn('Google Cloud TTS unavailable, will use browser TTS fallback');
      useBrowserTTS = true;
    }
  }
  return ttsClient;
}

/**
 * Configuration for TTS
 */
export interface TTSConfig {
  languageCode?: string;
  voiceName?: string;
  gender?: 'MALE' | 'FEMALE' | 'NEUTRAL';
  speakingRate?: number; // 0.25 to 4.0
  pitch?: number; // -20.0 to 20.0
  audioEncoding?: 'MP3' | 'LINEAR16' | 'OGG_OPUS';
}

const defaultConfig: TTSConfig = {
  languageCode: 'en-US',
  voiceName: 'en-US-Neural2-F', // Natural female voice
  gender: 'FEMALE',
  speakingRate: 1.0,
  pitch: 0,
  audioEncoding: 'MP3',
};

/**
 * Convert text to speech audio
 * @param text - The text to convert to speech
 * @param config - Optional TTS configuration
 * @returns Base64 encoded audio or special flag for browser TTS
 */
export async function textToSpeech(
  text: string,
  config: TTSConfig = {}
): Promise<string> {
  // If Google Cloud TTS is unavailable, return flag for client-side TTS
  if (useBrowserTTS) {
    return 'USE_BROWSER_TTS:' + text;
  }

  const client = getTTSClient();
  if (!client) {
    return 'USE_BROWSER_TTS:' + text;
  }

  const finalConfig = { ...defaultConfig, ...config };

  try {
    const request = {
      input: { text },
      voice: {
        languageCode: finalConfig.languageCode,
        name: finalConfig.voiceName,
        ssmlGender: finalConfig.gender,
      },
      audioConfig: {
        audioEncoding: finalConfig.audioEncoding as any,
        speakingRate: finalConfig.speakingRate,
        pitch: finalConfig.pitch,
      },
    };

    const [response] = await client.synthesizeSpeech(request);

    if (!response.audioContent) {
      throw new Error('No audio content generated');
    }

    // Convert to base64
    const audioBase64 = Buffer.from(response.audioContent as Uint8Array).toString('base64');
    return audioBase64;
  } catch (error: any) {
    // If API is disabled, switch to browser TTS
    if (error.code === 7 || error.message?.includes('PERMISSION_DENIED')) {
      console.warn('Google Cloud TTS API not enabled. Falling back to browser TTS.');
      useBrowserTTS = true;
      return 'USE_BROWSER_TTS:' + text;
    }
    throw error;
  }
}

/**
 * Get list of available voices for a language
 * @param languageCode - e.g., 'en-US', 'es-ES'
 */
export async function getAvailableVoices(languageCode: string = 'en-US') {
  const client = getTTSClient();
  const [response] = await client.listVoices({ languageCode });
  return response.voices || [];
}
