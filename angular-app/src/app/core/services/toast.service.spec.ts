import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have a default toast state of null', () => {
    expect(service.toast()).toBeNull();
  });

  it('should set toast details when show() is called', () => {
    service.show('Project created successfully', 'success');
    expect(service.toast()).toEqual({
      message: 'Project created successfully',
      type: 'success'
    });
  });

  it('should clear toast when clear() is called', () => {
    service.show('Alert message', 'info');
    expect(service.toast()).not.toBeNull();
    service.clear();
    expect(service.toast()).toBeNull();
  });

  it('should auto-dismiss toast after 4 seconds', () => {
    service.show('Self hiding alert', 'error');
    expect(service.toast()).not.toBeNull();

    // Fast-forward 4000ms
    vi.advanceTimersByTime(4000);
    expect(service.toast()).toBeNull();
  });

  it('should reset auto-dismiss timer when a new toast is shown', () => {
    service.show('First alert', 'info');
    vi.advanceTimersByTime(2000); // 2 seconds pass
    expect(service.toast()).toEqual({ message: 'First alert', type: 'info' });

    // Show a new alert, which should reset the 4-second timer
    service.show('Second alert', 'success');
    vi.advanceTimersByTime(3000); // Another 3 seconds pass (5 seconds total from start)
    // First alert would have cleared by now, but second alert should still be active
    expect(service.toast()).toEqual({ message: 'Second alert', type: 'success' });

    vi.advanceTimersByTime(1000); // Final 1 second to make it 4 seconds from the second show
    expect(service.toast()).toBeNull();
  });
});
