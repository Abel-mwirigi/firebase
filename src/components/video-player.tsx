import { forwardRef } from 'react';

interface VideoPlayerProps {
  src: string;
}

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(({ src }, ref) => {
  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-black ring-1 ring-border">
      <video
        ref={ref}
        src={src}
        controls
        className="w-full h-full object-contain"
        aria-label="Video content"
      />
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';
