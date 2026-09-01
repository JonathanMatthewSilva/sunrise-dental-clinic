package com.sunrisedental;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.sunrisedental.dao.UserDao;
import com.sunrisedental.model.User;
import com.sunrisedental.service.AuthService;

class AuthServiceTest {

    private UserDao userDao;
    private PasswordEncoder passwordEncoder;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        userDao = mock(UserDao.class);
        passwordEncoder = mock(PasswordEncoder.class);

        authService = new AuthService(
                userDao,
                passwordEncoder
        );
    }

    @Test
    void authenticateReturnsUserWhenCredentialsAreValid() {
        User user = new User();

        user.setUsername("admin");
        user.setPassword("hashed-password");
        user.setActive(true);

        when(userDao.findByUsername("admin"))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches(
                "admin123",
                "hashed-password"
        )).thenReturn(true);

        Optional<User> result =
                authService.authenticate(
                        "admin",
                        "admin123"
                );

        assertTrue(result.isPresent());
    }

    @Test
    void authenticateFailsWhenPasswordIsIncorrect() {
        User user = new User();

        user.setUsername("admin");
        user.setPassword("hashed-password");
        user.setActive(true);

        when(userDao.findByUsername("admin"))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches(
                "wrong-password",
                "hashed-password"
        )).thenReturn(false);

        Optional<User> result =
                authService.authenticate(
                        "admin",
                        "wrong-password"
                );

        assertFalse(result.isPresent());
    }

    @Test
    void authenticateFailsWhenUserDoesNotExist() {
        when(userDao.findByUsername("unknown"))
                .thenReturn(Optional.empty());

        Optional<User> result =
                authService.authenticate(
                        "unknown",
                        "password"
                );

        assertFalse(result.isPresent());
    }

    @Test
    void authenticateFailsWhenUserIsInactive() {
        User user = new User();

        user.setUsername("admin");
        user.setPassword("hashed-password");
        user.setActive(false);

        when(userDao.findByUsername("admin"))
                .thenReturn(Optional.of(user));

        Optional<User> result =
                authService.authenticate(
                        "admin",
                        "admin123"
                );

        assertFalse(result.isPresent());
    }
}