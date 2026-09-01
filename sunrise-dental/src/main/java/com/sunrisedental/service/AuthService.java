package com.sunrisedental.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.sunrisedental.dao.UserDao;
import com.sunrisedental.model.User;

@Service
public class AuthService {

    private final UserDao userDao;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserDao userDao,
            PasswordEncoder passwordEncoder) {

        this.userDao = userDao;
        this.passwordEncoder = passwordEncoder;
    }

    public Optional<User> authenticate(
            String username,
            String password) {

        Optional<User> userOptional =
                userDao.findByUsername(username);

        if (userOptional.isEmpty()) {
            return Optional.empty();
        }

        User user = userOptional.get();

        if (!user.isActive()) {
            return Optional.empty();
        }

        if (!passwordEncoder.matches(
                password,
                user.getPassword())) {

            return Optional.empty();
        }

        return Optional.of(user);
    }
}