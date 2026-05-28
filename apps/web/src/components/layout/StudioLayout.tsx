import Link from "next/link";
import { AppContainer } from "./AppContainer";
import { PageHeader } from "./PageHeader";

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function StudioLayout({ title, subtitle, children }: Props) {
  return (
    <AppContainer wide>
      <Link
        href="/studio"
        className="mb-4 inline-block text-sm text-[var(--muted)] hover:text-[var(--accent-bright)]"
      >
        ← Studio
      </Link>
      <PageHeader title={title} subtitle={subtitle} />
      {children}
    </AppContainer>
  );
}
