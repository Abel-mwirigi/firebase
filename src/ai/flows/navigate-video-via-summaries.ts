'use server';
/**
 * @fileOverview A flow to generate scene summaries for video navigation, tailored for visually impaired users.
 *
 * - navigateVideoViaSummaries - A function that takes a video and generates scene summaries for timeline navigation.
 * - NavigateVideoViaSummariesInput - The input type for the navigateVideoViaSummaries function.
 * - NavigateVideoViaSummariesOutput - The return type for the navigateVideoViaSummaries function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const NavigateVideoViaSummariesInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  numberOfSummaries: z
    .number()
    .default(10)
    .describe('The number of scene summaries to generate for the video.'),
});
export type NavigateVideoViaSummariesInput = z.infer<typeof NavigateVideoViaSummariesInputSchema>;

const SceneSummarySchema = z.object({
  timestamp: z.number().describe('The timestamp of the scene in seconds.'),
  summary: z.string().describe('A concise textual summary of the scene.'),
  narration: z.string().describe('Audio narration of the scene summary in base64 WAV format.'),
});
export type SceneSummary = z.infer<typeof SceneSummarySchema>;

const NavigateVideoViaSummariesOutputSchema = z.array(SceneSummarySchema);
export type NavigateVideoViaSummariesOutput = z.infer<typeof NavigateVideoViaSummariesOutputSchema>;

export async function navigateVideoViaSummaries(
  input: NavigateVideoViaSummariesInput
): Promise<NavigateVideoViaSummariesOutput> {
  return navigateVideoViaSummariesFlow(input);
}

const navigateVideoViaSummariesPrompt = ai.definePrompt({
  name: 'navigateVideoViaSummariesPrompt',
  input: {schema: NavigateVideoViaSummariesInputSchema},
  output: {schema: NavigateVideoViaSummariesOutputSchema},
  prompt: `You are an AI video analyst, tasked with creating scene summaries for visually impaired users.

Analyze the video and generate {{{numberOfSummaries}}} scene summaries. Each summary should include the timestamp of the scene and a concise textual description of the scene's content. Then generate a narration from the scene summary.

Video: {{media url=videoDataUri}}`,
});

const ttsPrompt = ai.definePrompt({
  name: 'ttsPrompt',
  input: {schema: z.string()},
  output: {schema: z.string()},
  prompt: `Generate audio narration for the following text: {{{text}}}`,
});

async function textToSpeech(text: string): Promise<string> {
  const {media} = await ai.generate({
    model: 'googleai/gemini-2.5-flash-preview-tts',
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
    throw new Error('no media returned');
  }
  const audioBuffer = Buffer.from(
    media.url.substring(media.url.indexOf(',') + 1),
    'base64'
  );
  return 'data:audio/wav;base64,' + (await toWav(audioBuffer));
}

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

const navigateVideoViaSummariesFlow = ai.defineFlow(
  {
    name: 'navigateVideoViaSummariesFlow',
    inputSchema: NavigateVideoViaSummariesInputSchema,
    outputSchema: NavigateVideoViaSummariesOutputSchema,
  },
  async input => {
    // Dummy implementation for now.
    // TODO: Implement video analysis and scene summarization logic.
    const dummySummaries: SceneSummary[] = [];
    for (let i = 0; i < input.numberOfSummaries; i++) {
      const timestamp = Math.floor(Math.random() * 60); // Random timestamp
      const summary = `Scene at ${timestamp} seconds.`;
      const narration = await textToSpeech(summary);
      dummySummaries.push({
        timestamp: timestamp,
        summary: summary,
        narration: narration,
      });
    }
    return dummySummaries;
    // const {output} = await navigateVideoViaSummariesPrompt(input);
    // return output!;
  }
);
