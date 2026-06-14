# Plan de Implementación: Correcciones de UX, Navegación y Consistencia (SPECFixes2)

Este documento detalla la estrategia para abordar las correcciones propuestas en el documento de especificaciones `SPECFixes2.md` orientadas a mejorar la calidad del frontend sin alterar la lógica de negocio subyacente.

## User Review Required

> [!IMPORTANT]
> Se agregará un `setTimeout` de 1.5 segundos en la creación de proyectos (`project-create.component.ts`). Esto permite que el usuario lea el mensaje de éxito antes de que se produzca la redirección. Revisa si este retardo es aceptable o si prefieres una navegación instantánea.
>
> Para el Fix 2e (degradación elegante), he añadido un `catchError` individual al observable de tareas. Esto mantendrá viva la llamada al backend para obtener los detalles del proyecto principal aunque el endpoint secundario de tareas aborte, mejorando sustancialmente la experiencia del usuario (resiliencia). 

## Propuesta de Cambios

---

### Módulo Principal y Core

#### [MODIFY] auth.service.ts
- Se actualizará el método `logout()` para invocar `this.router.navigate(['/login'], { replaceUrl: true });`. Esto evitará que la página actual protegida quede guardada en el historial de navegación, previniendo que el usuario regrese utilizando el botón "Atrás" del navegador.

---

### Componentes de Proyectos

#### [MODIFY] project-create.component.ts
- Se inyectará el servicio de enrutamiento (`Router`).
- Se implementará un redireccionamiento temporizado (1500 ms) hacia `/projects` al completarse exitosamente la petición post-creación en el bloque `next()`.
- Se modificarán todos los labels, placeholders, validaciones y alertas estáticas en el template HTML hacia las traducciones en español descritas en la tabla de requisitos. Por ejemplo, "Create New Project" a "Crear Nuevo Proyecto".

#### [MODIFY] project-detail.component.ts
- Se introducirá un nuevo Signal de estado `public readonly taskLoadError = signal<string | null>(null);`.
- En el método `fetchProjectData`, se modificará el `forkJoin` para atrapar aislar el fallo potencial de las tareas usando el pipe `catchError`:
  ```typescript
  tasks: this.projectService.getProjectTasks(id).pipe(
    catchError(() => {
      this.taskLoadError.set('No se pudieron cargar las tareas del proyecto.');
      return of([]);
    })
  )
  ```
- En el template, sobre la iteración de tarjetas de tareas, se evaluará y mostrará una caja de alerta amarilla/naranja estilizada amigablemente si la señal `taskLoadError` posee valor.

---

### Componentes de Tareas

#### [MODIFY] task-create.component.ts
- Se alterará la ruta generada por `navigateBack()`. En lugar de invocar `['/projects', this.projectId(), 'tasks']` invocará `['/projects', this.projectId()]`, redireccionando de manera certera al dashboard padre.
- Se actualizará íntegramente el template HTML inyectando las equivalencias léxicas en español, tales como "Create New Task" a "Crear Nueva Tarea".

#### [MODIFY] task-detail.component.ts
- Se inspeccionará el template HTML para localizar componentes verbalizados en inglés como "Comments" o "Adding comment...", y transformarlos hacia su variante oficial en español ("Comentarios", "Agregando comentario...").

## Plan de Verificación

### Pruebas de Desarrollo (Manuales)
- **Fix 2a:** Interceptar y rellenar exitosamente el formulario de "Creación de Proyecto". Esperar un aproximado de 1.5 segundos mientras se disfruta de un mensaje de éxito, y testear que el router navega automáticamente a la URL del listado.
- **Fix 2b:** Efectuar Login y seguidamente presionar Logout. Accionar el botón de "Retorno" en el marco general del Browser de pruebas y comprobar que el layout base denegará un return directo saltando el historial.
- **Fix 2c:** Iniciar la creación de una tarea y presionar `Cancel`. Se verificará la inyección en URL del parámetro genérico para recaer en el Panel central del proyecto.
- **Fix 2d:** Verificar exhaustivamente el DOM general de `task-detail`, `project-create` y `task-create` evidenciando el uso exclusivo de la lengua española en base de UI.
- **Fix 2e:** Forzar un bloqueo de Red (desde DevTools, aborctando el endpoint de `/tasks`) y validar en el listado de Detalle de Proyecto que la información del Proyecto se consolida óptimamente, y arroja individualmente una barra de estado rojo informando que las Tareas no consiguieron poblar la data.
