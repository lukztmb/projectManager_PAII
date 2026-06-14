# Walkthrough: Dynamic Environment Configurations

We have successfully implemented **Feature 10: Dynamic Environment Configurations (API Handoff)**. This separates base API endpoints from the source code, allowing the application to build using the mock development server URL or dynamic production backend URLs depending on the build configuration.

## Changes Made

### 1. Environments Bootstrapping
- **Paths**: [environment.ts](projectManager/angular-app/src/environments/environment.ts) & [environment.development.ts](projectManager/angular-app/src/environments/environment.development.ts)
- Generated native environments files using Angular CLI.
- Configured dev server target:
  - `apiUrl: 'http://localhost:3000/api'`
- Configured production build target:
  - `apiUrl: 'http://localhost:8080/api'`

### 2. Services Refactoring
- Removed all hardcoded absolute URLs from the data access layer:
  - **AuthService**: [auth.service.ts](projectManager/angular-app/src/app/core/services/auth.service.ts) imported `environment` and updated `loginUrl` to `${environment.apiUrl}/auth/login`.
  - **ProjectService**: [project.service.ts](projectManager/angular-app/src/app/features/projects/data_access/project.service.ts) updated `BASE_API_URL` to `${environment.apiUrl}/projects`.
  - **TaskService**: [task.service.ts](projectManager/angular-app/src/app/features/tasks/data_access/task.service.ts) updated `BASE_API_URL` to `${environment.apiUrl}/tasks` and `PROJECTS_API_URL` to `${environment.apiUrl}/projects`.

---

## Verification Results

### 1. Unit Tests Verification
Run `npm run test` executes successfully. All 5 test suites (20 specs) pass cleanly:
```bash
 RUN  v4.1.2 C:/Users/Lucas/projectManager/angular-app

 ✓  angular-app  src/app/shared/ui/toast/toast.component.spec.ts (4 tests) 557ms
 ✓  angular-app  src/app/app.spec.ts (1 test) 271ms
 ✓  angular-app  src/app/core/services/toast.service.spec.ts (6 tests) 91ms
 ✓  angular-app  src/app/core/interceptors/error.interceptor.spec.ts (5 tests) 110ms
 ✓  angular-app  src/app/shared/layouts/main-layout/main-layout.component.spec.ts (4 tests) 773ms

 Test Files  5 passed (5)
      Tests  20 passed (20)
```

### 2. Compilation and Build Replacement Verification
The compilation output of `npm run build` completed successfully:
- Command: `npm run build`
- Output: **DONE / Successful**
- Application bundle generated to `dist/angular-app/`.
- Inspected bundle and verified that the production endpoint replacement matches `http://localhost:8080/api`.
