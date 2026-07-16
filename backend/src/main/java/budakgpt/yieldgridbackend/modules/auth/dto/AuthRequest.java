package budakgpt.yieldgridbackend.modules.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Placeholder request body untuk endpoint autentikasi")
public record AuthRequest(
        @Schema(description = "Email atau username pengguna", example = "farmer@example.com")
        String username,

        @Schema(description = "Password pengguna", example = "secret123")
        String password
) {
}
