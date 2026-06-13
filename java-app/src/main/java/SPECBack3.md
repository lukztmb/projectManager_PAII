### SPEC - Backend Feature 2: Endpoints de Consulta de Proyectos

| Campo | Descripción y criterio de calidad |
| --- | --- |
| **Nombre de la feature** | Endpoints de Lectura de Proyectos (Project Read Model) |
| **Descripción general** | Desarrollar los casos de uso y endpoints necesarios para consultar la información de los proyectos. Esto permitirá al frontend renderizar el Dashboard general y la vista de detalle de cada proyecto específico. |
| **Endpoints involucrados** | - `GET /projects` (Listado general)

  
- `GET /projects/{projectId}` (Detalle del proyecto) |
| **Restricciones de negocio** | 1. **Acceso Seguro:** Ambos endpoints deben estar protegidos por el `JwtAuthenticationFilter` implementado en la fase anterior.

  
2. **Manejo de Lista Vacía:** Si la base de datos no contiene proyectos, `GET /projects` no debe fallar; debe retornar un HTTP `200 OK` con un arreglo JSON vacío `[]`.

  
3. **Recurso Inexistente:** Si se consulta `GET /projects/{projectId}` con un ID que no existe, el sistema debe lanzar una `ResourceNotFoundException` para que el `GlobalExceptionsHandler` retorne un HTTP `404 Not Found`. |
| **Lineamientos técnicos** | - **Domain:** Añadir al `ProjectRepository` (puerto) los métodos necesarios (ej. `List<Project> findAll()`, `Optional<Project> findById(Long id)`).

  
- **Use Cases:** Crear dos nuevas clases: `GetAllProjectsUseCase` y `GetProjectByIdUseCase`. Ambas deben retornar el DTO `ProjectResponseDTO`, mapeando la entidad de dominio hacia la respuesta usando el `ProjectMapper` existente.

  
- **API:** En `ProjectController`, añadir los métodos correspondientes anotados con `@GetMapping` y `@GetMapping("/{projectId}")`. |
| **Criterios de aceptación** | **Criterio 1 (Listado general):**

  
**Dado** que existen 3 proyectos en la base de datos y un cliente autenticado hace la petición,

  
**Cuando** se ejecuta `GET /projects`,

  
**Entonces** el sistema responde con un `200 OK` y un cuerpo que contiene un arreglo JSON con los 3 `ProjectResponseDTO`.

  
  
**Criterio 2 (Detalle exitoso):**

  
**Dado** que el proyecto con ID 1 existe,

  
**Cuando** un cliente autorizado ejecuta `GET /projects/1`,

  
**Entonces** el sistema responde con un `200 OK` y el cuerpo contiene el objeto JSON correspondiente al proyecto.

  
  
**Criterio 3 (Manejo de Error 404):**

  
**Dado** que no existe el proyecto con ID 999,

  
**Cuando** se intenta acceder a `GET /projects/999`,

  
**Entonces** el caso de uso levanta una excepción y el controlador global intercepta el error, devolviendo un `404 Not Found` con la estructura de error estándar. |
