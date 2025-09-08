import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toasts = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toasts.asObservable();

  private counter = 0;

  success(message: string, duration = 3000): void {
    this.showToast('success', message, duration);
  }

  error(message: string, duration = 5000): void {
    this.showToast('error', message, duration);
  }

  info(message: string, duration = 3000): void {
    this.showToast('info', message, duration);
  }

  warning(message: string, duration = 4000): void {
    this.showToast('warning', message, duration);
  }

  private showToast(
    type: Toast['type'],
    message: string,
    duration: number
  ): void {
    const toast: Toast = {
      id: `toast-${++this.counter}`,
      type,
      message,
      duration,
    };

    const currentToasts = this.toasts.value;
    this.toasts.next([...currentToasts, toast]);

    // Auto remove toast after duration
    setTimeout(() => {
      this.removeToast(toast.id);
    }, duration);
  }

  removeToast(id: string): void {
    const currentToasts = this.toasts.value;
    this.toasts.next(currentToasts.filter((toast) => toast.id !== id));
  }

  clearAll(): void {
    this.toasts.next([]);
  }
}
