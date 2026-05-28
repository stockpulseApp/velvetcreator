"use client";

import { useEffect, useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoConference,
} from "@livekit/components-react";
import "@livekit/components-styles";

type Props = {
  liveSessionId: string;
  roomName: string;
  title: string;
  isHost?: boolean;
};

type TokenState =
  | { status: "loading" }
  | { status: "preview" }
  | { status: "ready"; url: string; token: string }
  | { status: "error"; message: string };

export function LiveViewer({ liveSessionId, roomName, title, isHost }: Props) {
  const [state, setState] = useState<TokenState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/live/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ liveSessionId }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || !data.configured) {
          setState({ status: "preview" });
          return;
        }
        setState({
          status: "ready",
          url: data.url,
          token: data.token,
        });
      } catch (e) {
        if (!cancelled) {
          setState({
            status: "error",
            message: e instanceof Error ? e.message : "Connection failed",
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [liveSessionId]);

  if (state.status === "loading") {
    return (
      <div className="card flex aspect-video items-center justify-center">
        <p className="text-sm text-[var(--muted)]">Connecting to live room…</p>
      </div>
    );
  }

  if (state.status === "ready") {
    return (
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] [&_.lk-video-conference]:min-h-[420px]">
        <LiveKitRoom
          serverUrl={state.url}
          token={state.token}
          connect
          audio
          video={isHost}
          data-lk-theme="default"
          style={
            {
              "--lk-bg": "#060608",
              "--lk-control-bar-bg": "rgba(12,12,16,0.92)",
            } as React.CSSProperties
          }
        >
          <VideoConference />
          <RoomAudioRenderer />
        </LiveKitRoom>
        <p className="border-t border-[var(--border)] bg-[var(--surface-1)] px-4 py-2 text-xs text-[var(--muted)]">
          {isHost ? "You are hosting" : "Watching"} · {title}
        </p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-gradient-to-br from-black via-[var(--surface-1)] to-[var(--accent)]/10">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--accent)_0%,transparent_70%)] opacity-20" />
      <div className="relative flex h-full flex-col items-center justify-center p-8 text-center">
        <span className="badge badge-live mb-4">Preview mode</span>
        <p className="font-display text-2xl text-[var(--accent-bright)]">{title}</p>
        <p className="mt-2 text-sm text-[var(--muted)]">Room {roomName}</p>
        <p className="mt-6 max-w-md text-xs leading-relaxed text-[var(--text-secondary)]">
          Add LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET to enable real
          WebRTC. Ticket payments and age verification already gate access.
        </p>
        {state.status === "error" && (
          <p className="mt-2 text-xs text-[var(--danger)]">{state.message}</p>
        )}
      </div>
    </div>
  );
}
