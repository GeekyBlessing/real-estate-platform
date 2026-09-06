"use client";

import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { cn } from "@/lib/utils";

export type ToastTone = "default" | "success" | "danger";

interface ToastItem {
  id: string;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  showToast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toneStyles: Record<ToastTone, string> = {
  default: "bg-ink text-parchment",
  success: "bg-verified text-white",
  danger: "bg-danger text-white",
};

const AUTO_DISMISS_MS = 5000;

/**
 * Mount once near the app root. Notifications from the backend
 * (Section 14 of the architecture) render through the in-app channel
 * separately; this is purely the client-side transient feedback
 * layer (form saved, upload failed) described under Feedback States.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, tone: ToastTone = "default") => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, tone }]);
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, AUTO_DISMISS_MS);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-[calc(76px+env(safe-area-inset-bottom))] z-50 flex flex-col items-end gap-2 md:inset-x-auto md:bottom-4 md:right-4"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto max-w-sm rounded-sm px-4 py-3 text-sm shadow-float",
              toneStyles[toast.tone]
            )}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
