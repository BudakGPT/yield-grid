package budakgpt.yieldgridbackend.modules.auth.service;

import budakgpt.yieldgridbackend.modules.auth.dto.AuthResponse;
import budakgpt.yieldgridbackend.modules.auth.dto.LoginRequest;
import budakgpt.yieldgridbackend.modules.auth.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
