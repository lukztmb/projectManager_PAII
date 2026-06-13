import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { ToastComponent } from './toast.component';
import { ToastService } from '../../../core/services/toast.service';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let mockToastService: any;
  let toastSignal: any;

  beforeEach(async () => {
    toastSignal = signal<any>(null);
    mockToastService = {
      toast: toastSignal,
      clear: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render anything when toast state is null', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('div')).toBeNull();
  });

  it('should render toast details when state is set', () => {
    toastSignal.set({ message: 'Saved successfully', type: 'success' });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('div')).not.toBeNull();
    expect(compiled.textContent).toContain('Saved successfully');
    
    // Check if correct icon wrapper is present (success icons has emerald color text class)
    expect(compiled.querySelector('.text-emerald-400')).not.toBeNull();
  });

  it('should call toastService.clear on dismiss button click', () => {
    toastSignal.set({ message: 'Dynamic alert message', type: 'error' });
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button).not.toBeNull();
    button.click();

    expect(mockToastService.clear).toHaveBeenCalled();
  });
});
