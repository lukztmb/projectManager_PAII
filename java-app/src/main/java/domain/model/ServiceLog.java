package domain.model;

import java.time.LocalDate;

public class ServiceLog {
    private Long id;
    private OperationType operationType;
    private EntityType entityType;
    private LocalDate timeOf;
    private String description;

    private ServiceLog(OperationType operationType, EntityType entityType, LocalDate timeOf, String description) {
        this.id = null;
        this.operationType = operationType;
        this.entityType = entityType;
        this.timeOf = timeOf;
        this.description = description;
    }

    public static ServiceLog create(OperationType operationType, EntityType entityType, LocalDate timeOf, String description) {
        if (operationType == null) {
            throw new IllegalArgumentException("Operation type cannot be null");
        }
        if (entityType == null) {
            throw new IllegalArgumentException("Entity type cannot be null");
        }
        if (timeOf == null) {
            throw new IllegalArgumentException("Time of log cannot be null");
        }
        if (description == null) {
            throw new IllegalArgumentException("Description cannot be null");
        }
        return new ServiceLog(operationType, entityType, timeOf, description);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public OperationType getOperationType() {
        return operationType;
    }

    public EntityType getEntityType() {
        return entityType;
    }

    public LocalDate getTimeOf() {
        return timeOf;
    }

    public String getDescription() {
        return description;
    }
}
