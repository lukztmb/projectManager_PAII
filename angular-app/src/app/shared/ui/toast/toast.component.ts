import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgClass],
  template: `
    @if (toast(); as t) {
      <div 
        class="fixed bottom-5 right-5 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 animate-slide-in max-w-sm sm:max-w-md"
        [ngClass]="toastClasses[t.type]"
      >
        <!-- Icons -->
        @if (t.type === 'success') {
          <div class="flex-shrink-0 text-emerald-400 bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/20">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        }
        @if (t.type === 'error') {
          <div class="flex-shrink-0 text-rose-400 bg-rose-500/10 p-1.5 rounded-lg border border-rose-500/20">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        }
        @if (t.type === 'info') {
          <div class="flex-shrink-0 text-indigo-400 bg-indigo-500/10 p-1.5 rounded-lg border border-indigo-500/20">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        }

        <!-- Message Content -->
        <span class="text-sm font-semibold text-slate-100 pr-2 leading-relaxed">
          {{ t.message }}
        </span>

        <!-- Manual Dismiss Close Button -->
        <button 
          (click)="dismiss()" 
          class="flex-shrink-0 text-slate-400 hover:text-slate-200 hover:bg-slate-800 p-1.5 rounded-lg transition-colors cursor-pointer"
          aria-label="Dismiss notification"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    }
  `,
  styles: [`
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(24px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    .animate-slide-in {
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class ToastComponent {
  private readonly toastService = inject(ToastService);
  
  // Read state from the shared ToastService
  public readonly toast = this.toastService.toast;

  // Custom tailwind classes based on type
  public readonly toastClasses: Record<'success' | 'error' | 'info', string> = {
    success: 'bg-slate-950/90 border-emerald-500/20 text-slate-100',
    error: 'bg-slate-950/90 border-rose-500/20 text-slate-100',
    info: 'bg-slate-950/90 border-indigo-500/20 text-slate-100'
  };

  /**
   * Manually dismisses the toast.
   */
  public dismiss(): void {
    this.toastService.clear();
  }
}
