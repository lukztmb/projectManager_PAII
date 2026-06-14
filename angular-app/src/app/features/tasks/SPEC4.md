### SPEC 4: Detalles de Tarea y Gestión de Comentarios

| Campo | Descripción y criterio de calidad |
| --- | --- |
| **Nombre de la feature** | Detalle de Tarea y Adición de Comentarios (Task Detail & Comments) |
| **Descripción general** | Vista que muestra los detalles de una tarea específica, permitiendo al usuario visualizar los comentarios existentes y agregar nuevos de forma dinámica. Valida estrictamente que el contexto de la URL (Proyecto -> Tarea) sea coherente. |
| **Endpoints involucrados** | - `GET /projects/{projectId}/tasks/{taskId}?comments=true`

  
- `POST /projects/{projectId}/tasks/{taskId}/comments` |
| **Restricciones de negocio** | 1. **Jerarquía Delimitada:** Una tarea solo puede ser leída o comentada si efectivamente pertenece al `projectId` indicado en la ruta. Si hay una discrepancia, el backend rechazará la operación con un error 404.

  
2. **Payload de Comentarios:** Para enviar un comentario, es obligatorio incluir el `text` y el `author`.

  
3. **Carga Optimizada:** El endpoint `GET` debe invocarse explícitamente con el query param `comments=true` para que el backend retorne la entidad hidratada con su lista de comentarios. |
| **Lineamientos técnicos** | - **Enrutamiento (Routing):** Captura de `projectId` y `taskId` directamente de la URL mediante las Signals del Router de Angular.

  
- **Estado (State Management):** Uso de **Angular Signals** para mantener el estado de la tarea y su lista de comentarios. Al agregar un comentario con éxito, se debe actualizar la Signal local concatenando el nuevo comentario, evitando recargar toda la página.

  
- **Formularios:** **Reactive Forms** para el ingreso del nuevo comentario, garantizando que el botón de envío esté deshabilitado si el texto o el autor están vacíos.

  
- **Componentes:** Separar responsabilidades creando un componente padre (`TaskDetailComponent`) y un formulario hijo presentacional (`CommentFormComponent`), responsable de emitir un evento `commentSubmitted` al componente padre. |
| **Criterios de aceptación** | **Criterio 1 (Carga exitosa):**

  
**Dado** que el usuario navega a una ruta válida que asocia correctamente un proyecto y una tarea,

  
**Cuando** se resuelve el `GET` inicial,

  
**Entonces** la UI muestra los detalles de la tarea y la lista completa de comentarios previos.

  
  
**Criterio 2 (Adición de comentario reactiva):**

  
**Dado** que la vista de detalle de la tarea está cargada,

  
**Cuando** el usuario completa el formulario de comentarios y hace submit,

  
**Entonces** se ejecuta el `POST`, el formulario se limpia, y el nuevo comentario aparece instantáneamente al final de la lista sin recargar la página.

  
  
**Criterio 3 (Violación de Jerarquía - 404):**

  
**Dado** que un usuario manipula la URL para acceder a la `taskId` 5 bajo el `projectId` 2 (pero la tarea pertenece al proyecto 1),

  
**Cuando** se intenta cargar la vista,

  
**Entonces** el sistema captura el error HTTP devuelto por el backend y muestra una pantalla o alerta indicando "La tarea no pertenece al proyecto referenciado".

  
  
**Criterio 4 (Fallo al agregar comentario):**

  
**Dado** que el usuario completa el formulario de comentario y hace submit,

  
**Cuando** la petición `POST /projects/{projectId}/tasks/{taskId}/comments` falla por error de red o del servidor,

  
**Entonces** la UI muestra un mensaje de error dentro de la sección de comentarios indicando que no se pudo agregar el comentario, sin interrumpir la visualización de la tarea ni utilizar el `alert()` nativo del navegador. |
