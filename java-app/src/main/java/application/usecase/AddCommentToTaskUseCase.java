package application.usecase;

import application.dto.request.TaskCommentRequestDTO;
import application.dto.response.CommentResponseDTO;
import application.mapper.TaskCommentMapper;
import domain.model.EntityType;
import domain.model.OperationType;
import infrastructure.exception.ResourceNotFoundException;
import domain.model.Task;
import domain.model.TaskComment;
import domain.repository.TaskCommentRepository;
import domain.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AddCommentToTaskUseCase {

    private final TaskRepository taskRepository;
    private final TaskCommentRepository commentRepository;
    private final TaskCommentMapper commentMapper;
    private final LogOperationUseCase logOperationUseCase;

    public AddCommentToTaskUseCase(TaskRepository taskRepository, TaskCommentRepository commentRepository, TaskCommentMapper commentMapper, LogOperationUseCase logOperationUseCase) {
        this.taskRepository = taskRepository;
        this.commentRepository = commentRepository;
        this.commentMapper = commentMapper;
        this.logOperationUseCase = logOperationUseCase;
    }

    /**
     * Ejecuta el caso de uso.
     * @param request El DTO simplificado (solo texto y autor).
     * @param taskId El ID de la tarea (de la URL), que ahora SÍ se usa.
     * @return El comentario creado.
     * @throws ResourceNotFoundException si la tarea no existe.
     */
    public CommentResponseDTO execute(TaskCommentRequestDTO request, Long projectId, Long taskId) {

        Task task = taskRepository.findById(taskId).orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        if (task.getProyect() == null || !task.getProyect().getId().equals(projectId)) {
            throw new ResourceNotFoundException("Task with id: " + taskId + " does not belong to project with id: " + projectId);
        }

        LocalDateTime creationTime = LocalDateTime.now();

        TaskComment newComment = TaskComment.create(
                task,
                request.text(),
                request.author(),
                creationTime
        );

        TaskComment saved = commentRepository.save(newComment);

        /* Auditoria */
        logOperationUseCase.execute(OperationType.create, EntityType.taskComment, request);

        return commentMapper.toResponseDTO(saved);
    }


}
