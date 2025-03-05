package com.example.diettracker;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import com.example.diettracker.model.User;
import com.example.diettracker.repository.UserRepository;
import com.example.diettracker.service.impl.AuthServiceImpl;

import java.util.Optional;

public class AuthTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuthServiceImpl authServiceImpl;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void register_ShouldReturnSuccessMessage_WhenUserIsValid() {
        User user = new User();
        user.setUsername("testUser");
        user.setPassword("password123");

        when(userRepository.save(user)).thenReturn(user);

        String result = authServiceImpl.register(user);

        assertEquals("New user registered successfully!", result);
    }

    @Test
    void register_ShouldReturnErrorMessage_WhenUserIsEmpty() {
        User user = new User();
        user.setUsername("");
        user.setPassword("password123");

        String result = authServiceImpl.register(user);

        assertEquals("User registration failed!", result);
    }

    @Test
    void register_ShouldReturnErrorMessage_WhenPasswordIsEmpty() {
        User user = new User();
        user.setUsername("testUser");
        user.setPassword("");

        String result = authServiceImpl.register(user);

        assertEquals("User registration failed!", result);
    }

    @Test
    void register_ShouldReturnErrorMessage_WhenUsernameIsNull() {
        User user = new User();
        user.setUsername(null);
        user.setPassword("password123");

        String result = authServiceImpl.register(user);

        assertEquals("User registration failed!", result);
    }

    @Test
    void register_ShouldReturnErrorMessage_WhenPasswordIsNull() {
        User user = new User();
        user.setUsername("testUser");
        user.setPassword(null);

        String result = authServiceImpl.register(user);

        assertEquals("User registration failed!", result);
    }

    @Test
    void register_ShouldReturnErrorMessage_WhenUsernameAlreadyTaken() {
        User user = new User();
        user.setUsername("existingUser");
        user.setPassword("password123");

        when(userRepository.findByUsername("existingUser")).thenReturn(Optional.of(user));

        String result = authServiceImpl.register(user);

        assertEquals("Username already taken!", result);
    }

    @Test
    void login_ShouldReturnSuccessMessage_WhenCredentialsAreValid() {
        User loginUser = new User();
        loginUser.setUsername("testUser");
        loginUser.setPassword("password123");

        when(userRepository.findByUsernameAndPassword("testUser", "password123")).thenReturn(Optional.of(loginUser));

        String result = authServiceImpl.login(loginUser);

        assertEquals("login successful!", result);
    }

    @Test
    void login_ShouldReturnErrorMessage_WhenPasswordIsWrong() {
        User loginUser = new User();
        loginUser.setUsername("testUser");
        loginUser.setPassword("wrongPassword");

        when(userRepository.findByUsernameAndPassword("testUser", "wrongPassword")).thenReturn(Optional.empty());

        String result = authServiceImpl.login(loginUser);

        assertEquals("Invalid credentials!", result);
    }

    @Test
    void login_ShouldReturnErrorMessage_WhenUsernameIsWrong() {
        User loginUser = new User();
        loginUser.setUsername("wrongTestUser");
        loginUser.setPassword("Password");

        when(userRepository.findByUsernameAndPassword("wrongTestUser", "Password")).thenReturn(Optional.empty());

        String result = authServiceImpl.login(loginUser);

        assertEquals("Invalid credentials!", result);
    }

    @Test
    void login_ShouldReturnErrorMessage_WhenUsernameIsNull() {
        User loginUser = new User();
        loginUser.setUsername(null);
        loginUser.setPassword("password123");

        when(userRepository.findByUsernameAndPassword(null, "password123")).thenReturn(Optional.empty());

        String result = authServiceImpl.login(loginUser);

        assertEquals("Invalid credentials!", result);
    }

    @Test
    void login_ShouldReturnErrorMessage_WhenPasswordIsNull() {
        User loginUser = new User();
        loginUser.setUsername("testUser");
        loginUser.setPassword(null);

        when(userRepository.findByUsernameAndPassword("testUser", null)).thenReturn(Optional.empty());

        String result = authServiceImpl.login(loginUser);

        assertEquals("Invalid credentials!", result);
    }
}
