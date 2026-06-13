package application.usecase;

import application.dto.request.LoginRequestDTO;
import application.dto.response.AuthResponseDTO;
import application.service.IJwtService;
import domain.model.User;
import domain.repository.IUserRepository;
import domain.service.IPasswordHasher;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

@Service
public class AuthenticateUserUseCase {
    private final IUserRepository userRepository;
    private final IPasswordHasher passwordHasher;
    private final IJwtService jwtService;

    public AuthenticateUserUseCase(IUserRepository userRepository, IPasswordHasher passwordHasher, IJwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.jwtService = jwtService;
    }

    public AuthResponseDTO execute(LoginRequestDTO request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordHasher.matches(request.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail());
        return new AuthResponseDTO(token);
    }
}
