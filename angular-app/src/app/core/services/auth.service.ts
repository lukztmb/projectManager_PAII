import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, of, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserSession {
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // Private writeable signals
  private readonly _isAuthenticated = signal<boolean>(false);
  private readonly _token = signal<string | null>(null);
  private readonly _currentUser = signal<UserSession | null>(null);

  // Public read-only signals for consumer components (e.g. Navbar)
  public readonly isAuthenticated = this._isAuthenticated.asReadonly();
  public readonly token = this._token.asReadonly();
  public readonly currentUser = this._currentUser.asReadonly();

  // URL pointing to the authentication endpoint
  private readonly loginUrl = `${environment.apiUrl}/auth/login`;

  constructor() {
    this.loadSession();
  }

  /**
   * Performs authentication against the backend.
   * In local development with the mock server, if the endpoint returns a 404,
   * it falls back to a simulated JWT authentication to unblock frontend development.
   * 
   * @param email User email
   * @param password User password
   */
  public login(email: string, password: string): Observable<{ token: string; user?: UserSession }> {
    return this.http.post<{ token: string; user?: UserSession }>(this.loginUrl, { email, password }).pipe(
      tap(response => {
        this.setSession(response.token, response.user || { email });
      }),
      catchError((error: HttpErrorResponse) => {
        // Mock server handling: json-server returns 404/0 for /api/auth/login
        if (environment.useMockAuth && (error.status === 404 || error.status === 0)) {
          console.warn('Authentication endpoint not found on mock server. Falling back to local simulation.');

          // Business Rule simulation: error case
          if (password === 'wrong' || email === 'wrong@example.com') {
            return throwError(() => new HttpErrorResponse({
              status: 401,
              statusText: 'Unauthorized',
              error: { message: 'Credenciales incorrectas' }
            }));
          }

          // Happy path simulation
          const mockToken = `mock-jwt-token-${btoa(email)}`;
          const mockUser: UserSession = { email };
          this.setSession(mockToken, mockUser);
          return of({ token: mockToken, user: mockUser });
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Destroys local session state and redirects to the login view.
   */
  public logout(): void {
    this.clearSession();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  /**
   * Returns the current JWT token if available.
   */
  public getToken(): string | null {
    return this._token();
  }

  private setSession(token: string, user: UserSession): void {
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('user_session', JSON.stringify(user));
    this._token.set(token);
    this._currentUser.set(user);
    this._isAuthenticated.set(true);
  }

  private clearSession(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_session');
    this._token.set(null);
    this._currentUser.set(null);
    this._isAuthenticated.set(false);
  }

  private loadSession(): void {
    const token = localStorage.getItem('jwt_token');
    const userJson = localStorage.getItem('user_session');
    
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as UserSession;
        this._token.set(token);
        this._currentUser.set(user);
        this._isAuthenticated.set(true);
      } catch (e) {
        this.clearSession();
      }
    }
  }
}
