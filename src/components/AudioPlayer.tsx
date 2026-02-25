import { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

interface AudioPlayerProps {
  audioUrl?: string;
  className?: string;
}

export default function AudioPlayer({ audioUrl, className = "" }: AudioPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleEnded = () => {
      setPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const restart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      if (!playing) {
        audioRef.current.play();
        setPlaying(true);
      }
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const bars = [3, 5, 8, 4, 7, 6, 9, 3, 6, 8, 5, 7, 4, 6, 3, 8, 5, 7, 4, 9];

  if (!audioUrl) return null;

  return (
    <div className={`flex items-center gap-3 rounded-xl bg-accent/50 px-4 py-3 ${className}`}>
      <audio ref={audioRef} src={audioUrl} />

      <button
        onClick={togglePlay}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
      </button>

      <button
        onClick={restart}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        title="Restart"
      >
        <RotateCcw className="h-4 w-4" />
      </button>

      <div className="flex flex-1 items-end gap-[2px] h-8 cursor-pointer group" onClick={(e) => {
        if (audioRef.current) {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const pct = x / rect.width;
          audioRef.current.currentTime = pct * audioRef.current.duration;
        }
      }}>
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-full bg-primary/30 transition-all duration-150"
            style={{
              height: playing
                ? `${Math.max(4, h * (Math.sin(Date.now() / 200 + i) * 0.5 + 0.5) * 3)}px`
                : `${h}px`,
              opacity: i / bars.length <= progress / 100 ? 1 : 0.3,
              backgroundColor: i / bars.length <= progress / 100 ? "hsl(var(--primary))" : undefined,
            }}
          />
        ))}
      </div>

      <span className="text-xs text-muted-foreground tabular-nums min-w-[70px] text-right">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
    </div>
  );
}

