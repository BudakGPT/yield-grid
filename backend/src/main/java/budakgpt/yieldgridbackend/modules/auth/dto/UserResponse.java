package budakgpt.yieldgridbackend.modules.auth.dto;

import java.util.UUID;

import budakgpt.yieldgridbackend.modules.auth.enums.Role;

public record UserResponse(
        UUID id,
        String fullName,
        String email,
        Role role,
        Boolean enabled,
        Boolean emailVerified
) {
}
