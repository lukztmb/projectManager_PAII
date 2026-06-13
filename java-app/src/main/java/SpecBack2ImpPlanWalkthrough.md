# Walkthrough - Módulo de Seguridad y Autenticación JWT

Se ha integrado correctamente Spring Security al backend para proveer seguridad perimetral a todos los recursos de proyectos y tareas, implementando un flujo de login seguro *Stateless* con JSON Web Tokens (JWT).

## Cambios Realizados

### Dependencias
- **[pom.xml](projectManager/java-app/pom.xml)**:
  - Añadido `spring-boot-starter-security`.
  - Añadidas dependencias de JJWT (`jjwt-api`, `jjwt-impl` y `jjwt-jackson` versión `0.12.6`).
  - Añadido `spring-security-test` para dar soporte a la autenticación en MockMvc.

### Capa de Dominio (Domain Layer)
- **[User.java](projectManager/java-app/src/main/java/domain/model/User.java)**: Entidad de dominio pura con atributos `id`, `email` y `password`.
- **[IUserRepository.java](projectManager/java-app/src/main/java/domain/repository/IUserRepository.java)**: Puerto del repositorio.
- **[IPasswordHasher.java](projectManager/java-app/src/main/java/domain/service/IPasswordHasher.java)**: Puerto del servicio de hasheo de contraseñas.

### Capa de Aplicación (Application Layer)
- **[IJwtService.java](projectManager/java-app/src/main/java/application/service/IJwtService.java)**: Puerto del servicio JWT.
- **[LoginRequestDTO.java](projectManager/java-app/src/main/java/application/dto/request/LoginRequestDTO.java)** y **[AuthResponseDTO.java](projectManager/java-app/src/main/java/application/dto/response/AuthResponseDTO.java)**: DTOs para solicitudes y respuestas de autenticación.
- **[AuthenticateUserUseCase.java](projectManager/java-app/src/main/java/application/usecase/AuthenticateUserUseCase.java)**: Caso de uso que valida las credenciales y genera un token JWT si son correctas. Lanza `BadCredentialsException` si fallan.

### Capa de Infraestructura (Infrastructure Layer)
- **[UserEntity.java](projectManager/java-app/src/main/java/infrastructure/persistence/entities/UserEntity.java)** y **[ISpringDataUserRepository.java](projectManager/java-app/src/main/java/infrastructure/persistence/repository/interfaces/ISpringDataUserRepository.java)**: Entidad e interfaz JPA de Spring Data para la tabla `users`.
- **[UserRepositoryImp.java](projectManager/java-app/src/main/java/infrastructure/persistence/repository/implementations/UserRepositoryImp.java)**: Adaptador que implementa el puerto `IUserRepository`.
- **[PersistenceMapper.java](projectManager/java-app/src/main/java/infrastructure/persistence/mapper/PersistenceMapper.java)**: Añadidos mapeos entre `User` y `UserEntity`.
- **[BCryptPasswordHasher.java](projectManager/java-app/src/main/java/infrastructure/security/BCryptPasswordHasher.java)**: Adaptador de hasheo que utiliza `PasswordEncoder` de Spring.
- **[JwtServiceImpl.java](projectManager/java-app/src/main/java/infrastructure/security/JwtServiceImpl.java)**: Implementación de JJWT para firmar y validar los tokens JWT.
- **[CustomUserDetailsService.java](projectManager/java-app/src/main/java/infrastructure/security/CustomUserDetailsService.java)**: Adaptador de Spring `UserDetailsService` para cargar el usuario desde el repositorio de dominio.
- **[JwtAuthenticationFilter.java](projectManager/java-app/src/main/java/infrastructure/security/JwtAuthenticationFilter.java)**: Filtro HTTP que procesa cabeceras `Authorization` Bearer, poblando el contexto de seguridad. Las excepciones JWT son derivadas al handler de excepciones global.
- **[SecurityConfig.java](projectManager/java-app/src/main/java/infrastructure/security/SecurityConfig.java)**: Configuración general de Spring Security que habilita CORS, deshabilita CSRF, marca la sesión como STATELESS, abre el login y protege los endpoints bajo `/projects/**` y `/tasks/**`.
- **[DatabaseInitializer.java](projectManager/java-app/src/main/java/infrastructure/config/DatabaseInitializer.java)**: Siembra un usuario administrador predeterminado (`admin@test.com` / `admin123`) al iniciar la aplicación.
- **[AuthController.java](projectManager/java-app/src/main/java/infrastructure/controller/AuthController.java)**: Controlador público que expone `/auth/login`.
- **[GlobalExceptionsHandler.java](projectManager/java-app/src/main/java/infrastructure/controller/GlobalExceptionsHandler.java)**: Añadidos interceptores de excepciones para `BadCredentialsException` y `JwtException` para retornar HTTP `401 Unauthorized`.

---

## Pruebas y Resultados de Validación

### Pruebas Automatizadas
Se han implementado pruebas en **[SecurityIntegrationTest.java](projectManager/java-app/src/test/java/infrastructure/controller/SecurityIntegrationTest.java)** y adaptado las existentes en **[ProjectControllerIntegrationTest.java](projectManager/java-app/src/test/java/infrastructure/controller/ProjectControllerIntegrationTest.java)**.

Ejecutamos la suite de pruebas mediante:
```powershell
.\mvnw clean test
```

Resultados obtenidos:
- **Total de pruebas ejecutadas**: 66 (las 62 iniciales del negocio + 4 nuevas de seguridad perimetral)
- **Fallas**: 0
- **Errores**: 0
- **Resultado**: `BUILD SUCCESS` (Compilación limpia y paso del 100% de los tests).
