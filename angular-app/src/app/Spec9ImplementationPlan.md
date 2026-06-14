# Network Resilience & Global Error Interceptor Implementation Plan

We will implement **Feature 9: Network Resilience & Global Toast Notifications**. This pattern uses an Angular HTTP Interceptor to catch unexpected HTTP errors globally, a centralized reactive service using Angular Signals to broadcast notifications, and a toast component to display feedback to the user.

## User Review Required

> [!IMPORTANT]
> **Interception Chain**: The new `errorInterceptor` will be registered in `app.config.ts` alongside `authInterceptor`.
> **Error Handling delegation**: Specific business validation errors (`400 Bad Request`, `409 Conflict`) will bypass global toasts and propagate to the caller services so that forms can display contextual error messages inline.
> **Auto-Dismiss Toast**: Toasts will automatically slide out and clear themselves after 4 seconds, utilizing a safe timeout reset pattern in `ToastService`.

## Proposed Changes

### Core Services & Interceptors

#### [NEW] [toast.service.ts](projectManager/angular-app/src/app/core/services/toast.service.ts)
- Create `ToastService` to manage active notifications.
- Expose a read-only signal `toast` holding `{ message: string, type: 'success' | 'error' | 'info' } | null`.
- Implement `show(message, type)` to clear any active timer, set the signal, and schedule a new auto-hide timer for 4000ms.
- Implement `clear()` to cancel the active timer and reset the signal.

#### [NEW] [error.interceptor.ts](projectManager/angular-app/src/app/core/interceptors/error.interceptor.ts)
- Create `errorInterceptor` as a functional `HttpInterceptorFn`.
- Inject `ToastService` and `AuthService`.
- Catch HTTP responses using RxJS `catchError`.
- **Error logic**:
  - `status === 401`: Triggers `AuthService.logout()` to immediately clear credentials and redirect to `/login`.
  - `status >= 500`: Shows an `'error'` toast: *"Error interno del servidor. Por favor, intente más tarde."*
  - `status === 0`: Shows an `'error'` toast: *"Error de red. No se pudo establecer conexión con el servidor."*
  - Other statuses (e.g. `400`, `409`): Propagates error without launching global toasts, allowing local form validation to handle the feedback.

#### [MODIFY] [app.config.ts](projectManager/angular-app/src/app/app.config.ts)
- Import `errorInterceptor`.
- Update `provideHttpClient` to register `errorInterceptor` after `authInterceptor` in the HTTP interceptor list.

### Shared UI Component

#### [NEW] [toast.component.ts](projectManager/angular-app/src/app/shared/ui/toast/toast.component.ts)
- Create `ToastComponent` as a standalone component.
- Bind component UI to `ToastService.toast` signal.
- Design a premium glassmorphic toast notification anchored at the bottom-right corner using Tailwind CSS:
  - Dark container (`bg-slate-900/90 border border-slate-800 backdrop-blur-md`).
  - Distinct colored indicator icons depending on message type (`success` - emerald, `error` - rose, `info` - blue).
  - Clear message text.
  - Manual close button (`x`).
- Add slide-in entry animation (`animate-slide-in` utilizing Tailwind keyframe classes).

### Root Component Integration

#### [MODIFY] [app.html](projectManager/angular-app/src/app/app.html)
- Insert the `<app-toast />` element at the root level below `<router-outlet />` to ensure toast alerts can show up on any view (including login screen).

#### [MODIFY] [app.ts](projectManager/angular-app/src/app/app.ts)
- Import `ToastComponent` in the standalone `imports` metadata.

---

## Verification Plan

### Automated Tests
- Run `npm run test` to verify all tests pass.
- Create unit tests for `ToastService` checking that:
  - Default value is `null`.
  - Calling `show()` sets message and type correctly.
  - Calling `clear()` resets value.
  - Calling `show()` schedules auto-hide timer.
- Create unit tests for `errorInterceptor` using `HttpTestingController` to verify:
  - `401` triggers `AuthService.logout()`.
  - `500` calls `ToastService.show('Error interno del servidor...')`.
  - `0` calls `ToastService.show('Error de red...')`.
  - `400` & `409` do not trigger toasts but propagate the error down.

### Manual Verification
1. **Internal Server Error (500)**:
   - Temporarily modify the mock backend or stop it to simulate a server failure.
   - Navigate to `/projects`.
   - Verify a crimson error toast pops up with *"Error interno del servidor. Por favor, intente más tarde."*
2. **Network Offline (0)**:
   - Disable internet connection or shut down the server entirely.
   - Click to load projects or detail.
   - Verify error toast *"Error de red. No se pudo establecer conexión..."* is displayed.
3. **Session Expired (401)**:
   - Trigger a simulated 401 response from the server (or manually delete the token and trigger a request that fails with 401).
   - Verify immediate redirection to `/login` and purge of credentials from `localStorage`.
4. **Validation bypass (400/409)**:
   - Submit a form with an invalid field (or conflict name) triggering a `400` or `409` from the server.
   - Verify that NO global toast is displayed, and instead, the error reaches the component, displaying validation details inline.
