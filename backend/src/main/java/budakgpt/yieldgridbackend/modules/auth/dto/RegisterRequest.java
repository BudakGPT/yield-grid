package budakgpt.yieldgridbackend.modules.auth.dto;

import budakgpt.yieldgridbackend.modules.auth.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(description = "Request body for user registration")
public record RegisterRequest(
        @NotBlank(message = "Full name is required")
        @Size(max = 100, message = "Full name must not exceed 100 characters")
        @Schema(example = "Erik Wilbert")
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        @Schema(example = "buyer@example.com")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        @Schema(example = "password123", minLength = 8)
        String password,

        @NotNull(message = "Role is required")
        @Schema(example = "BUYER", allowableValues = {"BUYER", "SELLER", "ADMIN", "MODERATOR", "SUPPORT"})
        Role role
) {
}
