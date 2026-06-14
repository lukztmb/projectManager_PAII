### SPEC.md - Infrastructure: Dockerized Mock API

| Field | Description & Quality Criteria |
| --- | --- |
| **Feature Name** | Infrastructure: Dockerized JSON Mock Server |
| **General Description** | Set up a local development environment using a Dockerized `json-server`. This mock server will simulate the backend REST API, providing a persistent but lightweight database (`db.json`) to unblock frontend development and test the UI against the exact DTO structures expected by the real Java backend. |
| **Endpoints Involved** | The mock server must emulate the exact paths defined in the API contract:

  
- `GET /projects`

  
- `POST /projects`

  
- `GET /tasks?status=IN_PROGRESS`

  
- `POST /projects/{projectId}/tasks`

  
- `GET /projects/{projectId}/tasks/{taskId}?comments=true`

  
- `POST /projects/{projectId}/tasks/{taskId}/comments` |
| **Business Restrictions (Simulated)** | 1. **Data Structure:** The mocked data must strictly follow the domain model properties (e.g., `id`, `name`, `startDate`, `endDate`, `status`).

  
2. **Stateless Limitations:** Since `json-server` is a generic tool, it cannot natively simulate complex business logic like returning a `409 Conflict` for duplicate project names or closed projects. The frontend will simulate the "Happy Path" by default, and developers must manually alter the mock server's response (or use a custom middleware) to test error states. |
| **Technical Guidelines** | - **Tooling:** Use `json-server` (Node.js) wrapped in a lightweight `node:alpine` Docker image.

  
- **Database:** Create a `db.json` file at the root of the mock directory containing initial seed data for arrays: `"projects": []`, `"tasks": []`, and `"comments": []`.

  
- **Route Mapping (Critical):** `json-server` does not understand our nested endpoints natively. You must create a `routes.json` file to alias our specific API paths to standard `json-server` paths. For example:

  
`"/projects/:projectId/tasks": "/tasks?projectId=:projectId"`

  
`"/projects/:projectId/tasks/:taskId/comments": "/comments?taskId=:taskId"`

  
- **Containerization:** Create a `docker-compose.yml` or a `Dockerfile` that exposes port `3000` and mounts the `db.json` and `routes.json` files as volumes so changes persist between container restarts. |
| **Acceptance Criteria** | **Criterion 1 (Container Initialization):**

  
**Given** Docker is running on the host machine,

  
**When** the developer executes `docker compose up` for the mock server,

  
**Then** the container starts successfully, exposing the JSON server on `http://localhost:3000`.

  
  
**Criterion 2 (Data Retrieval):**

  
**Given** the mock server is running with seed data,

  
**When** the frontend makes a `GET` request to `/tasks?status=IN_PROGRESS`,

  
**Then** the server responds with a `200 OK` and a JSON array of tasks matching that status.

  
  
**Criterion 3 (Route Aliasing):**

  
**Given** the route mappings are configured,

  
**When** a `POST` request is sent to `/projects/1/tasks/5/comments`,

  
**Then** the `json-server` successfully saves the comment in the `comments` array with a `taskId: 5` property. |
