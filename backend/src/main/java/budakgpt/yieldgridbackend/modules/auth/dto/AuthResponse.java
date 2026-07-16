package budakgpt.yieldgridbackend.modules.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Placeholder response body untuk endpoint autentikasi")
public record AuthResponse(
        @Schema(description = "Status autentikasi", example = "success")
        String status,

        @Schema(description = "Pesan dari sistem", example = "Auth module ready")
        String message
) {
}
