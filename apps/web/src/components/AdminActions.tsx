"use client";

export function AdminActions({
  action,
  userId,
  reportId,
  label,
}: {
  action: string;
  userId?: string;
  reportId?: string;
  label: string;
}) {
  async function run() {
    await fetch("/api/admin/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, userId, reportId }),
    });
    window.location.reload();
  }

  return (
    <button type="button" className="btn btn-ghost py-1 text-xs" onClick={run}>
      {label}
    </button>
  );
}
