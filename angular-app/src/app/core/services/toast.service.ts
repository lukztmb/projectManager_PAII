import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly _toast = signal<ToastMessage | null>(null);
  
  // Expose toast state as a read-only signal for consumer UI
  public readonly toast = this._toast.asReadonly();
  
  private timeoutId: any = null;

  /**
   * Displays a toast notification message.
   * If a toast is already shown, its auto-hide timer is reset.
   * 
   * @param message Text to display
   * @param type Style theme ('success' | 'error' | 'info')
   */
  public show(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.clearTimer();
    this._toast.set({ message, type });
    
    // Auto-dismiss after 4 seconds
    this.timeoutId = setTimeout(() => {
      this.clear();
    }, 4000);
  }

  /**
   * Instantly dismisses the active toast notification.
   */
  public clear(): void {
    this.clearTimer();
    this._toast.set(null);
  }

  private clearTimer(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
