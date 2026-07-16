package budakgpt.yieldgridbackend.modules.auth.service.impl;

import budakgpt.yieldgridbackend.modules.auth.repository.AuthRepository;
import budakgpt.yieldgridbackend.modules.auth.service.AuthService;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {
    private final AuthRepository authRepository;

    public AuthServiceImpl(AuthRepository authRepository) {
        this.authRepository = authRepository;
    }
}
