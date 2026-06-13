package infrastructure.persistence.repository.implementations;

import domain.model.User;
import domain.repository.IUserRepository;
import infrastructure.persistence.entities.UserEntity;
import infrastructure.persistence.mapper.PersistenceMapper;
import infrastructure.persistence.repository.interfaces.ISpringDataUserRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class UserRepositoryImp implements IUserRepository {
    private final ISpringDataUserRepository jpaRepository;
    private final PersistenceMapper mapper;

    public UserRepositoryImp(ISpringDataUserRepository jpaRepository, PersistenceMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return jpaRepository.findByEmail(email).map(mapper::toDomain);
    }

    @Override
    public User save(User user) {
        UserEntity entity = mapper.toEntity(user);
        UserEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }
}
