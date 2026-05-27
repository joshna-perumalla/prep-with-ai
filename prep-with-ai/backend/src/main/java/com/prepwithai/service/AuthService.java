package com.prepwithai.service;

import com.prepwithai.dto.AuthDto.*;
import com.prepwithai.model.User;
import com.prepwithai.repository.UserRepository;
import com.prepwithai.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .college(req.getCollege())
                .branch(req.getBranch())
                .build();
        userRepository.save(user);
        String token = jwtUtils.generateToken(user.getEmail());
        return AuthResponse.builder().token(token).name(user.getName()).email(user.getEmail()).build();
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        String token = jwtUtils.generateToken(user.getEmail());
        return AuthResponse.builder().token(token).name(user.getName()).email(user.getEmail()).build();
    }
}
