package budakgpt.yieldgridbackend.modules.auth.mapper;

import org.springframework.stereotype.Component;

import budakgpt.yieldgridbackend.modules.auth.dto.UserResponse;
import budakgpt.yieldgridbackend.modules.auth.entity.UserEntity;

@Component
public class UserMapper {

    public UserResponse toResponse(UserEntity user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getEnabled(),
                user.getEmailVerified(),
                user.getStellarPublicKey(),
                user.getStellarPublicKey() != null && user.getStellarSecretEnc() != null
        );
    }
}
