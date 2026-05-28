"use client";

export function RequestActions({
  requestId,
  status,
}: {
  requestId: string;
  status: string;
}) {
  async function act(action: string) {
    await fetch("/api/custom-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, action }),
    });
    window.location.reload();
  }

  return (
    <div className="mt-3 flex gap-2">
      {status === "paid" && (
        <button type="button" className="btn btn-ghost" onClick={() => act("accept")}>
          Accept
        </button>
      )}
      {["accepted", "in_session"].includes(status) && (
        <button type="button" className="btn btn-primary" onClick={() => act("complete")}>
          Mark complete (release escrow)
        </button>
      )}
    </div>
  );
}
