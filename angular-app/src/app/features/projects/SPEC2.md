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

  
  
**Criterio 2 (Validación cruzada de fechas):**

  
**Dado** que el usuario está llenando el formulario,

  
**Cuando** ingresa una `endDate` que es anterior a la `startDate` o anterior a la fecha de hoy,

  
**Entonces** el formulario se marca como inválido, se muestra un mensaje de error debajo del campo de fecha y el botón de enviar se deshabilita.

  
  
**Criterio 3 (Manejo de Conflicto - 409):**

  
**Dado** un formulario válido,

  
**Cuando** el usuario intenta crear un proyecto con un nombre que ya existe en la base de datos,

  
**Entonces** el backend responde con error 409 y la UI muestra un mensaje claro indicando que "El nombre del proyecto ya está en uso". |

