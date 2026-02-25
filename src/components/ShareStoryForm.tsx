import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Send, User, UserX, Image as ImageIcon, X, Video, VideoOff, Camera, Volume2, VolumeX, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import WritingPrompts from "./WritingPrompts";
import type { StoryCategory, Story } from "@/types/story";
import { useStories } from "@/hooks/useStories";
import { useVideoRecorder } from "@/hooks/useVideoRecorder";
import Sanscript from "sanscript";
import { PlusCircle, Layers, Trash } from "lucide-react";

interface ShareStoryFormProps {
  initialData?: Story;
  isEditing?: boolean;
}

export default function ShareStoryForm({ initialData, isEditing = false }: ShareStoryFormProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [category, setCategory] = useState<StoryCategory>(initialData?.category || "Community");
  const [identityMode, setIdentityMode] = useState<"public" | "anonymous" | "pseudonym">(
    initialData?.isAnonymous ? "anonymous" : "public"
  );
  const [pseudonym, setPseudonym] = useState(initialData?.isAnonymous ? "" : initialData?.author || "");
  const [locationName, setLocationName] = useState(initialData?.location?.name || "");
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [video, setVideo] = useState<string | null>(initialData?.videoUrl || null);
  const [language, setLanguage] = useState(initialData?.language || "en");
  const [isPhonetic, setIsPhonetic] = useState(false);
  const [queuedStories, setQueuedStories] = useState<Partial<Story>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stories, updateStory } = useStories();
  const { isRecording, audioUrl, formattedDuration, startRecording, stopRecording, clearRecording } = useAudioRecorder();
  const {
    isRecording: isVideoRecording,
    videoUrl: recordedVideoUrl,
    stream: videoStream,
    isMuted: isVideoMuted,
    formattedDuration: videoDuration,
    startRecording: startVideoRecording,
    stopRecording: stopVideoRecording,
    clearRecording: clearVideoRecording,
    toggleMute: toggleVideoMute
  } = useVideoRecorder();

  const previewVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoStream && previewVideoRef.current) {
      previewVideoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  // Sync internal video state with recorded video
  useEffect(() => {
    if (recordedVideoUrl) {
      setVideo(recordedVideoUrl);
    }
  }, [recordedVideoUrl]);

  const handlePromptInsert = (promptText: string) => {
    setContent((prev) => prev + (prev ? "\n\n" : "") + "/* " + promptText + " */\n");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));

      if (images.length + imageFiles.length > 5) {
        toast({
          title: "Limit exceeded",
          description: "You translation can only have up to 5 images.",
          variant: "destructive",
        });
        return;
      }

      for (const file of imageFiles) {
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} is larger than 10MB.`,
            variant: "destructive",
          });
          continue;
        }

        const reader = new FileReader();
        const promise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
        });
        reader.readAsDataURL(file);
        newImages.push(await promise);
      }

      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a video smaller than 50MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setVideo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user && identityMode === "public") {
      toast({
        title: "Sign in required",
        description: "Please sign in to post as yourself, or choose another identity mode.",
        variant: "destructive",
      });
      return;
    }

    let finalAudioUrl = audioUrl || initialData?.audioUrl;

    // If we have a local blob URL, convert it to Base64 for persistent storage in localStorage
    if (audioUrl && audioUrl.startsWith("blob:")) {
      try {
        const response = await fetch(audioUrl);
        const blob = await response.blob();
        finalAudioUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.error("Failed to persist audio:", err);
      }
    }

    let finalVideoUrl = video;
    if (video && video.startsWith("blob:")) {
      try {
        const response = await fetch(video);
        const blob = await response.blob();
        finalVideoUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.error("Failed to persist video:", err);
      }
    }

    if (isEditing && initialData) {
      const updatedStory: Partial<Story> = {
        title,
        content,
        excerpt: content.slice(0, 150) + (content.length > 150 ? "..." : ""),
        category: (category as StoryCategory) || "Personal",
        images: images.length > 0 ? images : initialData.images,
        location: locationName ? { name: locationName, lat: initialData.location?.lat || 40.71, lng: initialData.location?.lng || -74.01 } : undefined,
        audioUrl: finalAudioUrl,
        hasAudio: !!finalAudioUrl,
        videoUrl: (finalVideoUrl as string) || initialData.videoUrl,
        hasVideo: !!finalVideoUrl || !!initialData.videoUrl,
        language,
      };

      updateStory(initialData.id, updatedStory);
      toast({
        title: "Story updated! ✨",
        description: "Your changes have been saved to the community archive.",
      });
      navigate(`/story/${initialData.id}`);
    } else {
      const storiesToSubmit = queuedStories.length > 0
        ? [...queuedStories, {
          title,
          content,
          excerpt: content.slice(0, 150) + (content.length > 150 ? "..." : ""),
          author: identityMode === "public" ? user?.name || "User" : identityMode === "pseudonym" ? pseudonym || "Contributor" : "Anonymous Storyteller",
          authorInitials: identityMode === "public" ? (user?.name || "U").split(" ").map(n => n[0]).join("") : identityMode === "pseudonym" ? (pseudonym || "C").split(" ").map(n => n[0]).join("") : "AS",
          timeAgo: "Just now",
          category: (category as StoryCategory) || "Personal",
          images: images.length > 0 ? images : ["https://placehold.co/800x400/312e81/ffffff?text=Echoes+of+Community"],
          isAnonymous: identityMode === "anonymous",
          hasAudio: !!finalAudioUrl,
          hasVideo: !!finalVideoUrl,
          location: locationName ? { name: locationName, lat: 40.71, lng: -74.01 } : undefined,
          audioUrl: finalAudioUrl || undefined,
          videoUrl: (finalVideoUrl as string) || undefined,
          status: "approved",
          language,
        }]
        : [{
          title,
          content,
          excerpt: content.slice(0, 150) + (content.length > 150 ? "..." : ""),
          author: identityMode === "public" ? user?.name || "User" : identityMode === "pseudonym" ? pseudonym || "Contributor" : "Anonymous Storyteller",
          authorInitials: identityMode === "public" ? (user?.name || "U").split(" ").map(n => n[0]).join("") : identityMode === "pseudonym" ? (pseudonym || "C").split(" ").map(n => n[0]).join("") : "AS",
          timeAgo: "Just now",
          category: (category as StoryCategory) || "Personal",
          images: images.length > 0 ? images : ["https://placehold.co/800x400/312e81/ffffff?text=Echoes+of+Community"],
          isAnonymous: identityMode === "anonymous",
          hasAudio: !!finalAudioUrl,
          hasVideo: !!finalVideoUrl,
          location: locationName ? { name: locationName, lat: 40.71, lng: -74.01 } : undefined,
          audioUrl: finalAudioUrl || undefined,
          videoUrl: (finalVideoUrl as string) || undefined,
          status: "approved",
          language,
        }];

      try {
        const token = localStorage.getItem("echoes_token");
        const isBulk = storiesToSubmit.length > 1;
        const endpoint = isBulk ? "/api/stories/bulk" : "/api/stories";
        const body = isBulk ? storiesToSubmit : storiesToSubmit[0];

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });

        if (response.ok) {
          toast({
            title: isBulk ? "Stories shared! 🌟" : "Story shared! 🌟",
            description: isBulk
              ? `Successfully shared ${storiesToSubmit.length} stories with the community.`
              : "Your story has been shared successfully with the community.",
            duration: 4000,
          });
          navigate("/stories");
        } else {
          const errorData = await response.json();
          toast({
            title: "Submission failed",
            description: errorData.message || "Failed to share your story.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Story submission error:", error);
        toast({
          title: "Submission failed",
          description: "A network error occurred.",
          variant: "destructive"
        });
      }
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategory(initialData?.category || "Community");
    setImages(initialData?.images || []);
    setVideo(null);
    clearRecording();
    clearVideoRecording();
  };

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast({
        title: "Incomplete story",
        description: "Please provide at least a title and content.",
        variant: "destructive",
      });
      return;
    }

    const storyToQueue: Partial<Story> = {
      title,
      content,
      excerpt: content.slice(0, 150) + (content.length > 150 ? "..." : ""),
      author: identityMode === "public" ? user?.name || "User" : identityMode === "pseudonym" ? pseudonym || "Contributor" : "Anonymous Storyteller",
      authorInitials: identityMode === "public" ? (user?.name || "U").split(" ").map(n => n[0]).join("") : identityMode === "pseudonym" ? (pseudonym || "C").split(" ").map(n => n[0]).join("") : "AS",
      timeAgo: "Just now",
      category: (category as StoryCategory) || "Personal",
      images: images.length > 0 ? images : ["https://placehold.co/800x400/312e81/ffffff?text=Echoes+of+Community"],
      isAnonymous: identityMode === "anonymous",
      hasAudio: !!audioUrl,
      hasVideo: !!video,
      location: locationName ? { name: locationName, lat: 40.71, lng: -74.01 } : undefined,
      audioUrl: audioUrl || undefined,
      videoUrl: (video as string) || undefined,
      language,
    };

    setQueuedStories(prev => [...prev, storyToQueue]);
    resetForm();
    toast({
      title: "Story added to queue! 📥",
      description: "You can add more stories or share them all now.",
    });
  };

  const removeFromQueue = (index: number) => {
    setQueuedStories(prev => prev.filter((_, i) => i !== index));
  };

  const transliterate = (text: string, lang: string) => {
    const schemeMap: Record<string, string> = {
      te: "telugu",
      hi: "devanagari",
      ta: "tamil",
      kn: "kannada",
    };

    const scheme = schemeMap[lang];
    if (!scheme || !isPhonetic) return text;

    try {
      // Sanscript might be imported as default or as a module depending on environment
      const sans = Sanscript as unknown as {
        t?: (text: string, from: string, to: string) => string;
        default?: { t?: (text: string, from: string, to: string) => string };
        Sanscript?: { t?: (text: string, from: string, to: string) => string };
      };
      const tFunc = sans.t || sans.default?.t || sans.Sanscript?.t;
      if (typeof tFunc === 'function') {
        return tFunc(text, "itrans", scheme);
      }
      return text;
    } catch (e) {
      console.error("Transliteration error:", e);
      return text;
    }
  };

  const handleTitleChange = (val: string) => {
    if (isPhonetic && val.length > title.length) {
      const lastChar = val.slice(-1);
      if ([" ", ".", ",", "!", "?", "\n"].includes(lastChar)) {
        const parts = val.split(/(\s+)/);
        for (let i = 0; i < parts.length; i++) {
          if (/^[A-Za-z0-9^~._]+$/.test(parts[i])) {
            parts[i] = transliterate(parts[i], language);
          }
        }
        setTitle(parts.join(""));
        return;
      }
    }
    setTitle(val);
  };

  const handleContentChange = (val: string) => {
    if (isPhonetic && val.length > content.length) {
      const lastChar = val.slice(-1);
      if ([" ", ".", ",", "!", "?", "\n"].includes(lastChar)) {
        const parts = val.split(/(\s+)/);
        for (let i = 0; i < parts.length; i++) {
          if (/^[A-Za-z0-9^~._]+$/.test(parts[i])) {
            parts[i] = transliterate(parts[i], language);
          }
        }
        setContent(parts.join(""));
        return;
      }
    }
    setContent(val);
  };

  const isRegional = ["te", "hi", "ta", "kn"].includes(language);


  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold font-serif mb-2">{isEditing ? t("share.edit") : t("share.title")}</h1>
        <p className="text-muted-foreground">{isEditing ? "Update your shared reflection" : "Share a reflection, memory, or feeling with your community"}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {queuedStories.length > 0 && (
          <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 mb-8">
            <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
              <Layers className="h-4 w-4" /> Queued Stories ({queuedStories.length})
            </h3>
            <div className="space-y-3">
              {queuedStories.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between bg-card p-3 rounded-xl border border-border/50">
                  <span className="text-sm font-medium truncate max-w-[70%]">{s.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{s.category}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeFromQueue(idx)}
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Input
            placeholder={t("share.title_input")}
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-lg font-medium border-none bg-accent/30 px-4 h-14 rounded-xl focus-visible:ring-primary/20"
            required
            lang={language}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={category} onValueChange={(val) => setCategory(val as StoryCategory)}>
              <SelectTrigger className="h-12 rounded-xl bg-accent/30 border-none">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Personal">Personal Reflection</SelectItem>
                <SelectItem value="Community">Community Story</SelectItem>
                <SelectItem value="History">Historical Memory</SelectItem>
                <SelectItem value="Culture">Cultural Heritage</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex flex-col gap-2">
              <Select value={language} onValueChange={(val) => {
                setLanguage(val);
                if (!["te", "hi", "ta", "kn"].includes(val)) setIsPhonetic(false);
              }}>
                <SelectTrigger className="h-12 rounded-xl bg-accent/30 border-none">
                  <div className="flex items-center gap-2">
                    <Languages className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Language" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                  <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                  <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                  <SelectItem value="kn">ಕನ್ನಡ (Kannada)</SelectItem>
                </SelectContent>
              </Select>

              {isRegional && (
                <div className="mt-2 flex items-center justify-between rounded-xl bg-primary/5 px-4 py-2 border border-primary/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-primary">Phonetic Typing Mode</span>
                  </div>
                  <Switch
                    checked={isPhonetic}
                    onCheckedChange={setIsPhonetic}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              )}
              {isPhonetic && (
                <p className="text-[10px] text-muted-foreground/70 px-1 italic">
                  Tip: Type in English and press Space to convert into {language === 'te' ? 'Telugu' : language === 'hi' ? 'Hindi' : language === 'ta' ? 'Tamil' : 'Kannada'}.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Your Story</Label>
          <Textarea
            id="content"
            placeholder="Tell your story... Take your time. There's no rush."
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            rows={8}
            required
            className="resize-none leading-relaxed"
            lang={language}
          />
        </div>

        {/* Writing Prompts */}
        <WritingPrompts onInsert={handlePromptInsert} />

        {/* Audio Recording */}
        <div className="rounded-xl border border-border/50 bg-accent/30 p-4">
          <Label className="mb-3 block text-sm">Voice Story (optional)</Label>
          <div className="flex items-center gap-3">
            {!audioUrl ? (
              <Button
                type="button"
                variant={isRecording ? "destructive" : "outline"}
                size="sm"
                onClick={isRecording ? stopRecording : startRecording}
                className="gap-2 rounded-full"
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isRecording ? `Stop (${formattedDuration})` : "Record Voice Story"}
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <audio src={audioUrl} controls className="h-8" />
                <Button type="button" variant="ghost" size="sm" onClick={clearRecording}>
                  Remove
                </Button>
              </div>
            )}
            {isRecording && (
              <span className="flex items-center gap-1 text-xs text-destructive">
                <span className="h-2 w-2 animate-pulse-gentle rounded-full bg-destructive" />
                Recording...
              </span>
            )}
          </div>
        </div>

        {/* Identity Mode */}
        <div className="rounded-xl border border-border/50 bg-accent/30 p-4 space-y-3">
          <Label className="text-sm">How would you like to share?</Label>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { value: "public", label: "As myself", icon: User },
                { value: "pseudonym", label: "Pseudonym", icon: User },
                { value: "anonymous", label: "Anonymously", icon: UserX },
              ] as const
            ).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  if (value === "public" && !user) {
                    toast({
                      title: "Authentication needed",
                      description: "Please sign in to post as yourself.",
                      variant: "destructive",
                    });
                    return;
                  }
                  setIdentityMode(value);
                }}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${identityMode === value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
          {user && identityMode === "public" && (
            <p className="text-xs text-muted-foreground">Sharing as <span className="font-medium text-foreground">{user.name}</span></p>
          )}
          {identityMode === "pseudonym" && (
            <Input
              placeholder="Choose a pen name..."
              value={pseudonym}
              onChange={(e) => setPseudonym(e.target.value)}
              className="mt-2"
            />
          )}
          {identityMode === "anonymous" && (
            <p className="text-xs text-muted-foreground">
              Your story will be shared as "Anonymous Storyteller" 🌿
            </p>
          )}
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location (optional)</Label>
          <Input
            id="location"
            placeholder="Where did this story take place?"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
          />
        </div>

        {/* Image upload area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div
              className={`relative rounded-xl border-2 border-dashed border-border/50 p-6 text-center cursor-pointer hover:border-primary/50 transition-colors ${images.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => images.length < 5 && fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={images.length >= 5}
              />
              <div className="py-2">
                <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground font-medium">Add Photos ({images.length}/5)</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Select multiple photos, up to 10MB each</p>
              </div>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-border/50">
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(idx);
                      }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    {idx === 0 && (
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-primary/90 text-white text-[10px] font-bold rounded-full">
                        Cover
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            className="relative rounded-xl border-2 border-dashed border-border/50 p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => videoInputRef.current?.click()}
          >
            <input
              type="file"
              ref={videoInputRef}
              className="hidden"
              accept="video/*"
              onChange={handleVideoUpload}
            />

            {video ? (
              <div className="relative inline-block w-full">
                <video src={video} className="mx-auto max-h-40 rounded-lg shadow-sm" controls poster={images[0] || undefined} />
                <button
                  type="button"
                  className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    setVideo(null);
                    clearVideoRecording();
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : isVideoRecording ? (
              <div className="relative">
                <video
                  ref={previewVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="mx-auto max-h-40 rounded-lg bg-black mirror"
                />
                <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  Recording {videoDuration}
                </div>
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); toggleVideoMute(); }}
                    className="h-8 w-8 rounded-full bg-card/80 backdrop-blur-sm"
                    title={isVideoMuted ? "Unmute" : "Mute"}
                  >
                    {isVideoMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); stopVideoRecording(); }}
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 gap-2 rounded-full h-8 px-4"
                >
                  <VideoOff className="h-3 w-3" />
                  Stop
                </Button>
              </div>
            ) : (
              <div className="py-2 space-y-3">
                <div className="flex justify-center gap-4">
                  <div className="flex flex-col items-center">
                    <Video className="h-6 w-6 text-muted-foreground/50" />
                    <p className="mt-1 text-xs text-muted-foreground">Upload</p>
                  </div>
                  <div className="w-px h-8 bg-border/50 self-center" />
                  <div
                    className="flex flex-col items-center hover:text-primary transition-colors"
                    onClick={(e) => { e.stopPropagation(); startVideoRecording(); }}
                  >
                    <Camera className="h-6 w-6 text-primary" />
                    <p className="mt-1 text-xs text-primary font-medium">Record</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Video Reflection</p>
                  <p className="text-xs text-muted-foreground/60">Upload MP4 or record live</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {!isEditing && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1 gap-2 rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
              onClick={handleAddToQueue}
            >
              <PlusCircle className="h-4 w-4" />
              Add Another Story
            </Button>
          )}
          <Button type="submit" size="lg" className="flex-[2] gap-2 rounded-full shadow-lg shadow-primary/20">
            <Send className="h-4 w-4" />
            {isEditing
              ? "Update Story"
              : queuedStories.length > 0
                ? `Share All Stories (${queuedStories.length + 1})`
                : "Share Your Story"
            }
          </Button>
        </div>
      </form>
    </>
  );
}
