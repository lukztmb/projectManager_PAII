package application.usecase;

import application.dto.response.ProjectResponseDTO;
import application.mapper.ProjectMapper;
import domain.model.Project;
import domain.model.ProjectStatus;
import domain.repository.ProjectRepository;
import infrastructure.exception.ResourceNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class GetProjectByIdUseCaseTest {
    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ProjectMapper projectMapper;

    @InjectMocks
    private GetProjectByIdUseCase getProjectByIdUseCase;

    @Test
    @DisplayName("Debe retornar proyecto por ID si existe")
    void testExecute_Success() {
        Long projectId = 1L;
        Project project = mock(Project.class);
        ProjectResponseDTO dto = new ProjectResponseDTO(projectId, "P1", LocalDate.now(), LocalDate.now().plusDays(5), ProjectStatus.ACTIVE, "D1");

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(projectMapper.toResponseDTO(project)).thenReturn(dto);

        ProjectResponseDTO result = getProjectByIdUseCase.execute(projectId);

        assertNotNull(result);
        assertEquals(projectId, result.id());
        assertEquals("P1", result.name());

        verify(projectRepository).findById(projectId);
        verify(projectMapper).toResponseDTO(project);
    }

    @Test
    @DisplayName("Debe lanzar ResourceNotFoundException si el proyecto no existe")
    void testExecute_NotFound() {
        Long projectId = 999L;
        when(projectRepository.findById(projectId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            getProjectByIdUseCase.execute(projectId);
        });

        verify(projectRepository).findById(projectId);
        verifyNoInteractions(projectMapper);
    }
}
