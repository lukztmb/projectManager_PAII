### SPEC - Infrastructure: Despliegue Conjunto y Handoff (End-to-End)

| Campo | Descripción y criterio de calidad |
| --- | --- |
| **Nombre de la feature** | Orquestación de Contenedores e Integración End-to-End (Docker Compose) |
| **Descripción general** | Unificar el frontend, el backend y la base de datos en un entorno de red aislado mediante Docker. Conectar la aplicación Angular para que consuma la API REST real de Spring Boot, validando el flujo completo de datos desde el navegador hasta la persistencia en PostgreSQL. |
| **Componentes involucrados** | - Base de Datos: `PostgreSQL 15+`

  
- Backend: `java-app` (Spring Boot 3)

  
- Frontend: `angular-app` (Angular 21 servido mediante Nginx) |
| **Restricciones de negocio** | 1. **Cero Configuración Manual:** El evaluador no debe necesitar instalar Node.js, Maven, ni Java en su máquina anfitriona. Todo debe compilarse y ejecutarse dentro de los contenedores.

  
2. **Persistencia de Datos:** La base de datos PostgreSQL debe usar volúmenes de Docker (`volumes`) para no perder la información si el contenedor se reinicia.

  
3. **Flujo de Red:** El frontend se comunicará con el backend a través de los puertos expuestos hacia el *host* (ej. `localhost:8080`), mientras que el backend se comunicará con la base de datos usando la red interna de Docker. |
| **Lineamientos técnicos** | - **Frontend (Angular):** Modificar `environment.development.ts` y `environment.ts` para que `apiUrl` apunte a `http://localhost:8080` (o el prefijo que hayas definido, ej. `/api`). Crear un `Dockerfile` multi-stage que primero compile con Node y luego sirva los archivos estáticos con `nginx:alpine`.

  
- **Backend (Java):** Actualizar `application.properties` para apuntar a la URL del contenedor de base de datos (ej. `jdbc:postgresql://db:5432/project_manager`). Crear un `Dockerfile` multi-stage que compile con Maven/Eclipse Temurin y luego ejecute el `.jar`.

  
- **Orquestador:** Crear un `docker-compose.yml` en la raíz del proyecto que defina los servicios `db`, `backend`, y `frontend`, estableciendo las dependencias (`depends_on`) para que el backend espere a la base de datos. |
| **Criterios de aceptación** | **Criterio 1 (Construcción e Inicialización):**

  
**Dado** que un usuario clona el repositorio en una máquina limpia con Docker,

  
**Cuando** ejecuta `docker compose up --build`,

  
**Entonces** las tres imágenes se construyen/descargan exitosamente y los contenedores se levantan sin errores de conexión o compilación.

  
  
**Criterio 2 (Flujo End-to-End - Happy Path):**

  
**Dado** que los contenedores están corriendo,

  
**Cuando** el usuario ingresa a `http://localhost:4200` (o el puerto configurado de Nginx) y se autentica,

  
**Entonces** puede navegar por el sistema, crear un proyecto y ver cómo se refleja exitosamente consumiendo los datos de Spring Boot.

  
  
**Criterio 3 (Validación de Auditoría Persistente):**

  
**Dado** que el usuario creó una nueva tarea desde el navegador,

  
**Cuando** un administrador inspecciona la base de datos PostgreSQL,

  
**Entonces** verifica que la tabla `service_log` contiene el registro exacto de la operación generada por esa acción. |
