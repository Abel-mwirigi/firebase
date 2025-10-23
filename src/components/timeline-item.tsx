import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TimelineItemProps {
  timestamp: number;
  summary: string;
  audioDataUri: string;
  onClick: (timestamp: number, audioDataUri: string) => void;
  isActive: boolean;
}

export function TimelineItem({ timestamp, summary, audioDataUri, onClick, isActive }: TimelineItemProps) {
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={cn(
      "transition-all duration-300 bg-card/50",
      isActive ? 'border-primary shadow-lg ring-2 ring-primary' : 'border-border'
    )}>
      <CardContent className="p-4 flex items-center gap-4">
        <Button 
          variant={isActive ? 'default' : 'outline'}
          size="icon" 
          className={cn(
            "flex-shrink-0 w-12 h-12 rounded-full", 
            isActive 
              ? "bg-accent text-accent-foreground" 
              : "border-accent text-accent hover:bg-accent hover:text-accent-foreground"
          )}
          onClick={() => onClick(timestamp, audioDataUri)}
          aria-label={isActive ? `Pause narration for scene at ${formatTime(timestamp)}` : `Play narration for scene at ${formatTime(timestamp)}`}
        >
          {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </Button>
        <div className="flex-1">
          <p className="font-bold font-mono text-sm text-foreground">{formatTime(timestamp)}</p>
          <p className="text-sm text-muted-foreground">{summary}</p>
        </div>
      </CardContent>
    </Card>
  );
}
