'use client';

import { toast } from 'sonner';

type ToastOptions = {
  description?: string;
  duration?: number;
};

const successClass =
  'bg-[var(--primary)] text-primary-foreground border border-[var(--primary)]';
const errorClass =
  'bg-destructive text-white border border-destructive/80';
const infoClass =
  'bg-[var(--accent)] text-[var(--accent-foreground)] border border-[var(--accent)]';

export function showSuccess(message: string, options: ToastOptions = {}) {
  return toast.success(message, {
    duration: options.duration ?? 3500,
    description: options.description,
    className: successClass,
  });
}

export function showError(message: string, options: ToastOptions = {}) {
  return toast.error(message, {
    duration: options.duration ?? 4500,
    description: options.description,
    className: errorClass,
  });
}

export function showInfo(message: string, options: ToastOptions = {}) {
  return toast(message, {
    duration: options.duration ?? 3500,
    description: options.description,
    className: infoClass,
  });
}

export function showSaveReminder(message: string) {
  return toast.success(message, {
    duration: 5000,
    description: 'Changes applied. Remember to click Save to keep them.',
    className: successClass,
  });
}

export type { ToastOptions };
