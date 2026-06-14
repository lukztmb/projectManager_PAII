# SPECFixes3: Criterios de Aceptación Faltantes y Discrepancias con las SPECs Originales

> **Origen:** Code Reviews #1 a #8 — Hallazgos de criterios no especificados, discrepancias de naming y rutas redundantes.
> **Prioridad:** Baja-Media — Fortalecen la trazabilidad Spec↔Código y evitan que escenarios de negocio queden sin cobertura formal.
> **Naturaleza:** Este documento **no modifica código**. Propone adiciones y correcciones a las SPECs originales (SPEC1–SPEC8) para alinear la documentación con la implementación real y cubrir los escenarios de negocio que se implementaron en código pero nunca se formalizaron.

---

| Campo | Descripción y criterio de calidad |
| --- | --- |
| **Nombre de la feature** | Enmiendas a Especificaciones Técnicas (Spec Alignment & Missing Criteria Amendments) |
| **Descripción general** | Recopilación de criterios de aceptación faltantes, discrepancias de nomenclatura y rutas ambiguas identificadas durante las revisiones de código. Cada sección referencia la SPEC original afectada y propone los criterios o correcciones que deben incorporarse antes de considerar la documentación como "completa". |

---

## Enmienda 1 — SPEC 1: Visualización de Tareas en Progreso

**Fuente:** Code Review #1

### Criterio faltante: Tarea sin `assignee` definido

La restricción de negocio #4 de la SPEC 1 establece que las tareas sin `assignee` deben mostrar "Sin asignar" o "Unassigned", pero no existe un criterio Given/When/Then que valide este comportamiento.

**Estado actual del código:** En `task-detail.component.ts` (L74) se usa `{{ currentTask.assignee || 'Unassigned' }}`. En `TaskCardComponent` el manejo depende de su template.

**Criterio propuesto a agregar a SPEC 1:**

> **Criterio 4 (Assignee nulo):**
>
> **Dado** que la API devuelve una tarea cuyo campo `assignee` es `null` o no está definido,
>
> **Cuando** la tarjeta de la tarea se renderiza en la lista,
>
> **Entonces** el campo de responsable muestra el texto "Sin asignar" en lugar de dejar el espacio vacío o mostrar `null`.

### Discrepancia documentada: Ruta del endpoint

La SPEC 1 indica `GET /tasks?status=IN_PROGRESS`, pero el `TaskService` construye la URL como `${environment.apiUrl}/projects/tasks`. Ambas son válidas dependiendo de la configuración del backend, pero se recomienda **documentar la ruta real usada** en la SPEC para evitar confusión.

**Acción:** Actualizar el campo "Endpoints involucrados" de SPEC 1 a:
> `GET /projects/tasks?status=IN_PROGRESS` (ruta relativa al apiUrl configurado)

---

## Enmienda 2 — SPEC 2: Creación de Proyecto

**Fuente:** Code Review #2

### Criterio faltante: Error 400 del backend

Los lineamientos técnicos de SPEC 2 mencionan capturar el código `400` para errores de validación del backend, pero no existe un criterio formal para ese escenario. El código **sí lo implementa** (L214 de `project-create.component.ts`).

**Criterio propuesto a agregar a SPEC 2:**

> **Criterio 4 (Validación del backend - 400):**
>
> **Dado** que el usuario envía un formulario con datos que pasan la validación del frontend,
>
> **Cuando** el backend rechaza los datos con un error `400 Bad Request` (por restricciones de validación del servidor),
>
> **Entonces** la UI captura el error y muestra un mensaje genérico indicando "Error de validación del servidor. Revise los datos ingresados." sin romper la experiencia de usuario.

### Discrepancia documentada: Separación de validaciones de fecha

El criterio 2 de SPEC 2 funde dos validaciones independientes (`endDate >= startDate` y `endDate >= hoy`) en un solo escenario. En el código, estas son dos validadores separados:
- `dateRangeValidator` (nivel grupo): Valida `endDate >= startDate`
- `futureDateValidator` (nivel control): Valida `endDate >= hoy`

**Acción recomendada:** Dividir el Criterio 2 actual en dos criterios separados:

> **Criterio 2a (endDate ≥ startDate):**
>
> **Dado** que el usuario completa el formulario,
>
> **Cuando** ingresa una `endDate` anterior a la `startDate`,
>
> **Entonces** el formulario se marca como inválido con el mensaje "La fecha de fin debe ser mayor o igual a la fecha de inicio" y el botón se deshabilita.

> **Criterio 2b (endDate ≥ hoy):**
>
> **Dado** que el usuario completa el formulario,
>
> **Cuando** ingresa una `endDate` anterior a la fecha actual,
>
> **Entonces** el campo `endDate` se marca individualmente como inválido con el mensaje "La fecha de fin no puede ser anterior a hoy" y el botón se deshabilita.

---

