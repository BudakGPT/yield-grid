package budakgpt.yieldgridbackend.modules.auth.controller;

import budakgpt.yieldgridbackend.common.response.ApiResponse;
import budakgpt.yieldgridbackend.modules.auth.dto.AuthRequest;
import budakgpt.yieldgridbackend.modules.auth.dto.AuthResponse;
import budakgpt.yieldgridbackend.modules.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Auth", description = "Endpoint untuk autentikasi dan manajemen token")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(summary = "Health check auth", description = "Memeriksa apakah modul autentikasi sudah siap")
    @GetMapping("/health")
    public ApiResponse<String> health() {
        return ApiResponse.success("Auth module ready");
    }

    @Operation(
            summary = "Create auth placeholder",
            description = "Endpoint placeholder untuk menyiapkan logika autentikasi nanti"
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Request berhasil diproses", content = @Content(schema = @Schema(implementation = AuthResponse.class)))
    @PostMapping
    public ApiResponse<AuthResponse> createPlaceholder(@RequestBody AuthRequest request) {
        AuthResponse response = new AuthResponse("success", "Auth module ready for implementation");
        return ApiResponse.success("Auth request accepted", response);
    }
}
