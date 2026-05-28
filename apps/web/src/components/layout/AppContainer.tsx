export function AppContainer({
  children,
  wide,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <main className={`py-8 md:py-12 ${wide ? "container-wide" : "container-app"}`}>
      {children}
    </main>
  );
}
