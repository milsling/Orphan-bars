import React, { useState, useMemo } from "react";
import { ExternalLink, Music, Play, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type MediaProvider = "youtube" | "soundcloud" | "spotify" | "unknown";

interface MediaInfo {
  provider: MediaProvider;
  embedUrl: string;
  displayName: string;
}

function parseMediaUrl(url: string): MediaInfo | null {
  if (!url) return null;
  
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace("www.", "");
    
    if (hostname === "youtube.com" || hostname === "youtu.be") {
      let videoId: string | null = null;
      
      if (hostname === "youtu.be") {
        videoId = parsed.pathname.slice(1);
      } else if (parsed.pathname === "/watch") {
        videoId = parsed.searchParams.get("v");
      } else if (parsed.pathname.startsWith("/embed/")) {
        videoId = parsed.pathname.replace("/embed/", "");
      }
      
      if (videoId) {
        return {
          provider: "youtube",
          embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0`,
          displayName: "YouTube"
        };
      }
    }
    
    if (hostname === "soundcloud.com") {
      return {
        provider: "soundcloud",
        embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`,
        displayName: "SoundCloud"
      };
    }
    
    if (hostname === "open.spotify.com") {
      const match = parsed.pathname.match(/\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/);
      if (match) {
        const [, type, id] = match;
        return {
          provider: "spotify",
          embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
          displayName: "Spotify"
        };
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

interface BarMediaPlayerProps {
  beatLink: string;
  compact?: boolean;
}

export function BarMediaPlayer({ beatLink, compact = false }: BarMediaPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const mediaInfo = useMemo(() => parseMediaUrl(beatLink), [beatLink]);
  
  if (!mediaInfo) {
    return (
      <a
        href={beatLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        <Music className="h-3 w-3" />
        <span>Beat Link</span>
        <ExternalLink className="h-3 w-3" />
      </a>
    );
  }
  
  const providerColors: Record<MediaProvider, string> = {
    youtube: "bg-red-500/10 text-red-500 border-red-500/30",
    soundcloud: "bg-orange-500/10 text-orange-500 border-orange-500/30",
    spotify: "bg-green-500/10 text-green-500 border-green-500/30",
    unknown: "bg-muted text-muted-foreground border-border"
  };

  const providerIcons: Record<MediaProvider, React.ReactElement> = {
    youtube: <Play className="h-3 w-3" />,
    soundcloud: <Volume2 className="h-3 w-3" />,
    spotify: <Music className="h-3 w-3" />,
    unknown: <Music className="h-3 w-3" />
  };
  
  if (compact && !isExpanded) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(true)}
        className={`h-7 px-2 gap-1.5 text-xs border ${providerColors[mediaInfo.provider]}`}
        data-testid="button-expand-beat"
      >
        {providerIcons[mediaInfo.provider]}
        <span>Play Beat</span>
      </Button>
    );
  }
  
  const getIframeHeight = () => {
    switch (mediaInfo.provider) {
      case "youtube":
        return "200";
      case "soundcloud":
        return "166";
      case "spotify":
        return "152";
      default:
        return "200";
    }
  };
  
  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded border ${providerColors[mediaInfo.provider]}`}>
          {providerIcons[mediaInfo.provider]}
          <span>{mediaInfo.displayName} Beat</span>
        </div>
        {compact && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="h-6 text-xs text-muted-foreground"
            data-testid="button-collapse-beat"
          >
            Collapse
          </Button>
        )}
      </div>
      <div className="rounded-lg overflow-hidden border border-border/50">
        <iframe
          src={mediaInfo.embedUrl}
          width="100%"
          height={getIframeHeight()}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
          title={`${mediaInfo.displayName} beat player`}
        />
      </div>
    </div>
  );
}

export function validateBeatUrl(url: string): { valid: boolean; provider?: string; error?: string } {
  if (!url.trim()) return { valid: true };
  
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace("www.", "");
    
    const allowedHosts = [
      "youtube.com",
      "youtu.be",
      "soundcloud.com",
      "open.spotify.com",
      "audiomack.com"
    ];
    
    if (allowedHosts.includes(hostname)) {
      const mediaInfo = parseMediaUrl(url);
      return { 
        valid: true, 
        provider: mediaInfo?.displayName || hostname 
      };
    }
    
    return { 
      valid: false, 
      error: "Only YouTube, SoundCloud, and Spotify links are supported" 
    };
  } catch {
    return { 
      valid: false, 
      error: "Please enter a valid URL" 
    };
  }
}
