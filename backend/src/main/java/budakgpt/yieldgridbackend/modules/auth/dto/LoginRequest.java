package budakgpt.yieldgridbackend.modules.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request body for user login")
public record LoginRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        @Schema(example = "buyer@example.com")
        String email,

        @NotBlank(message = "Password is required")
        @Schema(example = "password123")
        String password
) {
}
