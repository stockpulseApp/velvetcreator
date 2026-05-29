"use client";

import { useState } from "react";

export function FollowButton({
  creatorProfileId,
  initialFollowing = false,
}: {
  creatorProfileId: string;
  initialFollowing?: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);

  async function toggle() {
    if (following) {
      await fetch("/api/follow", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorProfileId }),
      });
      setFollowing(false);
    } else {
      await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorProfileId }),
      });
      setFollowing(true);
    }
  }

  return (
    <button type="button" onClick={toggle} className="btn btn-secondary btn-sm">
      {following ? "Following" : "Follow"}
    </button>
  );
}
