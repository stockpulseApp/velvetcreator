import type { ReactNode } from "react";

export function LegalProse({ children }: { children: ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl">
      <div className="mt-8 space-y-8 text-[var(--text-secondary)] leading-relaxed">
        {children}
      </div>
      <p className="mt-12 border-t border-[var(--border)] pt-6 text-xs text-[var(--muted)]">
        This document is provided for platform operations and user transparency. It
        is not legal advice. Operators should have qualified counsel review all policies
        before marketing to the public or processing payments in your jurisdiction.
      </p>
    </article>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-xl font-semibold text-[var(--text)]">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
