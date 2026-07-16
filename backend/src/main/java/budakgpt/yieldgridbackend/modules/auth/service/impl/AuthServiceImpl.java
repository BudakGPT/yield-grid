package budakgpt.yieldgridbackend.modules.auth.service.impl;

import java.time.Instant;

import org.springframework.security.crypto.password.PasswordEncoder;
import budakgpt.yieldgridbackend.modules.auth.service.AuthService;
import budakgpt.yieldgridbackend.modules.auth.dto.AuthResponse;
import budakgpt.yieldgridbackend.modules.auth.dto.LoginRequest;
import budakgpt.yieldgridbackend.modules.auth.dto.RegisterRequest;
import budakgpt.yieldgridbackend.modules.auth.entity.UserEntity;
import budakgpt.yieldgridbackend.modules.auth.exception.InvalidCredentialsException;
import budakgpt.yieldgridbackend.modules.auth.exception.UserAlreadyExistsException;
import budakgpt.yieldgridbackend.modules.auth.mapper.UserMapper;
import budakgpt.yieldgridbackend.modules.auth.repository.UserRepository;
import budakgpt.yieldgridbackend.modules.auth.security.JwtService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    public AuthServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            UserMapper userMapper
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userMapper = userMapper;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new UserAlreadyExistsException(normalizedEmail);
        }

        UserEntity user = UserEntity.builder()
                .fullName(request.fullName().trim())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.password()))
                .role(request.role())
                .enabled(true)
                .emailVerified(false)
                .build();

        UserEntity savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);
        return AuthResponse.bearer(token, jwtService.getExpirationSeconds(), userMapper.toResponse(savedUser));
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        UserEntity user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(InvalidCredentialsException::new);

        if (!user.getEnabled() || !passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new InvalidCredentialsException();
        }

        user.setLastLoginAt(Instant.now());
        UserEntity savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);
        return AuthResponse.bearer(token, jwtService.getExpirationSeconds(), userMapper.toResponse(savedUser));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}
