/*
 * package infrastructure.controller;
 * 
 * import application.dto.request.ProjectRequestDTO;
 * import application.dto.request.TaskCommentRequestDTO;
 * import application.dto.request.TaskRequestDTO;
 * import domain.model.ProjectStatus;
 * import domain.model.TaskStatus;
 * import model.integradorsinteclados.IntegradorSinTecladosApplication;
 * import org.junit.jupiter.api.BeforeEach;
 * import org.junit.jupiter.api.DisplayName;
 * import org.junit.jupiter.api.Test;
 * import org.springframework.beans.factory.annotation.Autowired;
 * import
 * org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
 * import org.springframework.boot.test.context.SpringBootTest;
 * import org.springframework.http.MediaType;
 * import org.springframework.test.web.servlet.MockMvc;
 * import org.springframework.transaction.annotation.Transactional;
 * import com.fasterxml.jackson.databind.ObjectMapper;
 * 
 * import java.time.LocalDate;
 * import java.time.LocalDateTime;
 * import java.time.format.DateTimeFormatter;
 * 
 * import static org.hamcrest.Matchers.hasSize;
 * import static
 * org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
 * import static
 * org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
 * import static
 * org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
 * 
 * 
 * Pruebas de integración de Endpoints (Controllers)
 * Verifica toda la cadena: HTTP -> Controller -> UseCase -> Repository -> PSQL
 * 
 * @SpringBootTest(classes = IntegradorSinTecladosApplication.class)
 * 
 * @AutoConfigureMockMvc
 * 
 * @Transactional // Asegura que la DB se limpie después de cada test
 * 
 * @org.springframework.security.test.context.support.WithMockUser(username =
 * "admin@test.com")
 * public class ProjectControllerIntegrationTest {
 * 
 * @Autowired
 * private MockMvc mockMvc;
 * 
 * @Autowired
 * private ObjectMapper objectMapper;
 * 
 * @Autowired
 * private infrastructure.persistence.repository.interfaces.
 * ISpringDataServiceLogRepository serviceLogRepository;
 * 
 * // Formato para enviar fechas y horas en JSON (ISO-8601)
 * private final DateTimeFormatter formatter =
 * DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
 * 
 * private Long activeProjectId;
 * private Long activeTaskId;
 * 
 * @BeforeEach
 * void setUp() throws Exception {
 * // Configuramos un proyecto y una tarea válidos que serán usados por varios
 * // tests
 * activeProjectId = createProject("Proyecto Base Test", ProjectStatus.ACTIVE);
 * activeTaskId = createTask(activeProjectId, "Tarea Base Test",
 * TaskStatus.TODO);
 * }
 * 
 * // --- Métodos Auxiliares ---
 * 
 * private Long createProject(String name, ProjectStatus status) throws
 * Exception {
 * ProjectRequestDTO request = new ProjectRequestDTO(
 * name,
 * LocalDate.now().minusDays(1),
 * LocalDate.now().plusDays(10),
 * status,
 * "Proyecto de prueba para integración");
 * 
 * String responseJson = mockMvc.perform(post("/projects")
 * .contentType(MediaType.APPLICATION_JSON)
 * .content(objectMapper.writeValueAsString(request)))
 * .andExpect(status().isCreated())
 * .andReturn().getResponse().getContentAsString();
 * 
 * return objectMapper.readTree(responseJson).get("id").asLong();
 * }
 * 
 * private Long createTask(Long projectId, String title, TaskStatus status)
 * throws Exception {
 * LocalDateTime now = LocalDateTime.now().plusMinutes(1);
 * TaskRequestDTO request = new TaskRequestDTO(
 * null,
 * title,
 * 10,
 * "Test Assignee",
 * status,
 * now.plusDays(5),
 * now);
 * 
 * String responseJson = mockMvc.perform(post("/projects/" + projectId +
 * "/tasks")
 * .contentType(MediaType.APPLICATION_JSON)
 * .content(objectMapper.writeValueAsString(request)))
 * .andExpect(status().isCreated())
 * .andReturn().getResponse().getContentAsString();
 * 
 * return objectMapper.readTree(responseJson).get("id").asLong();
 * }
 * 
 * // --- 1. POST /projects ---
 * 
 * @Test
 * 
 * @DisplayName("Debe crear un Proyecto y devolver 201 Created")
 * void testCreateProject_ShouldReturn201_WhenDataIsValid() throws Exception {
 * ProjectRequestDTO requestDTO = new ProjectRequestDTO(
 * "Proyecto Nuevo Test",
 * LocalDate.now().plusDays(1),
 * LocalDate.now().plusDays(30),
 * ProjectStatus.PLANNED,
 * "Descripción de la prueba");
 * 
 * mockMvc.perform(post("/projects")
 * .contentType(MediaType.APPLICATION_JSON)
 * .content(objectMapper.writeValueAsString(requestDTO)))
 * .andExpect(status().isCreated()) // 201 Created
 * .andExpect(header().exists("Location")) // Verifica que existe el Location
 * Header
 * .andExpect(jsonPath("$.id").exists())
 * .andExpect(jsonPath("$.name").value("Proyecto Nuevo Test"));
 * }
 * 
 * @Test
 * 
 * @DisplayName("Debe fallar (409) si el nombre del Proyecto está duplicado")
 * void testCreateProject_ShouldReturn409_WhenNameIsDuplicated() throws
 * Exception {
 * // proyecto creado en el setUp
 * ProjectRequestDTO requestDTO = new ProjectRequestDTO(
 * "Proyecto Base Test",
 * LocalDate.now().minusDays(1),
 * LocalDate.now().plusDays(10),
 * ProjectStatus.ACTIVE,
 * "Intento de duplicado");
 * 
 * mockMvc.perform(post("/projects")
 * .contentType(MediaType.APPLICATION_JSON)
 * .content(objectMapper.writeValueAsString(requestDTO)))
 * .andExpect(status().isConflict()) // 409 Conflict
 * .andExpect(jsonPath("$.error").
 * value("Ya existe un proyecto con el mismo nombre"));
 * }
 * 
 * // ---------------------------------------------------------------------
 * 
 * // --- 2. POST /projects/{projectId}/tasks ---
 * 
 * @Test
 * 
 * @DisplayName("Debe crear una Tarea y devolver 201 Created")
 * void testCreateTask_ShouldReturn201_WhenDataIsValid() throws Exception {
 * LocalDateTime start = LocalDateTime.now().plusMinutes(5);
 * TaskRequestDTO requestDTO = new TaskRequestDTO(
 * null,
 * "Tarea POST Test",
 * 15,
 * "Test Developer",
 * TaskStatus.IN_PROGRESS,
 * start.plusDays(2),
 * start);
 * 
 * mockMvc.perform(post("/projects/{projectId}/tasks", activeProjectId)
 * .contentType(MediaType.APPLICATION_JSON)
 * .content(objectMapper.writeValueAsString(requestDTO)))
 * .andExpect(status().isCreated()) // 201 Created
 * .andExpect(header().exists("Location"))
 * .andExpect(jsonPath("$.id").exists())
 * .andExpect(jsonPath("$.title").value("Tarea POST Test"))
 * .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
 * }
 * 
 * @Test
 * 
 * @DisplayName("Debe fallar (409) si la Tarea se intenta agregar a un Proyecto CLOSED"
 * )
 * void testCreateTask_ShouldReturn409_WhenProjectIsClosed() throws Exception {
 * Long closedProjectId = createProject("Proyecto Cerrado",
 * ProjectStatus.CLOSED);
 * 
 * LocalDateTime start = LocalDateTime.now().plusMinutes(5);
 * TaskRequestDTO requestDTO = new TaskRequestDTO(
 * null,
 * "Tarea para proyecto cerrado",
 * 15,
 * "Test Developer",
 * TaskStatus.IN_PROGRESS,
 * start.plusDays(2),
 * start);
 * 
 * mockMvc.perform(post("/projects/{projectId}/tasks", closedProjectId)
 * .contentType(MediaType.APPLICATION_JSON)
 * .content(objectMapper.writeValueAsString(requestDTO)))
 * .andExpect(status().isConflict()) // 409 Conflict
 * .andExpect(jsonPath("$.error").value(
 * "No se puede agregar una tarea a un proyecto Cerrado (CLOSED)."));
 * }
 * 
 * // ---------------------------------------------------------------------
 * 
 * // --- 3. POST /projects/{projectId}/tasks/{taskId}/comments ---
 * 
 * @Test
 * 
 * @DisplayName("Debe agregar un comentario a una Tarea y devolver 201 Created")
 * void testAddCommentToTask_ShouldReturn201_WhenDataIsValid() throws Exception
 * {
 * TaskCommentRequestDTO requestDTO = new TaskCommentRequestDTO(
 * "¡Excelente trabajo, sigue así!",
 * "El Jefe");
 * 
 * mockMvc.perform(post("/projects/{projectId}/tasks/{taskId}/comments",
 * activeProjectId, activeTaskId)
 * .contentType(MediaType.APPLICATION_JSON)
 * .content(objectMapper.writeValueAsString(requestDTO)))
 * .andExpect(status().is(201)) // 201 Created
 * .andExpect(jsonPath("$.id").exists())
 * .andExpect(jsonPath("$.text").value("¡Excelente trabajo, sigue así!"));
 * }
 * 
 * @Test
 * 
 * @DisplayName("Debe fallar (404) si se intenta comentar una Tarea inexistente"
 * )
 * void testAddCommentToTask_ShouldReturn404_WhenTaskNotFound() throws Exception
 * {
 * TaskCommentRequestDTO requestDTO = new TaskCommentRequestDTO("Comentario",
 * "Autor");
 * Long nonExistentTaskId = 999L;
 * 
 * mockMvc.perform(post("/projects/{projectId}/tasks/{taskId}/comments",
 * activeProjectId,
 * nonExistentTaskId)
 * .contentType(MediaType.APPLICATION_JSON)
 * .content(objectMapper.writeValueAsString(requestDTO)))
 * .andExpect(status().isNotFound()) // 404 Not Found
 * .andExpect(jsonPath("$.error").value("Task not found with id: " +
 * nonExistentTaskId));
 * }
 * 
 * // ---------------------------------------------------------------------
 * 
 * // --- 4. GET /tasks?status={status} ---
 * 
 * @Test
 * 
 * @DisplayName("Debe devolver las tareas con el estado especificado (IN_PROGRESS)"
 * )
 * void testFindTasks_ShouldReturnTasksByStatus() throws Exception {
 * // ARRANGE: Creamos 2 tareas IN_PROGRESS y 1 DONE
 * createTask(activeProjectId, "Tarea 1 IP", TaskStatus.IN_PROGRESS);
 * createTask(activeProjectId, "Tarea 2 IP", TaskStatus.IN_PROGRESS);
 * createTask(activeProjectId, "Tarea 3 DONE", TaskStatus.DONE);
 * 
 * // ACT & ASSERT
 * mockMvc.perform(get("/projects/tasks")
 * .param("status", "IN_PROGRESS"))
 * .andExpect(status().isOk()) // 200 OK
 * .andExpect(jsonPath("$", hasSize(2))) // Espera 2 tareas
 * .andExpect(jsonPath("$[0].title").value("Tarea 1 IP"))
 * .andExpect(jsonPath("$[1].status").value("IN_PROGRESS"));
 * }
 * 
 * @Test
 * 
 * @DisplayName("Debe devolver una lista vacía si no hay tareas con el estado")
 * void testFindTasks_ShouldReturnEmptyListWhenNoneMatch() throws Exception {
 * // ARRANGE: Todas las tareas son TODO o IN_PROGRESS, probaremos por DONE
 * 
 * // ACT & ASSERT
 * mockMvc.perform(get("/projects/tasks")
 * .param("status", TaskStatus.DONE.toString()))
 * .andExpect(status().isOk()) // 200 OK
 * .andExpect(jsonPath("$", hasSize(0))); // Espera 0 tareas
 * }
 * 
 * // ---------------------------------------------------------------------
 * 
 * // --- 5. GET /projects/{projectId}/tasks/{taskId}?comments={boolean} ---
 * 
 * @Test
 * 
 * @DisplayName("Debe devolver la tarea SIN comentarios (comments=false)")
 * void testGetTaskById_ShouldReturnTaskWithoutComments() throws Exception {
 * // ARRANGE: Se agrega un comentario, pero se pide no incluirlo
 * TaskCommentRequestDTO commentRequest = new
 * TaskCommentRequestDTO("Comentario Test", "Test Author");
 * mockMvc.perform(post("/projects/{projectId}/tasks/{taskId}/comments",
 * activeProjectId, activeTaskId)
 * .contentType(MediaType.APPLICATION_JSON)
 * .content(objectMapper.writeValueAsString(commentRequest)))
 * .andExpect(status().is(201));
 * 
 * // ACT & ASSERT
 * mockMvc.perform(get("/projects/{projectId}/tasks/{taskId}", activeProjectId,
 * activeTaskId)
 * .param("comments", "false")) // comments=false (default value)
 * .andExpect(status().isOk())
 * .andExpect(jsonPath("$.id").value(activeTaskId))
 * .andExpect(jsonPath("$.title").value("Tarea Base Test"))
 * .andExpect(jsonPath("$.comments").doesNotExist());
 * }
 * 
 * @Test
 * 
 * @DisplayName("Debe devolver la tarea CON comentarios (comments=true)")
 * void testGetTaskById_ShouldReturnTaskWithComments() throws Exception {
 * // ARRANGE: Se agregan dos comentarios a la tarea base
 * TaskCommentRequestDTO commentRequest1 = new
 * TaskCommentRequestDTO("Primer comentario", "User A");
 * TaskCommentRequestDTO commentRequest2 = new
 * TaskCommentRequestDTO("Segundo comentario", "User B");
 * 
 * mockMvc.perform(post("/projects/{projectId}/tasks/{taskId}/comments",
 * activeProjectId, activeTaskId)
 * .contentType(MediaType.APPLICATION_JSON)
 * .content(objectMapper.writeValueAsString(commentRequest1)));
 * 
 * mockMvc.perform(post("/projects/{projectId}/tasks/{taskId}/comments",
 * activeProjectId, activeTaskId)
 * .contentType(MediaType.APPLICATION_JSON)
 * .content(objectMapper.writeValueAsString(commentRequest2)));
 * 
 * // ACT & ASSERT
 * mockMvc.perform(get("/projects/{projectId}/tasks/{taskId}", activeProjectId,
 * activeTaskId)
 * .param("comments", "true"))
 * .andExpect(status().isOk())
 * .andExpect(jsonPath("$.id").value(activeTaskId))
 * .andExpect(jsonPath("$.comments", hasSize(2))) // Verifica que se devuelven 2
 * // comentarios
 * .andExpect(jsonPath("$.comments[0].text").value("Primer comentario"));
 * }
 * 
 * @Test
 * 
 * @DisplayName("Debe fallar (404) al buscar una Tarea inexistente")
 * void testGetTaskById_ShouldReturn404_WhenTaskNotFound() throws Exception {
 * Long nonExistentTaskId = 9999L;
 * 
 * mockMvc.perform(get("/projects/{projectId}/tasks/{taskId}", activeProjectId,
 * nonExistentTaskId)
 * .param("comments", "false"))
 * .andExpect(status().isNotFound()) // 404 Not Found
 * .andExpect(jsonPath("$.error").value("Task not found with id: " +
 * nonExistentTaskId));
 * }
 * 
 * @Test
 * 
 * @DisplayName("Debe fallar (404) al buscar una Tarea con un ID de proyecto incorrecto (jerarquía incorrecta)"
 * )
 * void testGetTaskById_ShouldReturn404_WhenProjectMismatch() throws Exception {
 * Long mismatchedProjectId = activeProjectId + 999; // ID diferente
 * 
 * mockMvc.perform(get("/projects/{projectId}/tasks/{taskId}",
 * mismatchedProjectId, activeTaskId)
 * .param("comments", "false"))
 * .andExpect(status().isNotFound()) // 404 Not Found
 * .andExpect(jsonPath("$.error").value("Task with id: " + activeTaskId
 * + " does not belong to project with id: " + mismatchedProjectId));
 * }
 * 
 * @Test
 * 
 * @DisplayName("Debe fallar (404) al comentar una Tarea con un ID de proyecto incorrecto (jerarquía incorrecta)"
 * )
 * void testAddCommentToTask_ShouldReturn404_WhenProjectMismatch() throws
 * Exception {
 * TaskCommentRequestDTO requestDTO = new TaskCommentRequestDTO("Comentario",
 * "Autor");
 * Long mismatchedProjectId = activeProjectId + 999; // ID diferente
 * 
 * mockMvc.perform(post("/projects/{projectId}/tasks/{taskId}/comments",
 * mismatchedProjectId, activeTaskId)
 * .contentType(MediaType.APPLICATION_JSON)
 * .content(objectMapper.writeValueAsString(requestDTO)))
 * .andExpect(status().isNotFound()) // 404 Not Found
 * .andExpect(jsonPath("$.error").value("Task with id: " + activeTaskId
 * + " does not belong to project with id: " + mismatchedProjectId));
 * }
 * 
 * // --- Endpoints de Lectura de Proyectos ---
 * 
 * @Test
 * 
 * @DisplayName("Debe devolver todos los proyectos creados (200 OK)")
 * void testGetAllProjects_ShouldReturnList() throws Exception {
 * mockMvc.perform(get("/projects"))
 * .andExpect(status().isOk())
 * .andExpect(jsonPath("$").isArray())
 * .andExpect(jsonPath("$[0].id").value(activeProjectId));
 * }
 * 
 * @Test
 * 
 * @DisplayName("Debe devolver el detalle del proyecto por ID (200 OK)")
 * void testGetProjectById_ShouldReturnProject() throws Exception {
 * mockMvc.perform(get("/projects/{projectId}", activeProjectId))
 * .andExpect(status().isOk())
 * .andExpect(jsonPath("$.id").value(activeProjectId))
 * .andExpect(jsonPath("$.name").value("Proyecto Base Test"));
 * }
 * 
 * @Test
 * 
 * @DisplayName("Debe fallar (404) si el proyecto a buscar no existe")
 * void testGetProjectById_ShouldReturn404_WhenNotFound() throws Exception {
 * Long nonExistentId = 9999L;
 * mockMvc.perform(get("/projects/{projectId}", nonExistentId))
 * .andExpect(status().isNotFound())
 * .andExpect(jsonPath("$.error").value("Project not found with id: " +
 * nonExistentId));
 * }
 * 
 * @Test
 * 
 * @DisplayName("Debe registrar de forma transversal logs de auditoria al crear proyectos, tareas y comentarios"
 * )
 * void testAuditLogging_ShouldPersistLogs_WhenEntitiesAreCreated() throws
 * Exception {
 * // Al iniciar el test, setUp() ya creó 1 proyecto y 1 tarea.
 * // Verificamos que ya existan logs para ellos
 * java.util.List<infrastructure.persistence.entities.ServiceLogEntity> logs =
 * serviceLogRepository.findAll();
 * 
 * // Debe haber al menos los de la inicializacion (1 de project, 1 de task)
 * org.junit.jupiter.api.Assertions.assertTrue(logs.size() >= 2);
 * 
 * // Creamos un nuevo proyecto para probar el log directamente en este test
 * ProjectRequestDTO newProjectRequest = new ProjectRequestDTO(
 * "Proyecto Auditoria",
 * LocalDate.now().plusDays(2),
 * LocalDate.now().plusDays(20),
 * ProjectStatus.ACTIVE,
 * "Descripcion auditoria"
 * );
 * 
 * String projectResponseJson = mockMvc.perform(post("/projects")
 * .contentType(MediaType.APPLICATION_JSON)
 * .content(objectMapper.writeValueAsString(newProjectRequest)))
 * .andExpect(status().isCreated())
 * .andReturn().getResponse().getContentAsString();
 * 
 * Long newProjectId =
 * objectMapper.readTree(projectResponseJson).get("id").asLong();
 * 
 * // Verificar que se haya insertado el log para el nuevo proyecto
 * java.util.List<infrastructure.persistence.entities.ServiceLogEntity>
 * logsAfterProject = serviceLogRepository.findAll();
 * infrastructure.persistence.entities.ServiceLogEntity projectLog =
 * logsAfterProject.stream()
 * .filter(l -> l.getEntityType() == domain.model.EntityType.project &&
 * l.getDescription().contains("Proyecto Auditoria"))
 * .findFirst()
 * .orElse(null);
 * 
 * org.junit.jupiter.api.Assertions.assertNotNull(projectLog);
 * org.junit.jupiter.api.Assertions.assertEquals(domain.model.OperationType.
 * create, projectLog.getOperationType());
 * org.junit.jupiter.api.Assertions.assertEquals(LocalDate.now(),
 * projectLog.getTimeOf());
 * 
 * // Creamos una tarea en ese proyecto
 * LocalDateTime now = LocalDateTime.now().plusSeconds(2);
 * TaskRequestDTO taskRequest = new TaskRequestDTO(
 * null,
 * "Tarea Auditoria",
 * 5,
 * "Audit Guy",
 * TaskStatus.TODO,
 * now.plusDays(2),
 * now
 * );
 * 
 * String taskResponseJson = mockMvc.perform(post("/projects/" + newProjectId +
 * "/tasks")
 * .contentType(MediaType.APPLICATION_JSON)
 * .content(objectMapper.writeValueAsString(taskRequest)))
 * .andExpect(status().isCreated())
 * .andReturn().getResponse().getContentAsString();
 * 
 * Long newTaskId = objectMapper.readTree(taskResponseJson).get("id").asLong();
 * 
 * // Verificar que se haya insertado el log para la tarea
 * java.util.List<infrastructure.persistence.entities.ServiceLogEntity>
 * logsAfterTask = serviceLogRepository.findAll();
 * infrastructure.persistence.entities.ServiceLogEntity taskLog =
 * logsAfterTask.stream()
 * .filter(l -> l.getEntityType() == domain.model.EntityType.task &&
 * l.getDescription().contains("Tarea Auditoria"))
 * .findFirst()
 * .orElse(null);
 * 
 * org.junit.jupiter.api.Assertions.assertNotNull(taskLog);
 * org.junit.jupiter.api.Assertions.assertEquals(domain.model.OperationType.
 * create, taskLog.getOperationType());
 * org.junit.jupiter.api.Assertions.assertEquals(LocalDate.now(),
 * taskLog.getTimeOf());
 * 
 * // Creamos un comentario en esa tarea
 * TaskCommentRequestDTO commentRequest = new TaskCommentRequestDTO(
 * "Comentario Auditoria",
 * "Audit Commenter"
 * );
 * 
 * mockMvc.perform(post("/projects/{projectId}/tasks/{taskId}/comments",
 * newProjectId, newTaskId)
 * .contentType(MediaType.APPLICATION_JSON)
 * .content(objectMapper.writeValueAsString(commentRequest)))
 * .andExpect(status().isCreated());
 * 
 * // Verificar el log del comentario
 * java.util.List<infrastructure.persistence.entities.ServiceLogEntity>
 * logsAfterComment = serviceLogRepository.findAll();
 * infrastructure.persistence.entities.ServiceLogEntity commentLog =
 * logsAfterComment.stream()
 * .filter(l -> l.getEntityType() == domain.model.EntityType.taskComment &&
 * l.getDescription().contains("Comentario Auditoria"))
 * .findFirst()
 * .orElse(null);
 * 
 * org.junit.jupiter.api.Assertions.assertNotNull(commentLog);
 * org.junit.jupiter.api.Assertions.assertEquals(domain.model.OperationType.
 * create, commentLog.getOperationType());
 * org.junit.jupiter.api.Assertions.assertEquals(LocalDate.now(),
 * commentLog.getTimeOf());
 * }
 * }
 */