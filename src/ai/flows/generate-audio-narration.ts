'use server';

/**
 * @fileOverview Generates audio narration from scene summaries using a text-to-speech engine.
 *
 * - generateAudioNarration - A function that generates audio narration for a given text.
 * - GenerateAudioNarrationInput - The input type for the generateAudioNarration function.
 * - GenerateAudioNarrationOutput - The return type for the generateAudioNarration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const GenerateAudioNarrationInputSchema = z.string().describe('The text to be converted to speech.');
export type GenerateAudioNarrationInput = z.infer<typeof GenerateAudioNarrationInputSchema>;

const GenerateAudioNarrationOutputSchema = z.object({
  audioDataUri: z.string().describe('The audio narration as a data URI in WAV format.'),
});
export type GenerateAudioNarrationOutput = z.infer<typeof GenerateAudioNarrationOutputSchema>;

export async function generateAudioNarration(input: GenerateAudioNarrationInput): Promise<GenerateAudioNarrationOutput> {
  return generateAudioNarrationFlow(input);
}

const generateAudioNarrationFlow = ai.defineFlow(
  {
    name: 'generateAudioNarrationFlow',
    inputSchema: GenerateAudioNarrationInputSchema,
    outputSchema: GenerateAudioNarrationOutputSchema,
  },
  async (text) => {
    const {media} = await ai.generate({
      model: ai.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'},
          },
        },
      },
      prompt: text,
    });

    if (!media) {
      throw new Error('No media returned from TTS model.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    return {
      audioDataUri: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
    };
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
