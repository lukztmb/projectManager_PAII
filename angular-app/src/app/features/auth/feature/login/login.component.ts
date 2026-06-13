import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      <!-- Background decorative glow spots -->
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-500/10 rounded-full blur-[100px]"></div>

      <div class="w-full max-w-md">
        <!-- Card Container with Glassmorphism -->
        <div class="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl relative">
          <!-- Logo & Header -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-xl shadow-lg shadow-indigo-500/20 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-slate-100 tracking-tight">Acceso al Portal</h1>
            <p class="text-slate-400 text-sm mt-1">Ingresa tus credenciales para administrar tus proyectos</p>
          </div>

          <!-- Error Message Toast/Alert -->
          @if (errorMessage()) {
            <div class="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 animate-fade-in">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span class="text-rose-300 text-sm font-medium">{{ errorMessage() }}</span>
            </div>
          }

          <!-- Form -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Email field -->
            <div class="space-y-2">
              <label for="email" class="text-xs font-semibold text-slate-300 tracking-wider uppercase">Correo Electrónico</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  placeholder="ejemplo@correo.com"
                  class="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                  [class.border-rose-500/50]="isFieldInvalid('email')"
                />
              </div>
              @if (isFieldInvalid('email')) {
                <div class="text-rose-400 text-xs mt-1">
                  @if (loginForm.get('email')?.errors?.['required']) {
                    El correo electrónico es requerido.
                  }
                  @if (loginForm.get('email')?.errors?.['email']) {
                    Ingresa un correo electrónico con formato válido.
                  }
                </div>
              }
            </div>

            <!-- Password field -->
            <div class="space-y-2">
              <label for="password" class="text-xs font-semibold text-slate-300 tracking-wider uppercase">Contraseña</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  id="password"
                  type="password"
                  formControlName="password"
                  placeholder="••••••••"
                  class="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                  [class.border-rose-500/50]="isFieldInvalid('password')"
                />
              </div>
              @if (isFieldInvalid('password')) {
                <div class="text-rose-400 text-xs mt-1">
                  La contraseña es requerida.
                </div>
              }
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="loginForm.invalid || isLoading()"
              class="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/10 focus:outline-none hover:shadow-indigo-500/20 active:scale-[0.98] transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              @if (isLoading()) {
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Iniciando sesión...</span>
              } @else {
                <span>Ingresar</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Local state signals
  public readonly isLoading = signal<boolean>(false);
  public readonly errorMessage = signal<string | null>(null);

  // Form definition
  public readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  /**
   * Evaluates if a form field is invalid and touched.
   */
  public isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  /**
   * Submits the credentials to the AuthService.
   */
  public onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.isLoading.set(false);
        // Successful login: redirect to the projects dashboard view
        this.router.navigate(['/projects']);
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Login error:', error);
        
        if (error.status === 401) {
          this.errorMessage.set('Credenciales incorrectas');
        } else {
          this.errorMessage.set('Error de comunicación con el servidor. Inténtalo de nuevo.');
        }
      }
    });
  }
}
