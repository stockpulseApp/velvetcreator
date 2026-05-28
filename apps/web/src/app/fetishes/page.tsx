import Link from "next/link";
import { FETISH_CATALOG, tagLabel } from "@/lib/fetishes";
import { AppContainer } from "@/components/layout/AppContainer";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata = {
  title: "Fetish catalog — VelvetCreator",
  description:
    "Browse every niche and tag supported on VelvetCreator. Find creators by kink, aesthetic, and community.",
};

export default function FetishesPage() {
  const totalTags = FETISH_CATALOG.categories.reduce(
    (n, c) => n + c.tags.length,
    0
  );

  return (
    <AppContainer wide>
      <PageHeader
        title="Fetish catalog"
        subtitle={`${FETISH_CATALOG.categories.length} categories · ${totalTags}+ tags — use these when you onboard and when fans search Discover.`}
      />

      <div className="mb-10 flex flex-wrap gap-3">
        <Link href="/explore" className="btn btn-primary">
          Discover creators
        </Link>
        <Link href="/signup?role=creator" className="btn btn-secondary">
          Apply as a creator
        </Link>
      </div>

      <div className="space-y-12">
        {FETISH_CATALOG.categories.map((cat) => (
          <section key={cat.id} id={cat.id} className="scroll-mt-24">
            <div className="mb-4 border-b border-[var(--border)] pb-3">
              <h2 className="font-display text-2xl font-semibold">{cat.name}</h2>
              <p className="mt-1 max-w-2xl text-sm text-[var(--text-secondary)]">
                {cat.description}
              </p>
            </div>
            <ul className="flex flex-wrap gap-2">
              {cat.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    href={`/explore?tag=${encodeURIComponent(tag)}`}
                    className="badge badge-gold transition hover:opacity-90"
                  >
                    {tagLabel(tag)}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-16 text-center text-sm text-[var(--muted)]">
        Missing a niche?{" "}
        <Link href="/community" className="text-[var(--accent-bright)] underline">
          Request a tag
        </Link>{" "}
        during creator review.
      </p>
    </AppContainer>
  );
}
