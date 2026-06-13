package infrastructure.persistence.repository.implementations;

import domain.model.ServiceLog;
import domain.repository.IServiceLogRepository;
import infrastructure.persistence.entities.ServiceLogEntity;
import infrastructure.persistence.mapper.PersistenceMapper;
import infrastructure.persistence.repository.interfaces.ISpringDataServiceLogRepository;
import org.springframework.stereotype.Component;

@Component
public class ServiceLogRepositoryImp implements IServiceLogRepository {
    private final ISpringDataServiceLogRepository jpaRepository;
    private final PersistenceMapper mapper;

    public ServiceLogRepositoryImp(ISpringDataServiceLogRepository jpaRepository, PersistenceMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public ServiceLog save(ServiceLog log) {
        ServiceLogEntity entityToSave = mapper.toEntity(log);
        ServiceLogEntity savedEntity = jpaRepository.save(entityToSave);
        return mapper.toDomain(savedEntity);
    }
}
