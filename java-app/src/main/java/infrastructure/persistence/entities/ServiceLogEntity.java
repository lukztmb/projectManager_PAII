package infrastructure.persistence.entities;

import domain.model.EntityType;
import domain.model.OperationType;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "service_logs")
public class ServiceLogEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "operation_type", nullable = false)
    private OperationType operationType;

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", nullable = false)
    private EntityType entityType;

    @Column(name = "time_of", nullable = false)
    private LocalDate timeOf;

    @Column(name = "description", nullable = false, length = 2000)
    private String description;

    public ServiceLogEntity() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public OperationType getOperationType() {
        return operationType;
    }

    public void setOperationType(OperationType operationType) {
        this.operationType = operationType;
    }

    public EntityType getEntityType() {
        return entityType;
    }

    public void setEntityType(EntityType entityType) {
        this.entityType = entityType;
    }

    public LocalDate getTimeOf() {
        return timeOf;
    }

    public void setTimeOf(LocalDate timeOf) {
        this.timeOf = timeOf;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
