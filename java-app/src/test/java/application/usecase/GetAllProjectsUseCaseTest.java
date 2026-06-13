package application.usecase;

import application.dto.response.ProjectResponseDTO;
import application.mapper.ProjectMapper;
import domain.model.Project;
import domain.model.ProjectStatus;
import domain.repository.ProjectRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class GetAllProjectsUseCaseTest {
    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ProjectMapper projectMapper;

    @InjectMocks
    private GetAllProjectsUseCase getAllProjectsUseCase;

    @Test
    @DisplayName("Debe retornar lista de proyectos cuando existen registros")
    void testExecute_Success() {
        Project project1 = mock(Project.class);
        Project project2 = mock(Project.class);
        List<Project> mockList = Arrays.asList(project1, project2);

        ProjectResponseDTO dto1 = new ProjectResponseDTO(1L, "P1", LocalDate.now(), LocalDate.now().plusDays(5), ProjectStatus.ACTIVE, "D1");
        ProjectResponseDTO dto2 = new ProjectResponseDTO(2L, "P2", LocalDate.now(), LocalDate.now().plusDays(5), ProjectStatus.ACTIVE, "D2");

        when(projectRepository.findAll()).thenReturn(mockList);
        when(projectMapper.toResponseDTO(project1)).thenReturn(dto1);
        when(projectMapper.toResponseDTO(project2)).thenReturn(dto2);

        List<ProjectResponseDTO> result = getAllProjectsUseCase.execute();

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("P1", result.get(0).name());
        assertEquals("P2", result.get(1).name());

        verify(projectRepository).findAll();
        verify(projectMapper).toResponseDTO(project1);
        verify(projectMapper).toResponseDTO(project2);
    }

    @Test
    @DisplayName("Debe retornar lista vacia si no existen proyectos")
    void testExecute_Empty() {
        when(projectRepository.findAll()).thenReturn(Collections.emptyList());

        List<ProjectResponseDTO> result = getAllProjectsUseCase.execute();

        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(projectRepository).findAll();
        verifyNoInteractions(projectMapper);
    }
}
