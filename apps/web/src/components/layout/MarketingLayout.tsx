import { AppContainer } from "./AppContainer";
import { PageHeader } from "./PageHeader";

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  wide?: boolean;
};

export function MarketingLayout({ title, subtitle, children, wide }: Props) {
  return (
    <AppContainer wide={wide}>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="prose prose-invert max-w-none space-y-6">{children}</div>
    </AppContainer>
  );
}