## Enmienda 3 — SPEC 3: Creación de Tarea

**Fuente:** Code Review #3

### Criterio faltante: Error 404 (Proyecto eliminado)

El código maneja el error `404 Not Found` para el caso en que el proyecto padre fue eliminado, pero la SPEC 3 no tiene criterio para este escenario.

**Criterio propuesto a agregar a SPEC 3:**

> **Criterio 4 (Proyecto no encontrado - 404):**
>
> **Dado** que el formulario es válido y el usuario intenta crear una tarea,
>
> **Cuando** el `projectId` en la URL ya no existe en la base de datos (fue eliminado),
>
> **Entonces** el backend responde con `404 Not Found` y la UI muestra un mensaje informativo: "El proyecto no fue encontrado. Pudo haber sido eliminado."

### Criterio faltante: Flujo de cancelación

El componente implementa un botón "Cancel" que navega de vuelta, pero la SPEC 3 no describe este flujo.

**Criterio propuesto a agregar a SPEC 3:**

> **Criterio 5 (Flujo de cancelación):**
>
> **Dado** que el usuario está completando el formulario de creación de tarea,
>
> **Cuando** presiona el botón "Cancelar",
>
> **Entonces** el sistema navega de vuelta al detalle del proyecto padre (`/projects/:projectId`) sin enviar ninguna petición al backend.

### Discrepancia documentada: `estimateHours` vs `estimatedHours`

La SPEC 3 usa `estimateHours` como nombre del campo del payload. Sin embargo, el código usa `estimatedHours` (con 'd') en:
- `TaskRequest` interface → `estimatedHours: number`
- `Task` interface → `estimatedHours: number`
- `FormControl` → `estimatedHours`

**Acción requerida:** Verificar con el equipo de backend cuál es el nombre exacto del campo que acepta el endpoint `POST /projects/{projectId}/tasks`. Si el backend acepta `estimatedHours`, actualizar la SPEC 3 para reflejar el nombre correcto. Si acepta `estimateHours`, corregir el código.

**Resolución propuesta:** Actualizar la SPEC 3, restricción #2, de:
> "Las horas estimadas (`estimateHours`) deben ser..."

A:
> "Las horas estimadas (`estimatedHours`) deben ser..."

---

## Enmienda 4 — SPEC 4: Detalle de Tarea y Comentarios

**Fuente:** Code Review #4

### Criterio faltante: Error en `POST` de comentario

El criterio 2 de SPEC 4 cubre la adición exitosa de un comentario, pero no hay escenario para cuando el `POST /comments` falla.

**Criterio propuesto a agregar a SPEC 4:**

> **Criterio 4 (Fallo al agregar comentario):**
>
> **Dado** que el usuario completa el formulario de comentario y hace submit,
>
> **Cuando** la petición `POST /projects/{projectId}/tasks/{taskId}/comments` falla por error de red o del servidor,
>
> **Entonces** la UI muestra un mensaje de error dentro de la sección de comentarios indicando que no se pudo agregar el comentario, sin interrumpir la visualización de la tarea ni utilizar el `alert()` nativo del navegador.

### Corrección documental: `CommentFormComponent` como obligatorio

La SPEC 4 describe la creación de `CommentFormComponent` como condicional: *"si la complejidad lo amerita"*. El código lo implementa siempre.

**Acción recomendada:** Actualizar el lineamiento técnico de SPEC 4, de:
> "...un formulario hijo presentacional (`CommentFormComponent`) **si la complejidad lo amerita**."

A:
> "...un formulario hijo presentacional (`CommentFormComponent`), responsable de emitir un evento `commentSubmitted` al componente padre."

---

## Enmienda 5 — SPEC 5: Autenticación y Seguridad

**Fuente:** Code Review #5

### Criterio 4 incompleto en el documento

El Code Review #5 señala que el criterio de aceptación para el caso de `401 Unauthorized` (logout automático por token expirado) está cortado en el documento. Se sugiere revisar y completar el SPEC.

**Estado actual verificado:** Al revisar `SPEC5.md`, el criterio 4 está completo:
> *"Dado que un usuario ingresa una contraseña incorrecta, Cuando el backend responde con un error 401 Unauthorized, Entonces la UI captura el error y muestra un mensaje indicando 'Credenciales incorrectas'."*

Sin embargo, este criterio cubre el escenario de **login con credenciales incorrectas**, no el de **logout automático por token expirado**. Son dos flujos distintos.

**Criterio propuesto a agregar a SPEC 5:**

> **Criterio 5 (Logout automático por token expirado):**
>
> **Dado** que el usuario tiene una sesión activa pero su JWT ha expirado en el servidor,
>
> **Cuando** cualquier petición HTTP de la aplicación recibe un `401 Unauthorized` como respuesta,
>
> **Entonces** el interceptor HTTP destruye la sesión local (limpia localStorage y resetea las Signals de autenticación) y redirige automáticamente a `/login` sin intervención del usuario.

