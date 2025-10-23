"use client";

import { useState } from 'react';
import Image from 'next/image';
import { UploadCloud } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface UploadSectionProps {
  onAnalyze: (videoDataUri: string) => void;
}

export function UploadSection({ onAnalyze }: UploadSectionProps) {
  const [videoDataUri, setVideoDataUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const { toast } = useToast();
  const visual = PlaceHolderImages.find(img => img.id === 'upload-visual');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50 MB limit
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: "Please upload a video file smaller than 50MB.",
        });
        return;
      }
      
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        setVideoDataUri(e.target?.result as string);
      };
      reader.onerror = () => {
        toast({
          variant: "destructive",
          title: "File Read Error",
          description: "Could not read the selected file. Please try again.",
        });
        setFileName(null);
        setVideoDataUri(null);
      }
      reader.readAsDataURL(file);
    }
  };
  
  const handleFileSubmit = () => {
    if (videoDataUri) {
      onAnalyze(videoDataUri);
    } else {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a video file to analyze.",
      });
    }
  };

  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-foreground">
            Understand Any Video
          </h2>
          <p className="text-lg text-muted-foreground">
            Upload a video, and SightGuide will describe what's happening, scene by scene,
            providing audio narration for a rich, accessible experience.
          </p>
          <Card className="bg-card shadow-md">
            <CardContent className="p-6">
              <Tabs defaultValue="upload">
                <TabsList className="grid w-full grid-cols-1">
                  <TabsTrigger value="upload">Upload File</TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="mt-6">
                  <div className="space-y-4">
                     <div className="relative border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-sm text-muted-foreground">
                          Drag & drop or click to select a video file. (Max 50MB)
                        </p>
                        <Input 
                          id="file-upload" 
                          type="file" 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                          accept="video/*"
                          onChange={handleFileChange}
                          aria-label="Video file upload"
                        />
                      </div>
                    {fileName && <p className="text-sm text-center text-foreground font-medium">Selected: {fileName}</p>}
                    <Button onClick={handleFileSubmit} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="lg" disabled={!videoDataUri}>
                      Analyze Video
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        <div className="hidden md:block">
          {visual && (
            <Image
              src={visual.imageUrl}
              alt={visual.description}
              data-ai-hint={visual.imageHint}
              width={800}
              height={600}
              className="rounded-xl shadow-lg object-cover aspect-[4/3]"
              priority
            />
          )}
        </div>
      </div>
    </section>
  );
}
