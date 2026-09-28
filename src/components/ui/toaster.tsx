
"use client";

import React, { createContext, useState, useCallback } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info";

export interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextType {
  toast: (props: Omit<ToastProps, "id">) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((props: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, ...props }]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border p-4 pr-8 shadow-lg transition-all",
              "glass-panel animate-in slide-in-from-right-full",
              toast.variant === "success" && "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400",
              toast.variant === "error" && "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400",
              toast.variant === "info" && "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400"
            )}
          >
            <div className="flex gap-3">
              {toast.variant === "success" && <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />}
              {toast.variant === "error" && <XCircle className="h-5 w-5 text-red-500 mt-0.5" />}
              {toast.variant === "info" && <Info className="h-5 w-5 text-blue-500 mt-0.5" />}
              <div className="flex flex-col">
                <h3 className="font-semibold text-sm">{toast.title}</h3>
                {toast.description && (
                  <p className="text-sm opacity-90">{toast.description}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

