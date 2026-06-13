package application.usecase;

import application.dto.response.ProjectResponseDTO;
import application.mapper.ProjectMapper;
import domain.model.Project;
import domain.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GetAllProjectsUseCase {
    private final ProjectRepository projectRepository;
    private final ProjectMapper projectMapper;

    public GetAllProjectsUseCase(ProjectRepository projectRepository, ProjectMapper projectMapper) {
        this.projectRepository = projectRepository;
        this.projectMapper = projectMapper;
    }

    public List<ProjectResponseDTO> execute() {
        List<Project> projects = projectRepository.findAll();
        return projects.stream()
                .map(projectMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}
