package budakgpt.yieldgridbackend.modules.auth.dto;

import budakgpt.yieldgridbackend.modules.auth.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request body for OAuth (Supabase-brokered) login")
public record OAuthLoginRequest(
        @NotBlank(message = "Supabase access token is required")
        @Schema(description = "Supabase access token returned by the provider redirect")
        String accessToken,

        @Schema(example = "SELLER", allowableValues = {"BUYER", "SELLER"},
                description = "Required only when finishing a first-time OAuth sign-up")
        Role role
) {
}
