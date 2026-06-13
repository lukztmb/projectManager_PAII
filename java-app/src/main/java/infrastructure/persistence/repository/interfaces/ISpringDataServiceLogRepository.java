package infrastructure.persistence.repository.interfaces;

import infrastructure.persistence.entities.ServiceLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ISpringDataServiceLogRepository extends JpaRepository<ServiceLogEntity, Long> {
}
