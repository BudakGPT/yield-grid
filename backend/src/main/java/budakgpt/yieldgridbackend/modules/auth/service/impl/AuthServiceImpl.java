package budakgpt.yieldgridbackend.modules.auth.service.impl;

import java.time.Instant;

import budakgpt.yieldgridbackend.modules.auth.service.AuthService;
import budakgpt.yieldgridbackend.modules.auth.service.SupabaseAuthClient;
import budakgpt.yieldgridbackend.modules.auth.service.SupabaseAuthClient.SupabaseIdentity;
import budakgpt.yieldgridbackend.modules.auth.service.SupabaseAuthClient.SupabaseUser;
import budakgpt.yieldgridbackend.modules.auth.dto.AuthResponse;
import budakgpt.yieldgridbackend.modules.auth.dto.LoginRequest;
import budakgpt.yieldgridbackend.modules.auth.dto.OAuthLoginRequest;
import budakgpt.yieldgridbackend.modules.auth.dto.RegisterRequest;
import budakgpt.yieldgridbackend.modules.auth.entity.UserEntity;
import budakgpt.yieldgridbackend.modules.auth.enums.Role;
import budakgpt.yieldgridbackend.modules.auth.exception.InvalidCredentialsException;
import budakgpt.yieldgridbackend.modules.auth.exception.PrivilegedRoleRegistrationException;
import budakgpt.yieldgridbackend.modules.auth.exception.RoleSelectionRequiredException;
import budakgpt.yieldgridbackend.modules.auth.exception.UserAlreadyExistsException;
import budakgpt.yieldgridbackend.modules.auth.mapper.UserMapper;
import budakgpt.yieldgridbackend.modules.auth.repository.UserRepository;
import budakgpt.yieldgridbackend.modules.auth.security.JwtService;
import budakgpt.yieldgridbackend.modules.stellar.SecretCryptoService;
import budakgpt.yieldgridbackend.modules.stellar.SidecarClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final UserMapper userMapper;
    private final SidecarClient sidecarClient;
    private final SecretCryptoService secretCryptoService;
    private final SupabaseAuthClient supabaseAuthClient;

    public AuthServiceImpl(
            UserRepository userRepository,
            JwtService jwtService,
            UserMapper userMapper,
            SidecarClient sidecarClient,
            SecretCryptoService secretCryptoService,
            SupabaseAuthClient supabaseAuthClient
    ) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.userMapper = userMapper;
        this.sidecarClient = sidecarClient;
        this.secretCryptoService = secretCryptoService;
        this.supabaseAuthClient = supabaseAuthClient;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Public signup may only create BUYER or SELLER; privileged roles need an internal path.
        if (request.role() != Role.BUYER && request.role() != Role.SELLER) {
            throw new PrivilegedRoleRegistrationException(request.role());
        }

        String normalizedEmail = normalizeEmail(request.email());
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new UserAlreadyExistsException(normalizedEmail);
        }
        if (request.role() != budakgpt.yieldgridbackend.modules.auth.enums.Role.BUYER
                && request.role() != budakgpt.yieldgridbackend.modules.auth.enums.Role.SELLER) {
            throw new IllegalArgumentException("Public signup role must be BUYER or SELLER");
        }

        SupabaseIdentity identity = supabaseAuthClient.signUp(
                normalizedEmail,
                request.password(),
                request.fullName().trim(),
                request.role()
        );

        UserEntity user = UserEntity.builder()
                .id(identity.id())
                .fullName(request.fullName().trim())
                .email(identity.email())
                .role(request.role())
                .enabled(true)
                .emailVerified(identity.emailVerified())
                .build();

        if (sidecarClient.isEnabled()) {
            String walletRole = request.role() == Role.BUYER ? "buyer" : "farmer";
            SidecarClient.ProvisionResponse wallet = sidecarClient.provision(walletRole);
            user.setStellarPublicKey(wallet.publicKey());
            user.setStellarSecretEnc(secretCryptoService.encrypt(wallet.secret()));
        }

        UserEntity savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);
        return AuthResponse.bearer(token, jwtService.getExpirationSeconds(), userMapper.toResponse(savedUser));
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        SupabaseIdentity identity = supabaseAuthClient.signIn(normalizedEmail, request.password());
        UserEntity user = userRepository.findById(identity.id())
                .or(() -> userRepository.findByEmail(normalizedEmail))
                .orElseThrow(InvalidCredentialsException::new);

        if (!user.getEnabled()) {
            throw new InvalidCredentialsException();
        }

        user.setEmail(identity.email());
        user.setEmailVerified(identity.emailVerified());
        user.setLastLoginAt(Instant.now());
        UserEntity savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);
        return AuthResponse.bearer(token, jwtService.getExpirationSeconds(), userMapper.toResponse(savedUser));
    }

    @Override
    @Transactional
    public AuthResponse oauthLogin(OAuthLoginRequest request) {
        SupabaseUser identity = supabaseAuthClient.getUser(request.accessToken());
        String normalizedEmail = normalizeEmail(identity.email());

        UserEntity user = userRepository.findById(identity.id())
                .or(() -> userRepository.findByEmail(normalizedEmail))
                .orElse(null);

        if (user == null) {
            // First OAuth sign-in: the provider does not carry our farmer/buyer role, so it must be chosen.
            Role role = request.role();
            if (role != Role.BUYER && role != Role.SELLER) {
                throw new RoleSelectionRequiredException();
            }
            String fullName = identity.fullName() != null ? identity.fullName() : normalizedEmail.split("@")[0];
            user = UserEntity.builder()
                    .id(identity.id())
                    .fullName(fullName)
                    .email(normalizedEmail)
                    .role(role)
                    .enabled(true)
                    .emailVerified(identity.emailVerified())
                    .avatarUrl(identity.avatarUrl())
                    .build();

            if (sidecarClient.isEnabled()) {
                String walletRole = role == Role.BUYER ? "buyer" : "farmer";
                SidecarClient.ProvisionResponse wallet = sidecarClient.provision(walletRole);
                user.setStellarPublicKey(wallet.publicKey());
                user.setStellarSecretEnc(secretCryptoService.encrypt(wallet.secret()));
            }
        } else {
            if (!user.getEnabled()) {
                throw new InvalidCredentialsException();
            }
            user.setEmail(normalizedEmail);
            user.setEmailVerified(identity.emailVerified());
            if (user.getAvatarUrl() == null && identity.avatarUrl() != null) {
                user.setAvatarUrl(identity.avatarUrl());
            }
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
