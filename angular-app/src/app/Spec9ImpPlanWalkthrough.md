# Walkthrough: Network Resilience & Toast Notifications

We have implemented **Feature 9: Network Resilience & Global Toast Notifications** in the Angular application. This completes our transversal application infrastructure by intercepting and handling server-side and connectivity failures globally, while broadcasting real-time, self-dismissing feedback through a premium glassmorphic toast notification component.

## Changes Made

### 1. Toast Notification Service
- **Path**: [toast.service.ts](projectManager/angular-app/src/app/core/services/toast.service.ts)
- Created `ToastService` utilizing Angular Signals (`toast` read-only state).
- Added `show(message, type)` which clears any existing auto-dismiss timeouts, updates the active toast message state, and schedules a new auto-hide timer of 4000ms.
- Added `clear()` to instantly remove any notification and cancel the timer.

### 2. Toast UI Component
- **Path**: [toast.component.ts](projectManager/angular-app/src/app/shared/ui/toast/toast.component.ts)
- Created a standalone `ToastComponent` rendering dynamically if the service signal is active.
- Styled a glassmorphic bottom-right layout (`bg-slate-950/90 border border-slate-800 backdrop-blur-md`) using Tailwind CSS.
- Added distinct SVGs for `'success'`, `'error'`, and `'info'` notification types.
- Integrated a manual dismiss button mapping to `ToastService.clear()` and a custom CSS keyframe slide-in animation.

### 3. HTTP Error Interceptor
- **Path**: [error.interceptor.ts](projectManager/angular-app/src/app/core/interceptors/error.interceptor.ts)
- Created functional `errorInterceptor` (`HttpInterceptorFn`).
- Integrated handling for:
  - **401 Unauthorized**: Invokes `AuthService.logout()` to immediately clear local session storage and route to `/login`.
  - **500+ Internal Server Error**: Emits error toast *"Error interno del servidor. Por favor, intente más tarde."*
  - **0 Connection Failures**: Emits network toast *"Error de red. No se pudo establecer conexión con el servidor."*
  - **400/409 specific business errors**: By-passes global intercept toasts so that form controls can display inline validation errors contextually.

### 4. Configuration and Bootstrapping
- **Paths**: [app.config.ts](projectManager/angular-app/src/app/app.config.ts), [app.html](projectManager/angular-app/src/app/app.html), [app.ts](projectManager/angular-app/src/app/app.ts)
- Registered `errorInterceptor` in the HTTP client providers.
- Inserted `<app-toast />` globally inside `app.html` at the root layout.
- Added `ToastComponent` to standalone `imports` of `App` component.

---

## Verification Results

### 1. Automated Unit Tests
We wrote complete unit test suites for `ToastService`, `errorInterceptor` and `ToastComponent` using Vitest test runner tools:
```bash
 RUN  v4.1.2 C:/Users/Lucas/projectManager/angular-app

 ✓  angular-app  src/app/core/services/toast.service.spec.ts (6 tests) 227ms
 ✓  angular-app  src/app/shared/ui/toast/toast.component.spec.ts (4 tests) 599ms
     ✓ should create  404ms
     ✓ should not render anything when toast state is null
     ✓ should render toast details when state is set
     ✓ should call toastService.clear on dismiss button click
 ✓  angular-app  src/app/app.spec.ts (1 test) 231ms
 ✓  angular-app  src/app/core/interceptors/error.interceptor.spec.ts (5 tests) 74ms
     ✓ should logout on 401 Unauthorized error
     ✓ should show toast on 500 Internal Server error
     ✓ should show toast on 0 network connection error
     ✓ should not show toast on 400 Bad Request error but propagate it
     ✓ should not show toast on 409 Conflict error but propagate it
 ✓  angular-app  src/app/shared/layouts/main-layout/main-layout.component.spec.ts (4 tests) 626ms

 Test Files  5 passed (5)
      Tests  20 passed (20)
```

### 2. Compilation and Build Check
The project builds successfully:
- Command run: `npm run build`
- Status: **Successful**
- Angular bundle successfully output to `angular-app/dist/angular-app`.