### Verificación documental: Interceptor HTTP implementado

El Code Review #5 cuestiona si el interceptor de autenticación existe. Tras revisión del código actual:
- ✅ `auth.interceptor.ts` existe en `src/app/core/interceptors/`
- ✅ Está registrado en `app.config.ts` vía `withInterceptors([authInterceptor, errorInterceptor])`
- ✅ Inyecta el header `Authorization: Bearer <token>` en todas las peticiones
- ✅ Intercepta `401` y ejecuta `authService.logout()`

**No requiere acción de código.** Solo documentar la verificación.

---

## Enmienda 6 — SPEC 6: Dashboard y Listado de Proyectos

**Fuente:** Code Review #6

### Criterio faltante: Error de red

La SPEC 6 tiene happy path y empty state, pero no tiene un criterio para cuando `GET /projects` falla. El componente **sí lo maneja** (L173-176 de `project-list.component.ts`).

**Criterio propuesto a agregar a SPEC 6:**

> **Criterio 4 (Error de red):**
>
> **Dado** que el usuario autenticado intenta cargar la lista de proyectos,
>
> **Cuando** el backend no está disponible o responde con un error de servidor (500+),
>
> **Entonces** la UI muestra un mensaje de error visual dentro de la vista (no un `alert()`) indicando que no se pudo conectar con el servidor para obtener los proyectos.

---

## Enmienda 7 — SPEC 7: Detalle de Proyecto y Tareas

**Fuente:** Code Review #7

### Criterio faltante: Empty state de tareas

La restricción de negocio #3 de SPEC 7 menciona el empty state de tareas, pero no existe un criterio formal para ese escenario. El código **sí lo implementa** (L131-147 de `project-detail.component.ts`).

**Criterio propuesto a agregar a SPEC 7:**

> **Criterio 4 (Empty state de tareas):**
>
> **Dado** que el usuario navega al detalle de un proyecto activo que no tiene tareas,
>
> **Cuando** la petición `GET /projects/{projectId}/tasks` devuelve un arreglo vacío,
>
> **Entonces** la sección de tareas muestra un mensaje amigable ("Este proyecto aún no tiene tareas asignadas") con orientación contextual según el estado del proyecto.

---

## Enmienda 8 — SPEC 8: Main Layout Shell y Navegación

**Fuente:** Code Review #8

### Criterio faltante: Restricción del botón "Atrás"

La restricción #2 de SPEC 8 menciona que el usuario no debe poder usar el botón "Atrás" tras el logout, pero no hay un criterio formal. Esto se conecta con el Fix 2b de SPECFixes2 (uso de `replaceUrl: true`).

**Criterio propuesto a agregar a SPEC 8:**

> **Criterio 4 (Protección del historial post-logout):**
>
> **Dado** que el usuario ha ejecutado el cierre de sesión,
>
> **Cuando** presiona el botón "Atrás" del navegador,
>
> **Entonces** **no** es devuelto a ninguna vista protegida de la aplicación; permanece en `/login` o es redirigido allí por el guard.

### Observación documentada: Ruta redundante

El `app.routes.ts` define dos rutas que cargan el mismo componente:
- `projects/:projectId/tasks/in-progress` → `TaskListComponent`
- `tasks/in-progress` → `TaskListComponent`

Si el `TaskListComponent` no filtra por proyecto (usa `GET /projects/tasks?status=IN_PROGRESS` de forma global), la ruta anidada bajo `/:projectId` es potencialmente confusa. Se recomienda evaluar si ambas son necesarias o si la ruta bajo el `projectId` debería filtrar tareas específicas de ese proyecto.

**Acción recomendada:** Documentar en la SPEC 8 que la ruta `projects/:projectId/tasks/in-progress` es un placeholder para una futura funcionalidad de filtrado por proyecto, o eliminarla si no será utilizada.

---

## Resumen de acciones por SPEC

| SPEC | Criterios a agregar | Correcciones documentales | Discrepancias de naming |
| --- | --- | --- | --- |
| SPEC 1 | Criterio 4 (assignee null) | Ruta de endpoint | — |
| SPEC 2 | Criterio 4 (error 400), Dividir Criterio 2 en 2a y 2b | — | — |
| SPEC 3 | Criterio 4 (error 404), Criterio 5 (cancelación) | — | `estimateHours` → `estimatedHours` |
| SPEC 4 | Criterio 4 (error POST comentario) | `CommentFormComponent` como obligatorio | — |
| SPEC 5 | Criterio 5 (logout automático por expiración) | Verificación de interceptor ✅ | — |
| SPEC 6 | Criterio 4 (error de red) | — | — |
| SPEC 7 | Criterio 4 (empty state de tareas) | — | — |
| SPEC 8 | Criterio 4 (protección historial post-logout) | Evaluar ruta redundante `tasks/in-progress` | — |

