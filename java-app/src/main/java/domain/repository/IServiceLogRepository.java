package domain.repository;

import domain.model.ServiceLog;

public interface IServiceLogRepository {
    ServiceLog save(ServiceLog log);
}
