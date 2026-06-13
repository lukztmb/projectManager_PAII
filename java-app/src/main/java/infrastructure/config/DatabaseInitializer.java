package infrastructure.config;

import domain.model.User;
import domain.repository.IUserRepository;
import domain.service.IPasswordHasher;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {
    private final IUserRepository userRepository;
    private final IPasswordHasher passwordHasher;

    public DatabaseInitializer(IUserRepository userRepository, IPasswordHasher passwordHasher) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.findByEmail("admin@test.com").isEmpty()) {
            String hashedPassword = passwordHasher.hash("admin123");
            User defaultUser = User.create(null, "admin@test.com", hashedPassword);
            userRepository.save(defaultUser);
            System.out.println("Default admin user created: admin@test.com / admin123");
        }
    }
}
