### SPEC - Backend Feature 1: Autenticación y Seguridad JWT

| Campo | Descripción y criterio de calidad |
| --- | --- |
| **Nombre de la feature** | Autenticación de Usuario y Capa de Seguridad JWT (Spring Security) |
| **Descripción general** | Integrar Spring Security para proteger los endpoints existentes del sistema. Implementar un flujo de autenticación *Stateless* (sin estado) mediante JSON Web Tokens (JWT) que permita validar usuarios contra la base de datos y proveer acceso seguro a los recursos de proyectos y tareas. |
| **Endpoints involucrados** | - Nuevo: `POST /auth/login`

  
- Protegidos: `GET /projects/**`, `POST /projects/**`, `GET /tasks/**` (y cualquier otra ruta de negocio). |
| **Restricciones de negocio** | 1. **Acceso Público vs Privado:** El endpoint `/auth/login` debe ser de acceso público. Cualquier otro endpoint bajo `/projects` o `/tasks` debe requerir un token JWT válido.

  
2. **Autenticación (Login):** El cliente debe enviar un payload con `email` y `password`. Si las credenciales son válidas, el sistema retorna un HTTP 200 con el JWT encapsulado en un DTO (ej. `AuthResponseDTO(token)`).

  
3. **Rechazo de Credenciales:** Si el email no existe o la contraseña es incorrecta, se debe retornar un error `401 Unauthorized`.

  
4. **Expiración:** El token debe tener un tiempo de vida definido (ej. 24 horas). Un token expirado o alterado debe causar que la petición sea rechazada con un HTTP `401`. |
| **Lineamientos técnicos** | - **Domain:** Crear la entidad `User` (id, email, password) y el puerto `IUserRepository`. Crear el servicio de aplicación `AuthenticateUserUseCase`.

  
- **Infrastructure (Dependencias):** Agregar `spring-boot-starter-security` y la librería `jjwt` (io.jsonwebtoken) en el `pom.xml`.

  
- **Infrastructure (Configuración):** Crear una clase `SecurityConfig` anotada con `@Configuration` y `@EnableWebSecurity`. Configurar el `SecurityFilterChain` para deshabilitar CSRF (innecesario en API REST) y establecer `SessionCreationPolicy.STATELESS`.

  
- **Infrastructure (Filtros):** Implementar un `JwtAuthenticationFilter` (heredando de `OncePerRequestFilter`) que intercepte toda petición, extraiga el token del header `Authorization: Bearer <token>`, lo valide e inyecte el usuario en el `SecurityContextHolder`.

  
- **API:** Crear `AuthController` con el método de login validando el DTO de entrada con Jakarta Validation (`@Valid`). |
| **Criterios de aceptación** | **Criterio 1 (Login Exitoso):**

  
**Dado** que existe un usuario con email "admin@test.com" y contraseña hasheada en la base de datos,

  
**Cuando** se hace un `POST /auth/login` con esas credenciales válidas,

  
**Entonces** el sistema devuelve un `200 OK` y el cuerpo de la respuesta contiene un token JWT válido generado por el servidor.

  
  
**Criterio 2 (Acceso Protegido - Sin Token):**

  
**Dado** que el controlador de proyectos está protegido,

  
**Cuando** un cliente envía un `GET /projects` sin el encabezado `Authorization`,

  
**Entonces** la API intercepta la petición y devuelve un `401 Unauthorized` o `403 Forbidden` antes de llegar al controlador.

  
  
**Criterio 3 (Acceso Autorizado):**

  
**Dado** un cliente que posee un token JWT válido y no expirado,

  
**Cuando** envía el token en la cabecera `Authorization: Bearer <token>` a `POST /projects`,

  
**Entonces** el filtro de seguridad aprueba el token y permite la ejecución del controlador, retornando `201 Created` (si el payload del proyecto es válido). |
