package budakgpt.yieldgridbackend.modules.auth.controller;

import budakgpt.yieldgridbackend.common.response.ApiResponse;
import budakgpt.yieldgridbackend.modules.auth.service.AuthService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/health")
    public ApiResponse<String> health() {
        return ApiResponse.success("Auth module ready");
    }

    @PostMapping
    public ApiResponse<String> createPlaceholder() {
        return ApiResponse.success("TODO: implement Auth endpoint");
    }
}
