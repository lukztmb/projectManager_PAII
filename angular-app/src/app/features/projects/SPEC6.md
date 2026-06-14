### SPEC 6: Dashboard y Listado de Proyectos

| Campo | Descripción y criterio de calidad |
| --- | --- |
| **Nombre de la feature** | Listado General de Proyectos (Project Dashboard) |
| **Descripción general** | Pantalla principal a la que el usuario es redirigido tras un inicio de sesión exitoso. Obtiene y muestra todos los proyectos disponibles en el sistema, sirviendo como punto de navegación central hacia la creación de nuevos proyectos o la inspección de tareas de un proyecto específico. |
| **Endpoints involucrados** | - `GET /projects` |
| **Restricciones de negocio** | 1. **Acceso Protegido:** La vista debe estar obligatoriamente bajo la protección del `AuthGuard` para evitar accesos anónimos.

  
2. **Datos Mínimos:** Cada elemento de la lista debe mostrar el `name`, las fechas (`startDate` y `endDate`) y el `status` del proyecto.

  
3. **Estado Vacío (Empty State):** Si la API no devuelve proyectos, no se debe mostrar una pantalla en blanco. Se debe mostrar un mensaje amigable y un botón destacado (Call to Action) que diga "Crear primer proyecto".

  
4. **Estados Visuales:** El color del estado (Status) debe variar según el valor (ej. Verde para `ACTIVE`, Gris para `CLOSED`, Azul para `PLANNED`). |
| **Lineamientos técnicos** | - **Arquitectura UI:** Standalone Component (`ProjectListComponent`).

  
- **Enrutamiento:** Las tarjetas o filas de proyecto deben usar la directiva `[routerLink]` para navegar hacia `/projects/:projectId`. Debe incluir un botón superior para navegar a `/projects/new`.

  
- **Gestión de Estado:** Manejo estricto con **Signals** para `projects()`, `isLoading()` y `error()`.

  
- **Maquetación:** Utilizar CSS Grid o Flexbox mediante clases de **Tailwind CSS** para crear un diseño responsivo de tarjetas (Cards). |
| **Criterios de aceptación** | **Criterio 1 (Happy Path - Renderizado de Grid):**

  
**Dado** que el usuario está autenticado y existen proyectos en base de datos,

  
**Cuando** aterriza en la ruta de proyectos,

  
**Entonces** el sistema consume `GET /projects` y renderiza una cuadrícula con las tarjetas de los proyectos, desapareciendo el indicador de carga.

  
  
**Criterio 2 (Manejo de Lista Vacía):**

  
**Dado** que el usuario autenticado ingresa al sistema,

  
**Cuando** la base de datos de proyectos está vacía (`[]`),

  
**Entonces** se renderiza un estado vacío con el mensaje "No hay proyectos activos" y se muestra un botón para redirigir al formulario de creación.

  
  
**Criterio 3 (Navegación Dinámica):**

  
**Dado** que el listado de proyectos está renderizado en pantalla,

  
**Cuando** el usuario hace clic sobre la tarjeta del proyecto con ID 5,

  
**Entonces** el router de Angular navega a la URL `/projects/5`.

  
  
**Criterio 4 (Error de red):**

  
**Dado** que el usuario autenticado intenta cargar la lista de proyectos,

  
**Cuando** el backend no está disponible o responde con un error de servidor (500+),

  
**Entonces** la UI muestra un mensaje de error visual dentro de la vista (no un `alert()`) indicando que no se pudo conectar con el servidor para obtener los proyectos. |
