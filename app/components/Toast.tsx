"use client";

import { useEffect, useRef } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  visible: boolean;
  onHide: () => void;
}

export default function Toast({ message, type = "success", visible, onHide }: ToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(onHide, 3200);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, onHide]);

  const icons: Record<string, string> = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  };

  return (
    <div className={`toast toast--${type} ${visible ? "toast--visible" : ""}`} role="alert" aria-live="polite">
      <span className="toast__icon">{icons[type]}</span>
      <span className="toast__message">{message}</span>
    </div>
  );
}
