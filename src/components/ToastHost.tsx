import { useApp } from "../lib/store";

export function ToastHost() {
  const toasts = useApp((s) => s.toasts);
  const dismiss = useApp((s) => s.dismissToast);
  if (!toasts.length) return null;
  return (
    <div className="toast-host" aria-live="polite">
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`toast ${t.tone === "err" ? "toast-err" : "toast-ok"}`}
          onClick={() => dismiss(t.id)}
        >
          {t.message}
        </button>
      ))}
    </div>
  );
}
