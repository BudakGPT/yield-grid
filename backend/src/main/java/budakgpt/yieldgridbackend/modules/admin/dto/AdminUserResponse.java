package budakgpt.yieldgridbackend.modules.admin.dto;

import java.time.Instant;
import java.util.UUID;

import budakgpt.yieldgridbackend.modules.auth.enums.Role;

public record AdminUserResponse(
        UUID id,
        String fullName,
        String email,
        Role role,
        boolean enabled,
        boolean emailVerified,
        boolean walletReady,
        Instant createdAt,
        Instant lastLoginAt
) {
}
