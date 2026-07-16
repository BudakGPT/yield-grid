package budakgpt.yieldgridbackend.modules.user.service.impl;

import budakgpt.yieldgridbackend.modules.user.repository.UserRepository;
import budakgpt.yieldgridbackend.modules.user.service.UserService;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
