# Environment Configurations Implementation Plan

We will implement **Feature 10: Dynamic Environment Configurations (API Handoff)**. This separates application runtime configuration from source code by storing API base URLs in standard Angular environments files, enabling seamless handoff from the local mock server (port 3000) to the real Java Spring Boot backend (port 8080) when building.

## User Review Required

> [!IMPORTANT]
> **Separation of Concerns**: We generated environments (`environment.ts` and `environment.development.ts`) using Angular CLI.
> - `environment.development.ts` (Dev/Serve configuration) -> Points to Mock Server `http://localhost:3000/api`.
> - `environment.ts` (Production build target) -> Points to Spring Boot backend `http://localhost:8080/api`.
> **CORS Check**: When switching to the real Spring Boot backend in development or production, ensure that the backend REST controllers are annotated with `@CrossOrigin` or have a global `CorsConfig` allowing requests from `http://localhost:4200` with the `Authorization` header.

## Proposed Changes

### Configuration Files

#### [MODIFY] [environment.development.ts](projectManager/angular-app/src/environments/environment.development.ts)
- Set up development environment settings:
  ```typescript
  export const environment = {
    production: false,
    apiUrl: 'http://localhost:3000/api'
  };
  ```

#### [MODIFY] [environment.ts](projectManager/angular-app/src/environments/environment.ts)
- Set up production environment settings:
  ```typescript
  export const environment = {
    production: true,
    apiUrl: 'http://localhost:8080/api'
  };
  ```

### Services Refactoring

#### [MODIFY] [auth.service.ts](projectManager/angular-app/src/app/core/services/auth.service.ts)
- Import `environment` from `src/environments/environment`.
- Replace hardcoded `loginUrl` string with `${environment.apiUrl}/auth/login`.

#### [MODIFY] [project.service.ts](projectManager/angular-app/src/app/features/projects/data_access/project.service.ts)
- Import `environment` from `src/environments/environment`.
- Replace hardcoded `BASE_API_URL` string with `${environment.apiUrl}/projects`.

#### [MODIFY] [task.service.ts](projectManager/angular-app/src/app/features/tasks/data_access/task.service.ts)
- Import `environment` from `src/environments/environment`.
- Replace hardcoded `BASE_API_URL` string with `${environment.apiUrl}/tasks`.
- Replace hardcoded `PROJECTS_API_URL` string with `${environment.apiUrl}/projects`.

---

## Verification Plan

### Automated Tests
- Run `npm run test` to verify that existing test suites compile and pass.
- Modify `ToastService` and `errorInterceptor` specs or check their status to ensure imports of environment settings do not break testing module behaviors.

### Manual Verification
1. **Mock Server Active Check**:
   - Run the frontend in development mode (`npm run start` / `ng serve`).
   - Open browser developer tools and check Network requests.
   - Verify that requests for fetching projects are going to `http://localhost:3000/api/projects`.
2. **Production Bundle Verification**:
   - Run `npm run build` to build the application.
   - Inspect the compiled JS assets in `dist/angular-app/browser/main-*.js` (or similar chunk files).
   - Search for `http://localhost:8080/api` or `http://localhost:3000/api`.
   - Verify that the production build replaces references and references the production endpoint `http://localhost:8080/api`.
