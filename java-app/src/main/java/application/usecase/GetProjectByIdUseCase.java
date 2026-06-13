package application.usecase;

import application.dto.response.ProjectResponseDTO;
import application.mapper.ProjectMapper;
import domain.model.Project;
import domain.repository.ProjectRepository;
import infrastructure.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class GetProjectByIdUseCase {
    private final ProjectRepository projectRepository;
    private final ProjectMapper projectMapper;

    public GetProjectByIdUseCase(ProjectRepository projectRepository, ProjectMapper projectMapper) {
        this.projectRepository = projectRepository;
        this.projectMapper = projectMapper;
    }

    public ProjectResponseDTO execute(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
        return projectMapper.toResponseDTO(project);
    }
}
