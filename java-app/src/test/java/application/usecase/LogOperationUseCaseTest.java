package application.usecase;

import com.fasterxml.jackson.databind.ObjectMapper;
import domain.model.EntityType;
import domain.model.OperationType;
import domain.model.ServiceLog;
import domain.repository.IServiceLogRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class LogOperationUseCaseTest {

    @Mock
    private IServiceLogRepository serviceLogRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private LogOperationUseCase logOperationUseCase;

    @Test
    void testExecute_ShouldSaveLogWithJsonDescription_WhenSerialisationSucceeds() throws Exception {
        // Arrange
        Object payload = new Object();
        String jsonString = "{\"name\":\"test\"}";
        when(objectMapper.writeValueAsString(payload)).thenReturn(jsonString);

        ServiceLog mockLog = mock(ServiceLog.class);
        when(serviceLogRepository.save(any(ServiceLog.class))).thenReturn(mockLog);

        // Act
        logOperationUseCase.execute(OperationType.create, EntityType.project, payload);

        // Assert
        ArgumentCaptor<ServiceLog> captor = ArgumentCaptor.forClass(ServiceLog.class);
        verify(serviceLogRepository).save(captor.capture());
        
        ServiceLog savedLog = captor.getValue();
        Assertions.assertEquals(OperationType.create, savedLog.getOperationType());
        Assertions.assertEquals(EntityType.project, savedLog.getEntityType());
        Assertions.assertEquals(LocalDate.now(), savedLog.getTimeOf());
        Assertions.assertEquals(jsonString, savedLog.getDescription());
    }

    @Test
    void testExecute_ShouldSaveLogWithToString_WhenSerialisationFails() throws Exception {
        // Arrange
        Object payload = new Object() {
            @Override
            public String toString() {
                return "CustomPayloadToString";
            }
        };
        when(objectMapper.writeValueAsString(payload)).thenThrow(new RuntimeException("Serialisation error"));

        ServiceLog mockLog = mock(ServiceLog.class);
        when(serviceLogRepository.save(any(ServiceLog.class))).thenReturn(mockLog);

        // Act
        logOperationUseCase.execute(OperationType.create, EntityType.project, payload);

        // Assert
        ArgumentCaptor<ServiceLog> captor = ArgumentCaptor.forClass(ServiceLog.class);
        verify(serviceLogRepository).save(captor.capture());
        
        ServiceLog savedLog = captor.getValue();
        Assertions.assertEquals(OperationType.create, savedLog.getOperationType());
        Assertions.assertEquals(EntityType.project, savedLog.getEntityType());
        Assertions.assertEquals(LocalDate.now(), savedLog.getTimeOf());
        Assertions.assertEquals("CustomPayloadToString", savedLog.getDescription());
    }
}
