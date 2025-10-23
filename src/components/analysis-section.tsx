"use client";

import { useRef, useState, useEffect } from 'react';
import type { SummarizeUploadedVideoOutput } from '@/ai/flows/summarize-uploaded-video';
import { VideoPlayer } from './video-player';
import { TimelineItem } from './timeline-item';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface AnalysisSectionProps {
  videoSource: string;
  analysisOutput: SummarizeUploadedVideoOutput;
  onReset: () => void;
}

export function AnalysisSection({ videoSource, analysisOutput, onReset }: AnalysisSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeAudio, setActiveAudio] = useState<HTMLAudioElement | null>(null);
  const [activeTimestamp, setActiveTimestamp] = useState<number | null>(null);

  useEffect(() => {
    // Cleanup audio on component unmount
    return () => {
      if (activeAudio) {
        activeAudio.pause();
      }
    };
  }, [activeAudio]);

  const handleTimelineItemClick = (timestamp: number, audioDataUri: string) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      // Optional: auto-play video when summary is clicked
      // videoRef.current.play(); 
    }

    if (activeAudio) {
      activeAudio.pause();
    }
    
    // If clicking the currently active item, just pause it.
    if (timestamp === activeTimestamp) {
        setActiveAudio(null);
        setActiveTimestamp(null);
        return;
    }
    
    const newAudio = new Audio(audioDataUri);
    newAudio.play();
    setActiveAudio(newAudio);
    setActiveTimestamp(timestamp);

    newAudio.onended = () => {
      setActiveAudio(null);
      setActiveTimestamp(null);
    }
  };

  return (
    <section className="container mx-auto py-8 px-4 md:px-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={onReset} className="text-foreground hover:bg-muted">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Analyze another video
        </Button>
      </div>
      <div className="grid lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-3">
          <VideoPlayer ref={videoRef} src={videoSource} />
        </div>
        <div className="lg:col-span-2">
          <Card className="h-full bg-card">
            <CardHeader>
              <CardTitle className="font-headline text-card-foreground">Scene Summaries</CardTitle>
              <CardDescription>Click play to hear the narration for each scene.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(60vh)] pr-4">
                <div className="space-y-4">
                  {analysisOutput.sceneSummaries.sort((a, b) => a.timestamp - b.timestamp).map((summary, index) => (
                    <TimelineItem
                      key={index}
                      timestamp={summary.timestamp}
                      summary={summary.summary}
                      audioDataUri={summary.audio}
                      onClick={handleTimelineItemClick}
                      isActive={summary.timestamp === activeTimestamp}
                    />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
