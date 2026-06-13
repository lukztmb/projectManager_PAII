# Main Layout Shell & Navigation Implementation Plan

We will implement the **Main Layout Shell** pattern in the Angular application. This involves creating a `MainLayoutComponent` that contains the persistent navigation header, a mobile navigation drawer/toggle, and a `<router-outlet>` to render child components. We will update the routing configuration (`app.routes.ts`) to use child routing under this layout and simplify the root `app.html` file.

## User Review Required

> [!IMPORTANT]
> **Refactoring of Routing**: All authenticated routes will now be child routes under the `MainLayoutComponent`. The `authGuard` will be applied at the parent layout level, securing all child routes.
> **Removal of Conditional Navbar**: The conditional `@if (isAuthenticated()) { <app-home></app-home> }` check in `app.html` will be removed. The navbar will now reside exclusively inside `MainLayoutComponent`, preventing it from rendering on the `/login` view or any future public/auth views.

## Proposed Changes

### Core Layout Component

#### [NEW] [main-layout.component.ts](projectManager/angular-app/src/app/shared/layouts/main-layout/main-layout.component.ts)
- Create a standalone component `MainLayoutComponent` with an inline template and styles.
- **Template Structure**:
  - A responsive navigation bar (`<nav>`) containing:
    - **Logo & Title** linking to `/projects`.
    - **Desktop Links**: "Proyectos" (`/projects`), "Tareas Activas" (`/tasks/in-progress`), "Nuevo Proyecto" (`/projects/create`).
    - **Mobile Menu Toggle**: A button showing a hamburger/close icon.
    - **User Profile Info**: Displays active user email and first letter avatar.
    - **Logout Button**: Call `logout()` on click.
  - A collapsible mobile menu showing the same links when toggled.
  - A main content area (`<main class="flex-1 min-h-screen bg-slate-50 pt-16">`) that includes `<router-outlet />`.
- **Component Logic**:
  - Inject `AuthService` to access `currentUser` (read-only signal) and call `logout()`.
  - Add a writable signal `isMobileMenuOpen` to toggle the state of the mobile menu.
  - Expose `toggleMobileMenu()` and `closeMobileMenu()` helper methods.

### Routing Configuration

#### [MODIFY] [app.routes.ts](projectManager/angular-app/src/app/app.routes.ts)
- Configure the layout routing.
- Nest all protected routes as child routes under `MainLayoutComponent`.
- Keep the `/login` route as a top-level sibling of the layout so that it is rendered without the navbar shell.
- Apply `canActivate: [authGuard]` at the parent route level to secure all child routes.

### Main Component Cleanup

#### [MODIFY] [app.html](projectManager/angular-app/src/app/app.html)
- Clean up the template by removing the `@if (isAuthenticated()) { <app-home></app-home> }` block.
- Only leave `<router-outlet />` as the root element.

#### [MODIFY] [app.ts](projectManager/angular-app/src/app/app.ts)
- Remove `Home` component from `imports` and clean up its import statements.

### Clean up / Deprecation

#### [DELETE] [home.ts](projectManager/angular-app/src/app/home/home.ts)
#### [DELETE] [home.html](projectManager/angular-app/src/app/home/home.html)
#### [DELETE] [home.css](projectManager/angular-app/src/app/home/home.css)
#### [DELETE] [home.spec.ts](projectManager/angular-app/src/app/home/home.spec.ts)
- We will delete the `home` folder contents since all of its navbar responsibilities have been successfully migrated to `MainLayoutComponent` and we want to avoid dead code.

---

## Verification Plan

### Automated Tests
- Run `npx vitest run` to ensure unit tests continue to pass after refactoring.
- Create unit tests for `MainLayoutComponent` to verify correct template rendering, reactive signals for mobile layout, and logout functionality.

### Manual Verification
1. **Happy Path Login**: Log in as a user, verify redirect to `/projects` works, and the main navbar structure wraps the layout.
2. **Visual Check**:
   - Check that the navbar is fixed at the top.
   - Click navigation links ("Proyectos", "Tareas Activas", "Nuevo Proyecto") and verify components load underneath without reloading the entire page or destroying the navbar.
3. **Logout and History Prevention**: Click "Cerrar Sesión", check that local storage token/session is deleted, redirected to `/login`, and the back button does not allow navigating back to protected views.
4. **Mobile Layout responsiveness**:
   - Shrink browser width below 768px (`md`).
   - Verify desktop menu items disappear.
   - Verify hamburger menu button appears.
   - Click the hamburger button, verify the mobile navigation dropdown toggles smoothly and the links work correctly.
