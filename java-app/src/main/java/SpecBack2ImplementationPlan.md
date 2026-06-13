# Integración de Autenticación y Seguridad JWT (Spring Security)

Este cambio introduce Spring Security para proteger las rutas de la API mediante autenticación sin estado (Stateless) usando JSON Web Tokens (JWT). Se implementará un flujo de login (`POST /auth/login`), filtros de verificación para solicitudes protegidas y un inicializador de base de datos para crear un usuario administrador por defecto.

## User Review Required

> [!IMPORTANT]
> - **Impacto en los Tests Existentes**: Al activar Spring Security, todos los endpoints protegidos requerirán autenticación. Para evitar reescribir por completo las llamadas MockMvc en `ProjectControllerIntegrationTest.java`, utilizaremos la anotación `@WithMockUser` de `spring-security-test`. Esto simulará un usuario autenticado automáticamente en esos tests.

## Open Questions

> [!NOTE]
> - **Librería de JWT**: Usaremos `io.jsonwebtoken` (JJWT) versión `0.12.6`, que es la versión estable más reciente y sigue los estándares modernos de configuración de firmas con `SecretKey`. ¿Existe alguna otra versión o biblioteca de JWT específica exigida por la cátedra?
> - **Contraseña por defecto del Administrador**: Crearemos un usuario por defecto con email `admin@test.com` y contraseña `admin123` (encriptada con BCrypt) al arrancar la aplicación para permitir las pruebas de aceptación y el login inicial. ¿Estás de acuerdo con estas credenciales por defecto?

## Proposed Changes

---

### Dependencias y Pom

#### [MODIFY] [pom.xml](projectManager/java-app/pom.xml)
- Agregar dependencias para `spring-boot-starter-security`.
- Agregar dependencias de `jjwt-api`, `jjwt-impl` y `jjwt-jackson` (versión `0.12.6`).
- Agregar `spring-security-test` en el scope de test.

---

### Capa de Dominio (Domain Layer)

#### [NEW] [User.java](projectManager/java-app/src/main/java/domain/model/User.java)
- Entidad pura de dominio con atributos `id`, `email` y `password`.
- Método factoría `create` con validaciones básicas de formato.

#### [NEW] [IUserRepository.java](projectManager/java-app/src/main/java/domain/repository/IUserRepository.java)
- Interfaz del puerto de repositorio para persistencia del usuario.

#### [NEW] [IPasswordHasher.java](projectManager/java-app/src/main/java/domain/service/IPasswordHasher.java)
- Interfaz de servicio de dominio para abstracción del hash de contraseñas.

---

### Capa de Aplicación (Application Layer)

#### [NEW] [IJwtService.java](projectManager/java-app/src/main/java/application/service/IJwtService.java)
- Interfaz de servicio de aplicación para generación, extracción y validación de tokens JWT.

#### [NEW] [LoginRequestDTO.java](projectManager/java-app/src/main/java/application/dto/request/LoginRequestDTO.java)
- DTO de entrada para credenciales de login (email, password) con validaciones Jakarta.

#### [NEW] [AuthResponseDTO.java](projectManager/java-app/src/main/java/application/dto/response/AuthResponseDTO.java)
- DTO de respuesta con el token JWT devuelto.

#### [NEW] [AuthenticateUserUseCase.java](projectManager/java-app/src/main/java/application/usecase/AuthenticateUserUseCase.java)
- Caso de uso para verificar credenciales de usuario contra el repositorio y retornar el DTO con el token si es exitoso. Lanza `BadCredentialsException` si falla.

---

### Capa de Infraestructura (Infrastructure Layer)

#### [NEW] [UserEntity.java](projectManager/java-app/src/main/java/infrastructure/persistence/entities/UserEntity.java)
- Entidad JPA correspondiente a la tabla `users` en base de datos.

#### [NEW] [ISpringDataUserRepository.java](projectManager/java-app/src/main/java/infrastructure/persistence/repository/interfaces/ISpringDataUserRepository.java)
- Interfaz Spring Data JPA para accesos a base de datos.

