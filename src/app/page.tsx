"use client";

import { useState } from "react";
import type { SummarizeUploadedVideoOutput } from "@/ai/flows/summarize-uploaded-video";
import { summarizeUploadedVideo } from "@/ai/flows/summarize-uploaded-video";

import { Header } from "@/components/header";
import { UploadSection } from "@/components/upload-section";
import { AnalysisSection } from "@/components/analysis-section";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [analysisOutput, setAnalysisOutput] = useState<SummarizeUploadedVideoOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [videoSource, setVideoSource] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async (videoDataUri: string) => {
    setIsLoading(true);
    setVideoSource(videoDataUri);
    setAnalysisOutput(null);

    try {
      const result = await summarizeUploadedVideo({ videoDataUri });
      setAnalysisOutput(result);
    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "There was an error processing the video. Please try again.",
      });
      setVideoSource(null); // Reset on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysisOutput(null);
    setVideoSource(null);
    setIsLoading(false);
  };

  const LoadingState = () => (
    <div className="container mx-auto py-12 px-4 md:px-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-headline font-semibold text-foreground">Analyzing your video...</h2>
        <p className="text-muted-foreground">This may take a few moments. Please wait.</p>
      </div>
      <div className="grid md:grid-cols-5 gap-8 items-start">
        <div className="md:col-span-3">
          <Skeleton className="w-full aspect-video rounded-lg" />
        </div>
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        {!videoSource && !isLoading && <UploadSection onAnalyze={handleAnalyze} />}
        {isLoading && <LoadingState />}
        {!isLoading && analysisOutput && videoSource && (
          <AnalysisSection 
            videoSource={videoSource}
            analysisOutput={analysisOutput}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
}
