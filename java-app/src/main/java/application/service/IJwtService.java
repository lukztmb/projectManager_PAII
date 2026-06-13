package application.service;

public interface IJwtService {
    String generateToken(String email);
    String extractEmail(String token);
    boolean isTokenValid(String token, String email);
}
