import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';

/**
   * Functional HTTP Interceptor that catches server and network responses
   * to display global user toast feedback or trigger session purification.
   */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: any) => {
      if (error instanceof HttpErrorResponse) {
        // Business Restriction 1: 401 Unauthorized -> Automatic logout and redirect
        if (error.status === 401) {
          console.warn('Session expired or unauthorized (401). Triggering automatic logout.');
          authService.logout();
        } 
        // Business Restriction 2: 500+ Internal Server Error -> Show error toast
        else if (error.status >= 500) {
          toastService.show('Error interno del servidor. Por favor, intente más tarde.', 'error');
        } 
        // Server unreachable / Network Offline (status 0) -> Show error toast
        else if (error.status === 0) {
          toastService.show('Error de red. No se pudo establecer conexión con el servidor.', 'error');
        }
        // Business Restriction 3: specific validation errors like 400 Bad Request or 409 Conflict 
        // are bypassed and left to propagate to target components for contextual feedback.
      }
      return throwError(() => error);
    })
  );
};
