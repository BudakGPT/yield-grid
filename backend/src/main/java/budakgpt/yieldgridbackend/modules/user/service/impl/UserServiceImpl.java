package budakgpt.yieldgridbackend.modules.user.service.impl;

import budakgpt.yieldgridbackend.modules.user.repository.LegacyUserRepository;
import budakgpt.yieldgridbackend.modules.user.service.UserService;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {
    private final LegacyUserRepository userRepository;

    public UserServiceImpl(LegacyUserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