#### [NEW] [UserRepositoryImp.java](projectManager/java-app/src/main/java/infrastructure/persistence/repository/implementations/UserRepositoryImp.java)
- Adaptador que implementa el puerto `IUserRepository` usando `ISpringDataUserRepository` y `PersistenceMapper`.

#### [MODIFY] [PersistenceMapper.java](projectManager/java-app/src/main/java/infrastructure/persistence/mapper/PersistenceMapper.java)
- Añadir métodos `toDomain` y `toEntity` para mapear `User` <-> `UserEntity`.

#### [NEW] [BCryptPasswordHasher.java](projectManager/java-app/src/main/java/infrastructure/security/BCryptPasswordHasher.java)
- Implementación de `IPasswordHasher` que delega en el `PasswordEncoder` de Spring Security.

#### [NEW] [JwtServiceImpl.java](projectManager/java-app/src/main/java/infrastructure/security/JwtServiceImpl.java)
- Implementación del puerto `IJwtService` usando JJWT para firmar y validar los tokens con una clave secreta y tiempo de expiración configurados en `application.properties`.

#### [NEW] [CustomUserDetailsService.java](projectManager/java-app/src/main/java/infrastructure/security/CustomUserDetailsService.java)
- Adaptador que implementa `UserDetailsService` de Spring Security y traduce nuestra entidad `User` de dominio a `UserDetails`.

#### [NEW] [JwtAuthenticationFilter.java](projectManager/java-app/src/main/java/infrastructure/security/JwtAuthenticationFilter.java)
- Filtro HTTP `OncePerRequestFilter` que valida la cabecera `Authorization` Bearer, autentica las peticiones válidas en el `SecurityContext` y delega las excepciones de JWT al `GlobalExceptionsHandler`.

#### [NEW] [SecurityConfig.java](projectManager/java-app/src/main/java/infrastructure/security/SecurityConfig.java)
- Configuración principal de seguridad que define el `SecurityFilterChain` (CORS activo, CSRF desactivado, política STATELESS, rutas públicas/privadas y registro del filtro JWT).

#### [NEW] [DatabaseInitializer.java](projectManager/java-app/src/main/java/infrastructure/config/DatabaseInitializer.java)
- Componente `CommandLineRunner` que inserta un usuario administrador de prueba (`admin@test.com` / `admin123`) de forma dinámica en la base de datos si no existe.

#### [NEW] [AuthController.java](projectManager/java-app/src/main/java/infrastructure/controller/AuthController.java)
- Controlador REST público para el path `/auth/login`.

#### [MODIFY] [GlobalExceptionsHandler.java](projectManager/java-app/src/main/java/infrastructure/controller/GlobalExceptionsHandler.java)
- Añadir manejadores para `BadCredentialsException` y `JwtException` para responder con códigos HTTP 401 Unauthorized y mensajes detallados.

---

### Módulo de Pruebas (Tests)

#### [MODIFY] [ProjectControllerIntegrationTest.java](projectManager/java-app/src/test/java/infrastructure/controller/ProjectControllerIntegrationTest.java)
- Añadir la anotación `@WithMockUser(username = "admin@test.com")` a nivel de clase para que sigan pasando los tests integrados existentes.

#### [NEW] [SecurityIntegrationTest.java](projectManager/java-app/src/test/java/infrastructure/controller/SecurityIntegrationTest.java)
- Pruebas de integración de seguridad específicas para:
  - `POST /auth/login` con credenciales válidas (retorna 200 OK y token).
  - `POST /auth/login` con credenciales inválidas (retorna 401 Unauthorized).
  - Petición sin token a `/projects` (retorna 401 Unauthorized o 403 Forbidden).
  - Petición con token válido a `/projects` (pasa el filtro y llega al controlador).

## Verification Plan

### Automated Tests
- Ejecutar `./mvnw clean test` en `java-app` para asegurar la compilación limpia y la superación de todos los tests de seguridad y negocio.

### Manual Verification
- Levantar el servidor localmente y probar con Postman o curl:
  - Realizar una petición a `/projects` sin token (debe retornar 401).
  - Iniciar sesión haciendo POST a `/auth/login` con credenciales (debe retornar el token).
  - Realizar la petición a `/projects` incluyendo la cabecera `Authorization: Bearer <token>` (debe retornar los datos correspondientes).
