package domain.model;

import infrastructure.exception.BusinessRuleViolationsException;

public class User {
    private Long id;
    private String email;
    private String password;

    private User(Long id, String email, String password) {
        this.id = id;
        this.email = email;
        this.password = password;
    }

    public static User create(Long id, String email, String password) {
        if (email == null || email.isBlank()) {
            throw new BusinessRuleViolationsException("Email cannot be empty");
        }
        if (password == null || password.isBlank()) {
            throw new BusinessRuleViolationsException("Password cannot be empty");
        }
        return new User(id, email, password);
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }
}
