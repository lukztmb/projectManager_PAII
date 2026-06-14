### SPEC 10: Gestión de Entornos y API Handoff

| Campo | Descripción y criterio de calidad |
| --- | --- |
| **Nombre de la feature** | Gestión Dinámica de Entornos (Environment Configurations) |
| **Descripción general** | Externalizar la configuración de la URL base de la API hacia archivos de entorno de Angular. Esto permite que el mismo código fuente se conecte al Mock Server durante el desarrollo local, y al backend real de Spring Boot cuando la aplicación se compila para integración o producción. |
| **Endpoints involucrados** | - Afecta transversalmente a la Base URL de **todas** las peticiones HTTP del sistema. |
| **Restricciones de negocio** | 1. **Cero Hardcoding:** Ningún servicio (`ProjectService`, `TaskService`, `AuthService`) debe contener cadenas de texto literales como `http://localhost...` en sus llamadas `HttpClient`.

  
2. **Entorno de Desarrollo:** Por defecto, al ejecutar `ng serve`, el sistema debe seguir apuntando al Mock Server (puerto 3000).

  
3. **Entorno de Producción/Integración:** Al ejecutar `ng build`, el sistema debe inyectar la URL del backend de Java (por ejemplo, `http://localhost:8080/api` o el dominio de despliegue). |
| **Lineamientos técnicos** | - **Angular CLI:** Utilizar los archivos `environment.development.ts` y `environment.ts` nativos de Angular.

  
- **Refactorización:** Inyectar la constante `environment.apiUrl` en todos los servicios de la capa de acceso a datos (`data_access`).

  
- **Validación CORS:** Este es el punto de control donde el equipo debe asegurarse de que el backend de Java tiene configurado su `@CrossOrigin` o `CorsConfig` adecuadamente para aceptar peticiones desde el puerto de Angular (usualmente `http://localhost:4200`) enviando el header de `Authorization`. |
| **Criterios de aceptación** | **Criterio 1 (Conexión de Desarrollo):**

  
**Dado** que un desarrollador ejecuta la aplicación con `ng serve`,

  
**Cuando** se realiza una petición para cargar los proyectos,

  
**Entonces** la consola de red muestra que la petición se dirige a `http://localhost:3000/projects`.

  
  
**Criterio 2 (Conexión de Producción):**

  
**Dado** que la aplicación se compila con el flag `--configuration production` (o `ng build`),

  
**Cuando** se levanta los estáticos en un servidor como Nginx y se carga la vista,

  
**Entonces** la petición se dirige a la URL definida para el backend real de Spring Boot.

  
  
**Criterio 3 (Código Limpio):**

  
**Dado** que se realiza una revisión de código en el PR final,

  
**Cuando** el evaluador inspecciona la carpeta de `services` o `data_access`,

  
**Entonces** comprueba que no existe ninguna URL absoluta hardcodeada en los métodos `get`, `post`, etc. |

