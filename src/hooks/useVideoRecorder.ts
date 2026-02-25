import { useState, useRef, useCallback } from "react";

export function useVideoRecorder() {
    const [isRecording, setIsRecording] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [duration, setDuration] = useState(0);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startRecording = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "user"
                },
                audio: true
            });

            setStream(mediaStream);
            const mediaRecorder = new MediaRecorder(mediaStream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "video/webm" });
                const url = URL.createObjectURL(blob);
                setVideoUrl(url);
                mediaStream.getTracks().forEach((track) => track.stop());
                setStream(null);
            };

            mediaRecorder.start();
            setIsRecording(true);
            setDuration(0);

            timerRef.current = setInterval(() => {
                setDuration((d) => d + 1);
            }, 1000);
        } catch (err) {
            console.error("Failed to start video recording:", err);
            throw err;
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    }, [isRecording]);

    const clearRecording = useCallback(() => {
        if (videoUrl) {
            URL.revokeObjectURL(videoUrl);
        }
        setVideoUrl(null);
        setDuration(0);
    }, [videoUrl]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const [isMuted, setIsMuted] = useState(false);

    const toggleMute = useCallback(() => {
        if (stream) {
            const audioTracks = stream.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = isMuted; // Toggle based on current state
            });
            setIsMuted(!isMuted);
        }
    }, [stream, isMuted]);

    return {
        isRecording,
        videoUrl,
        stream,
        isMuted,
        duration,
        formattedDuration: formatDuration(duration),
        startRecording,
        stopRecording,
        clearRecording,
        toggleMute,
    };
}
