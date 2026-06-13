package domain.repository;

import domain.model.User;
import java.util.Optional;

public interface IUserRepository {
    Optional<User> findByEmail(String email);
    User save(User user);
}
