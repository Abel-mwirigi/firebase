'use server';

/**
 * @fileOverview Summarizes key scenes from an uploaded video for visually impaired users.
 *
 * - summarizeUploadedVideo - A function that takes a video data URI and returns a summary of key scenes.
 * - SummarizeUploadedVideoInput - The input type for the summarizeUploadedVideo function.
 * - SummarizeUploadedVideoOutput - The return type for the summarizeUploadedVideo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const SummarizeUploadedVideoInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      'A video as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected typo here
    ),
});

export type SummarizeUploadedVideoInput = z.infer<typeof SummarizeUploadedVideoInputSchema>;

const SummarizeUploadedVideoOutputSchema = z.object({
  sceneSummaries: z.array(
    z.object({
      timestamp: z.number().describe('The timestamp of the scene in seconds.'),
      summary: z.string().describe('A textual summary of the scene.'),
      audio: z.string().describe('Narration of the scene summary in base64 encoded WAV format.'),
    })
  ).describe('An array of scene summaries with timestamps and audio narration.'),
});

export type SummarizeUploadedVideoOutput = z.infer<typeof SummarizeUploadedVideoOutputSchema>;

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

    let bufs = [] as any[];
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

export async function summarizeUploadedVideo(
  input: SummarizeUploadedVideoInput
): Promise<SummarizeUploadedVideoOutput> {
  return summarizeUploadedVideoFlow(input);
}

const summarizeVideoPrompt = ai.definePrompt({
  name: 'summarizeVideoPrompt',
  input: {schema: SummarizeUploadedVideoInputSchema},
  output: {schema: z.string().describe('A textual summary of the video.')},
  prompt: `You are an AI video summarizer for the visually impaired.

  Analyze the video provided (represented by its data URI) and generate a concise textual summary of its key scenes, describing the objects, people, and actions present in each scene.

  Video: {{media url=videoDataUri}}`,
});

const generateAudioPrompt = ai.definePrompt({
  name: 'generateAudioPrompt',
  input: {schema: z.string().describe('A textual summary of the scene.')},
  output: {schema: z.any()},
  prompt: `Generate audio narration for the following text. Return base64 encoded WAV data URI.
  Text: {{{$input}}}`, //Use handlebars input accessor syntax
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const summarizeUploadedVideoFlow = ai.defineFlow(
  {
    name: 'summarizeUploadedVideoFlow',
    inputSchema: SummarizeUploadedVideoInputSchema,
    outputSchema: SummarizeUploadedVideoOutputSchema,
  },
  async input => {
    // Dummy implementation: Replace with actual video analysis and summarization logic.
    const sceneSummaries: SummarizeUploadedVideoOutput['sceneSummaries'] = [];
    for (let i = 0; i < 3; i++) {
      const timestamp = i * 10; // Example: Summarize every 10 seconds.
      const {output: summary} = await summarizeVideoPrompt(input);
      if (!summary) {
        throw new Error('no summary returned');
      }

      const { media } = await ai.generate({
        model: 'googleai/gemini-2.5-flash-preview-tts',
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Algenib' },
            },
          },
        },
        prompt: summary,
      });

      if (!media) {
        throw new Error('no media returned');
      }
      const audioBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
      );
      const audio = 'data:audio/wav;base64,' + (await toWav(audioBuffer));

      sceneSummaries.push({
        timestamp,
        summary,
        audio,
      });
    }

    return {sceneSummaries};
  }
);
