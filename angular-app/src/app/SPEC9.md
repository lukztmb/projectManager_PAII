### SPEC 9: Resiliencia de Red y Notificaciones Globales

| Campo | Descripción y criterio de calidad |
| --- | --- |
| **Nombre de la feature** | Interceptor Global de Errores y Sistema de Notificaciones (Error Handling & Toast UI) |
| **Descripción general** | Implementar un mecanismo transversal que intercepte todas las respuestas HTTP fallidas. Debe proveer feedback visual no intrusivo (Toasts/Snackbars) al usuario cuando ocurran errores inesperados de red o de servidor, y manejar automáticamente la caducidad de la sesión sin requerir código repetitivo en cada componente. |
| **Endpoints involucrados** | - Afecta transversalmente a **todos** los endpoints consumidos vía `HttpClient`. |
| **Restricciones de negocio** | 1. **Manejo de Sesión Caducada (401):** Si cualquier petición a la API devuelve un `401 Unauthorized` (el JWT expiró o fue revocado), el sistema debe purgar el estado de autenticación y redirigir inmediatamente a `/login`.

  
2. **Errores de Servidor (500+):** Si el backend falla internamente, se debe mostrar un mensaje flotante rojo indicando: "Error interno del servidor. Por favor, intente más tarde."

  
3. **Evitar Duplicidad:** Los errores de negocio específicos (`409 Conflict` o `400 Bad Request`) deben dejarse pasar para que los componentes locales (ej. el formulario de crear proyecto) los manejen mostrando los textos de validación debajo de los inputs, evitando mostrar un Toast global redundante si no es necesario. |
| **Lineamientos técnicos** | - **Intercepción de Red:** Crear una función pura `errorInterceptor` (`HttpInterceptorFn`) en Angular 21 e inyectarla en el `provideHttpClient` de `app.config.ts`.

  
- **UI de Notificaciones:** Crear un `ToastService` utilizando **Angular Signals** (`signal<{message: string, type: 'error' |
| **Criterios de aceptación** | **Criterio 1 (Captura de Error de Servidor):**

  
**Dado** que el backend está caído o responde con error 500,

  
**Cuando** el usuario intenta cargar la lista de proyectos,

  
**Entonces** el interceptor captura el error, invoca al `ToastService`, y aparece una notificación flotante indicando el fallo sin que la aplicación se "congele".

  
  
**Criterio 2 (Expiración de Token Automática):**

  
**Dado** que el usuario tiene la aplicación abierta pero su JWT ha caducado,

  
**Cuando** intenta abrir el detalle de una tarea y se emite un `GET`,

  
**Entonces** el backend responde con 401, el interceptor limpia el `localStorage`, actualiza el `AuthService` a desconectado y lo redirige a la vista de login.

  
  
**Criterio 3 (Delegación de Errores 400/409):**

  
**Dado** que el usuario envía un formulario con datos inválidos,

  
**Cuando** la API responde con un `400 Bad Request` o `409 Conflict`,

  
**Entonces** el interceptor permite que el error llegue al bloque `catchError` del componente original para que este lo muestre contextualmente (ej. "Nombre de proyecto duplicado" en el formulario). |
