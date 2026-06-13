package application.usecase;

import application.dto.request.ProjectRequestDTO;
import application.dto.response.ProjectResponseDTO;
import application.mapper.ProjectMapper;
import domain.model.EntityType;
import domain.model.OperationType;
import domain.model.Project;
import domain.repository.ProjectRepository;
import infrastructure.exception.DuplicateResourceException;
import org.springframework.stereotype.Service;

@Service
public class CreateProjectUseCase {
    private final ProjectRepository projectRepository;
    private final ProjectMapper projectMapper;
    private final LogOperationUseCase logOperationUseCase;

    // Colocamos las dependencias del repo, el mapper y auditoria
    public CreateProjectUseCase(ProjectRepository projectRepository,
                                ProjectMapper projectMapper,
                                LogOperationUseCase logOperationUseCase){
        this.projectMapper = projectMapper;
        this.projectRepository = projectRepository;
        this.logOperationUseCase = logOperationUseCase;
    }

    /**
     * El caso de uso hace:
     *  1. Valida que no este duplicado el nombre
     *  2. Mapea el DTO a dominio (valida reglas de negocio en general)
     *  3. Guarda en el repo
     *  4. Mapea el dominio a DTO para respuesta
     */
    public ProjectResponseDTO execute(ProjectRequestDTO requestDTO){
        if (projectRepository.existsByName(requestDTO.name())){
            throw new DuplicateResourceException("Ya existe un proyecto con el mismo nombre");
        }

        Project newProject = projectMapper.toDomain(requestDTO);

        Project savedProject = projectRepository.save(newProject);

        logOperationUseCase.execute(OperationType.create, EntityType.project, requestDTO);

        return projectMapper.toResponseDTO(savedProject);
    }
}
