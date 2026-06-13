package application.usecase;

import application.dto.response.TaskResponseDTO;
import application.mapper.TaskMapper;
import domain.model.Task;
import domain.repository.ProjectRepository;
import domain.repository.TaskRepository;
import infrastructure.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GetTasksByProjectIdUseCase {
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final TaskMapper taskMapper;

    public GetTasksByProjectIdUseCase(TaskRepository taskRepository,
                                      ProjectRepository projectRepository,
                                      TaskMapper taskMapper) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.taskMapper = taskMapper;
    }

    /**
     * Retrieves all tasks belonging to a specific project.
     *
     * @param projectId The ID of the project whose tasks are to be fetched.
     * @return A list of TaskResponseDTO objects.
     * @throws ResourceNotFoundException if the project does not exist.
     */
    public List<TaskResponseDTO> execute(Long projectId) {
        // Verify the project exists before querying tasks
        projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Project with id " + projectId + " not found"));

        List<Task> tasks = taskRepository.findByProjectId(projectId);
        return tasks.stream()
                .map(taskMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}
