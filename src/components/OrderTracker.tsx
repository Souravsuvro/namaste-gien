import { statusLabel, useLocale } from "../lib/i18n";
import { ORDER_FLOW, type Order, orderStepIndex } from "../lib/store";

export function OrderTracker({ order }: { order: Order }) {
  const locale = useLocale((s) => s.locale);
  if (order.status === "cancelled") {
    return <p className="alert">{statusLabel("cancelled", locale)}</p>;
  }
  const idx = orderStepIndex(order.status);
  const steps =
    order.fulfillment === "delivery"
      ? (["received", "preparing", "ready", "delivered"] as const)
      : (ORDER_FLOW as readonly string[]);

  return (
    <ol className="tracker">
      {steps.map((s, i) => (
        <li key={s} className={i <= idx ? "done" : ""}>
          <span className="dot" />
          <span>{statusLabel(s, locale)}</span>
        </li>
      ))}
    </ol>
  );
}
