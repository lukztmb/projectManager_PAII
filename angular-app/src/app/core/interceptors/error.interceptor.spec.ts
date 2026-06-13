import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { errorInterceptor } from './error.interceptor';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

describe('errorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let mockAuthService: any;
  let mockToastService: any;

  beforeEach(() => {
    mockAuthService = {
      logout: vi.fn(),
    };

    mockToastService = {
      show: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastService, useValue: mockToastService }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should logout on 401 Unauthorized error', () => {
    httpClient.get('/api/test').subscribe({
      next: () => {},
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(401);
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(mockAuthService.logout).toHaveBeenCalled();
  });

  it('should show toast on 500 Internal Server error', () => {
    httpClient.get('/api/test').subscribe({
      next: () => {},
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(500);
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });

    expect(mockToastService.show).toHaveBeenCalledWith(
      'Error interno del servidor. Por favor, intente más tarde.',
      'error'
    );
  });

  it('should show toast on 0 network connection error', () => {
    httpClient.get('/api/test').subscribe({
      next: () => {},
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(0);
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.error(new ProgressEvent('error'));

    expect(mockToastService.show).toHaveBeenCalledWith(
      'Error de red. No se pudo establecer conexión con el servidor.',
      'error'
    );
  });

  it('should not show toast on 400 Bad Request error but propagate it', () => {
    httpClient.get('/api/test').subscribe({
      next: () => {},
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(400);
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });

    expect(mockToastService.show).not.toHaveBeenCalled();
  });

  it('should not show toast on 409 Conflict error but propagate it', () => {
    httpClient.get('/api/test').subscribe({
      next: () => {},
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(409);
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Conflict', { status: 409, statusText: 'Conflict' });

    expect(mockToastService.show).not.toHaveBeenCalled();
  });
});
