# Plan de Implementación: Enmiendas a Especificaciones Técnicas (SPECFixes3)

Este documento detalla la estrategia para aplicar las correcciones y adiciones a los documentos de especificaciones (`SPEC1.md` a `SPEC8.md`), de acuerdo a los hallazgos en `SPECFixes3.md`. El objetivo es alinear la documentación formal con la implementación actual de la base de código.

## User Review Required

> [!IMPORTANT]
> Revisa detenidamente las adiciones de los nuevos Criterios de Aceptación a las especificaciones. Estas modificaciones son de carácter estrictamente documental y **no alterarán** el código de producción.

## Propuesta de Cambios

---

### Módulo de Tareas

#### [MODIFY] src/app/features/tasks/SPEC1.md
- **Endpoints involucrados:** Actualizar de `GET /tasks?status=IN_PROGRESS` a `GET /projects/tasks?status=IN_PROGRESS` para reflejar la ruta relativa real.
- **Criterios de Aceptación:** Agregar el **Criterio 4 (Assignee nulo)**, detallando que las tareas sin responsable definido mostrarán "Sin asignar" en la vista.

#### [MODIFY] src/app/features/tasks/SPEC3.md
- **Restricciones de negocio:** Corregir la nomenclatura de `estimateHours` a `estimatedHours` en la restricción #2.
- **Criterios de Aceptación:** 
  - Agregar el **Criterio 4 (Proyecto no encontrado - 404)** detallando el comportamiento ante la eliminación del proyecto padre.
  - Agregar el **Criterio 5 (Flujo de cancelación)** para documentar el retorno al detalle del proyecto tras presionar "Cancelar".

#### [MODIFY] src/app/features/tasks/SPEC4.md
- **Lineamientos técnicos:** Remover la condicionalidad ("si la complejidad lo amerita") del `CommentFormComponent` e indicar claramente que es un componente presentacional obligatorio responsable de emitir `commentSubmitted`.
- **Criterios de Aceptación:** Agregar el **Criterio 4 (Fallo al agregar comentario)**, cubriendo el escenario de fallo de red/servidor durante un `POST /comments`.

---

### Módulo de Proyectos

#### [MODIFY] src/app/features/projects/SPEC2.md
- **Criterios de Aceptación:** 
  - Dividir el actual "Criterio 2 (Validación cruzada de fechas)" en dos: **Criterio 2a (endDate ≥ startDate)** y **Criterio 2b (endDate ≥ hoy)**.
  - Agregar el **Criterio 4 (Validación del backend - 400)** para reflejar la captura de errores 400 por validaciones del lado del servidor.

#### [MODIFY] src/app/features/projects/SPEC6.md
- **Criterios de Aceptación:** Agregar el **Criterio 4 (Error de red)** para documentar la respuesta de la interfaz frente a un fallo 500+ en el listado de proyectos.

#### [MODIFY] src/app/features/projects/SPEC7.md
- **Criterios de Aceptación:** Agregar el **Criterio 4 (Empty state de tareas)** especificando el mensaje a renderizar cuando el proyecto no cuenta con tareas asignadas.

---

### Módulo de Autenticación y Core

#### [MODIFY] src/app/features/auth/SPEC5.md
- **Criterios de Aceptación:** Agregar el **Criterio 5 (Logout automático por token expirado)** detallando la redirección a `/login` frente a una respuesta `401 Unauthorized` desde el backend. *(Nota: La implementación del interceptor HTTP ya se verificó como correcta y no requiere intervención).*

#### [MODIFY] src/app/SPEC8.md
- **Lineamientos técnicos:** Agregar una nota especificando que la ruta `projects/:projectId/tasks/in-progress` es redundante y actúa como placeholder para futuros filtrados por proyecto, evaluando su futura remoción frente a `tasks/in-progress`.
- **Criterios de Aceptación:** Agregar el **Criterio 4 (Protección del historial post-logout)** definiendo la retención de la redirección hacia `/login` al usar el botón de retroceso tras cerrar sesión.

## Plan de Verificación

### Verificación Manual Documental
- Inspeccionar cada uno de los 8 archivos modificados (`SPEC1.md` a `SPEC8.md`) y comprobar que el formato Markdown (tablas, negritas, L/L y Given/When/Then) se preserva íntegro.
- Revisar que la nomenclatura (e.g., `estimatedHours` en SPEC3) sea idéntica al código real utilizado.
