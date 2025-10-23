import { config } from 'dotenv';
import * as path from 'path';

// Load .env.local first, then fall back to .env
config({ path: path.resolve(process.cwd(), '.env.local') });
config();

import '@/ai/flows/navigate-video-via-summaries.ts';
import '@/ai/flows/summarize-uploaded-video.ts';
import '@/ai/flows/generate-audio-narration.ts';
