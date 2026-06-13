package application.usecase;

import com.fasterxml.jackson.databind.ObjectMapper;
import domain.model.EntityType;
import domain.model.OperationType;
import domain.model.ServiceLog;
import domain.repository.IServiceLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class LogOperationUseCase {
    private final IServiceLogRepository serviceLogRepository;
    private final ObjectMapper objectMapper;

    public LogOperationUseCase(IServiceLogRepository serviceLogRepository, ObjectMapper objectMapper) {
        this.serviceLogRepository = serviceLogRepository;
        this.objectMapper = objectMapper;
    }

    public void execute(OperationType operationType, EntityType entityType, Object payload) {
        String description;
        try {
            description = objectMapper.writeValueAsString(payload);
        } catch (Exception e) {
            description = payload != null ? payload.toString() : "";
        }
        ServiceLog log = ServiceLog.create(operationType, entityType, LocalDate.now(), description);
        serviceLogRepository.save(log);
    }
}
