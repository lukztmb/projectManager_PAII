### SPEC 8: Main Layout Shell & Navigation

| Campo | Descripción y criterio de calidad |
| --- | --- |
| **Nombre de la feature** | Estructura Principal y Navegación (Main Layout Shell) |
| **Descripción general** | Actúa como el contenedor principal (Wrapper) para todas las vistas privadas de la aplicación. Provee una barra de navegación persistente, control de cierre de sesión y define la grilla o estructura de diseño donde se renderizarán los componentes hijos (Projects, Tasks) a través del enrutador. |
| **Endpoints involucrados** | - No consume APIs de negocio directamente, pero orquesta la acción de "Logout" interactuando con el estado local. |
| **Restricciones de negocio** | 1. **Persistencia Visual:** El Navbar debe mantenerse fijo y no recargarse cuando el usuario navega entre el listado de proyectos y el detalle de una tarea.

  
2. **Acción de Logout:** Debe existir un botón claro para "Cerrar Sesión". Al accionarlo, el sistema debe purgar el JWT del almacenamiento local, actualizar el estado global a desconectado y redirigir inmediatamente a `/login`.

  
3. **Feedback de Usuario:** Idealmente, la cabecera debe mostrar un indicador visual de que el usuario está conectado (ej. un ícono de perfil o el correo electrónico si está disponible en el payload del JWT). |
| **Lineamientos técnicos** | - **Arquitectura:** Standalone Component (`MainLayoutComponent`). Debe contener un `<router-outlet>` en su plantilla HTML.

  
- **Estilos (Tailwind CSS):** Implementar un diseño responsivo utilizando Flexbox o CSS Grid. El layout debe ocupar el alto total de la pantalla (`min-h-screen`), dejando la parte superior para el Navbar y el resto (`flex-1`) para el contenido dinámico.

  
- **Reactividad:** Inyectar el `AuthService` para poder consumir la funcionalidad de cierre de sesión y leer Signals si fuera necesario mostrar datos del usuario activo.

  
- **Rutas Anidadas:** Nota: La ruta `projects/:projectId/tasks/in-progress` declarada en `app.routes.ts` es redundante y actúa como un placeholder para un futuro filtrado por proyecto, o bien debe removerse frente a la global `tasks/in-progress`. |
| **Criterios de aceptación** | **Criterio 1 (Envoltura de Vistas):**

  
**Dado** que un usuario está autenticado,

  
**Cuando** navega hacia la ruta `/projects`,

  
**Entonces** se renderiza el `MainLayoutComponent` mostrando la barra de navegación superior, y dentro de su `<router-outlet>` se renderiza correctamente el listado de proyectos.

  
  
**Criterio 2 (Cierre de Sesión Seguro):**

  
**Dado** que el usuario se encuentra navegando dentro de la aplicación protegida,

  
**Cuando** hace clic en el botón de "Cerrar Sesión",

  
**Entonces** el sistema elimina las credenciales, destruye la sesión reactiva y lo expulsa hacia la pantalla de `/login`, impidiendo que pueda usar el botón de "Atrás" del navegador para volver a ver datos sensibles.

  
  
**Criterio 3 (Diseño Responsivo):**

  
**Dado** que el usuario accede desde un dispositivo móvil o redimensiona la ventana,

  
**Cuando** el ancho de pantalla es inferior al breakpoint `md` de Tailwind,

  
**Entonces** el Navbar se adapta correctamente (ej. apilando los elementos o ajustando márgenes) sin romper el contenedor principal de la aplicación.

  
  
**Criterio 4 (Protección del historial post-logout):**

  
**Dado** que el usuario ha ejecutado el cierre de sesión,

  
**Cuando** presiona el botón "Atrás" del navegador,

  
**Entonces** **no** es devuelto a ninguna vista protegida de la aplicación; permanece en `/login` o es redirigido allí por el guard. |

### La justificación arquitectónica (El "Por qué")

En la defensa de tu proyecto, prepárate para justificar por qué utilizamos un Layout Component en lugar de simplemente poner el menú en el `app.component.html`:

1. **Separación de Layouts (Auth vs. Main):** Si pones el Navbar directamente en el componente raíz (`app.component`), tendrías que usar condicionales estructurales (`@if (isAuthenticated())`) para ocultarlo en la pantalla de Login o en páginas de error 404. Al crear un `MainLayoutComponent`, puedes agrupar todas las rutas protegidas bajo este layout en tu archivo de rutas (`app.routes.ts`), dejando el `LoginComponent` totalmente libre de esa estructura.
2. **Optimización del DOM:**
Al mantener el Navbar en un componente padre, Angular sabe que esa parte del DOM (Document Object Model) no debe ser destruida ni recreada durante la navegación. Solo se destruye y reconstruye lo que está dentro del `<router-outlet>`, lo que ahorra ciclos de CPU y previene "parpadeos" visuales, brindando una sensación fluida y nativa (SPA real).

### Tu turno

Este contrato marca la unificación visual de todo tu trabajo frontend. Si estás de acuerdo con el alcance:

1. Crea tu rama para esta feature (ej: `feature/main-layout`).
2. Guarda este documento como el `SPEC.md`.
3. Confírmame para proporcionarte el código. Te mostraré cómo estructurar este contenedor con Tailwind CSS y, lo más importante, cómo reconfigurar tu `app.routes.ts` para que todas tus features anteriores vivan "dentro" de este nuevo Layout usando el patrón de rutas hijas (*Child Routes*).

---

