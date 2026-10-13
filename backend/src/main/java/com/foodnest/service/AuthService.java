package com.foodnest.service;

import com.foodnest.dto.AuthDtos.*;
import com.foodnest.exception.BadRequestException;
import com.foodnest.exception.RateLimitException;
import com.foodnest.exception.ResourceNotFoundException;
import com.foodnest.model.Address;
import com.foodnest.model.Role;
import com.foodnest.model.User;
import com.foodnest.repository.UserRepository;
import com.foodnest.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RateLimiterService rateLimiterService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       RateLimiterService rateLimiterService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.rateLimiterService = rateLimiterService;
    }

    public AuthResponse register(RegisterRequest req) {
        if (!req.getPassword().equals(req.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        String email = req.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered. Please login.");
        }

        User user = new User(
                req.getName().trim(),
                email,
                passwordEncoder.encode(req.getPassword()),
                req.getPhone(),
                Role.CUSTOMER
        );

        if (req.getStreet() != null && !req.getStreet().isBlank()) {
            Address address = new Address(req.getStreet(), req.getCity(), req.getState(), req.getPincode(), "");
            user.getAddresses().add(address);
        }

        User saved = userRepository.save(user);
        String token = jwtService.generateToken(saved.getId(), saved.getEmail(), saved.getRole());
        return new AuthResponse(token, toDto(saved));
    }

    public AuthResponse login(LoginRequest req) {
        String email = req.getEmail().toLowerCase().trim();

        // Feature 3: Redis-backed Rate Limiter check
        if (!rateLimiterService.allowRequest(email)) {
            throw new RateLimitException("Too many login attempts. Please wait 60 seconds before retrying.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password");
        }

        // Reset rate limiter on successful authentication
        rateLimiterService.resetLimit(email);

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());
        return new AuthResponse(token, toDto(user));
    }

    public UserDto getCurrentUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        return toDto(user);
    }

    public UserDto toDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        dto.setAddresses(user.getAddresses());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
