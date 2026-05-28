export function DemoModeBanner() {
  if (process.env.PAYMENTS_MODE !== "mock") return null;

  return (
    <div
      className="border-b border-amber-500/30 bg-amber-950/40 px-4 py-2 text-center text-sm text-amber-100"
      role="status"
    >
      <strong className="font-medium">Demo mode</strong> — payments and age checks are simulated.
      Connect Veriff/Yoti and CCBill/Segpay before charging real cards.
    </div>
  );
}
