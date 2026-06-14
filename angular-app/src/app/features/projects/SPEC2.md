### SPEC 2: Creación de Proyecto

| Campo | Descripción y criterio de calidad |
| --- | --- |
| **Nombre de la feature** | Creación de Proyecto Nuevo (Create Project Form) |
| **Descripción general** | Interfaz que permite al usuario registrar un nuevo proyecto en el sistema mediante un formulario. Debe proveer feedback visual en tiempo real sobre la validez de los datos y manejar correctamente las reglas de negocio de fechas y nombres duplicados. |
| **Endpoints involucrados** | - `POST /projects` |
| **Restricciones de negocio** | 1. **Campos obligatorios:** `name`, `startDate`, `endDate`, `status`.

  
2. **Opcional:** `description`.

  
3. **Regla de fechas:** `endDate` debe ser mayor o igual a `startDate`.

  
4. **Regla de creación:** Al momento de crear, la `endDate` debe ser mayor o igual a la fecha actual (hoy).

  
5. **Unicidad:** El nombre del proyecto debe ser único. Si ya existe, el backend devolverá un error `409 Conflict`.

  
6. **Estado inicial:** Los estados válidos en el Enum son `PLANNED`, `ACTIVE` o `CLOSED`. Para un proyecto nuevo, la UI debería restringir la selección a `PLANNED` o `ACTIVE`. |
| **Lineamientos técnicos** | - **Formularios:** Uso obligatorio de **Reactive Forms** (`FormGroup`, `FormControl`, `Validators`) de Angular debido a la necesidad de validadores cruzados (cross-field validation) para las fechas.

  
- **Componente:** Standalone component (`ProjectCreateComponent`).

  
- **Estado:** Manejo del estado de envío (loading, error, success) mediante **Angular Signals**.

  
- **Estilos:** Tailwind CSS para denotar estados de error (ej. bordes rojos en los inputs inválidos) y deshabilitar el botón de *Submit* si el formulario es inválido.

  
- **Manejo de Errores HTTP:** Capturar código `409` para mostrar alerta de "Nombre duplicado" y `400` para errores de validación del backend. |
| **Criterios de aceptación** | **Criterio 1 (Happy Path):**

  
**Dado** que el usuario llena todos los campos obligatorios correctamente,

  
**Cuando** presiona el botón de guardar,

  
**Entonces** el sistema envía la petición `POST`, recibe un `201 Created` y muestra un mensaje de éxito (o redirige al listado).

  
  
**Criterio 2a (endDate ≥ startDate):**

  
**Dado** que el usuario completa el formulario,

  
**Cuando** ingresa una `endDate` anterior a la `startDate`,

  
**Entonces** el formulario se marca como inválido con el mensaje "La fecha de fin debe ser mayor o igual a la fecha de inicio" y el botón se deshabilita.

  
  
**Criterio 2b (endDate ≥ hoy):**

  
**Dado** que el usuario completa el formulario,

  
**Cuando** ingresa una `endDate` anterior a la fecha actual,

  
**Entonces** el campo `endDate` se marca individualmente como inválido con el mensaje "La fecha de fin no puede ser anterior a hoy" y el botón se deshabilita.

  
  
**Criterio 3 (Manejo de Conflicto - 409):**

  
**Dado** un formulario válido,

  
**Cuando** el usuario intenta crear un proyecto con un nombre que ya existe en la base de datos,

  
**Entonces** el backend responde con error 409 y la UI muestra un mensaje claro indicando que "El nombre del proyecto ya está en uso".

  
  
**Criterio 4 (Validación del backend - 400):**

  
**Dado** que el usuario envía un formulario con datos que pasan la validación del frontend,

  
**Cuando** el backend rechaza los datos con un error `400 Bad Request` (por restricciones de validación del servidor),

  
**Entonces** la UI captura el error y muestra un mensaje genérico indicando "Error de validación del servidor. Revise los datos ingresados." sin romper la experiencia de usuario. |

