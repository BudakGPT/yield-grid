package budakgpt.yieldgridbackend.modules.user.controller;

import budakgpt.yieldgridbackend.common.response.ApiResponse;
import budakgpt.yieldgridbackend.modules.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/user")
@Tag(name = "User", description = "Endpoint untuk manajemen pengguna")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "Health check user", description = "Memeriksa apakah modul pengguna sudah siap")
    @GetMapping("/health")
    public ApiResponse<String> health() {
        return ApiResponse.success("User module ready");
    }

    @Operation(summary = "Create user placeholder", description = "Endpoint placeholder untuk menyiapkan logika pengguna nanti")
    @PostMapping
    public ApiResponse<String> createPlaceholder() {
        return ApiResponse.success("TODO: implement User endpoint");
    }
}
