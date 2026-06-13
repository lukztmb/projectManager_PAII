package infrastructure.persistence.mapper;

import domain.model.*;
import infrastructure.persistence.entities.*;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class PersistenceMapper {
    // Project
    public Project toDomain(ProjectEntity entity) {
        return Project.reconstitute(
                entity.getId(),
                entity.getName(),
                entity.getStartDate(),
                entity.getEndDate(),
                entity.getStatus(),
                Optional.ofNullable(entity.getDescription()));
    }

    public ProjectEntity toEntity(Project domain) {
        ProjectEntity entity = new ProjectEntity();
        entity.setId(domain.getId());
        entity.setName(domain.getName());
        entity.setStartDate(domain.getStartDate());
        entity.setEndDate(domain.getEndDate());
        entity.setStatus(domain.getStatus());
        entity.setDescription(domain.getDescription().orElse(null));
        return entity;
    }

    // Task
    public Task toDomain(TaskEntity entity) {
        return Task.reconstitute(
                entity.getId(),
                entity.getTitle(),
                toDomain(entity.getProject()), // Mapea el proyecto padre
                entity.getEstimatedHours(),
                entity.getAssignee(),
                entity.getStatus(),
                entity.getCreatedAt(),
                entity.getFinishedAt());
    }

    public TaskEntity toEntity(Task domain) {
        TaskEntity entity = new TaskEntity();
        entity.setId(domain.getId());
        entity.setTitle(domain.getTitle());
        entity.setProject(toEntity(domain.getProyect())); // Mapea el proyecto padre
        entity.setEstimatedHours(domain.getEstimatedHours());
        entity.setAssignee(domain.getAssignee());
        entity.setStatus(domain.getStatus());
        entity.setCreatedAt(domain.getCreatedAt());
        entity.setFinishedAt(domain.getFinishedAt());
        return entity;
    }

    // TaskComment
    public TaskComment toDomain(TaskCommentEntity entity) {
        return TaskComment.reconstitute(
                entity.getId(),
                toDomain(entity.getTask()), // Mapea la tarea padre
                entity.getText(),
                entity.getAuthor(),
                entity.getCreatedAt());
    }

    public TaskCommentEntity toEntity(TaskComment domain) {
        TaskCommentEntity entity = new TaskCommentEntity();
        entity.setId(domain.getId());
        entity.setTask(toEntity(domain.getTask())); // Mapea la tarea padre
        entity.setText(domain.getText());
        entity.setAuthor(domain.getAuthor());
        entity.setCreatedAt(domain.getCreatedAt());
        return entity;
    }

    // User
    public User toDomain(UserEntity entity) {
        if (entity == null)
            return null;
        return User.create(
                entity.getId(),
                entity.getEmail(),
                entity.getPassword());
    }

    public UserEntity toEntity(User domain) {
        if (domain == null)
            return null;
        UserEntity entity = new UserEntity();
        entity.setId(domain.getId());
        entity.setEmail(domain.getEmail());
        entity.setPassword(domain.getPassword());
        return entity;
    }

    // ServiceLog
    public ServiceLog toDomain(ServiceLogEntity entity) {
        if (entity == null)
            return null;
        ServiceLog domain = ServiceLog.create(
                entity.getOperationType(),
                entity.getEntityType(),
                entity.getTimeOf(),
                entity.getDescription());
        domain.setId(entity.getId());
        return domain;
    }

    public ServiceLogEntity toEntity(ServiceLog domain) {
        if (domain == null)
            return null;
        ServiceLogEntity entity = new ServiceLogEntity();
        entity.setId(domain.getId());
        entity.setOperationType(domain.getOperationType());
        entity.setEntityType(domain.getEntityType());
        entity.setTimeOf(domain.getTimeOf());
        entity.setDescription(domain.getDescription());
        return entity;
    }
}
