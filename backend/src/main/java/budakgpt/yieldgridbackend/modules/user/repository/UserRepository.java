package budakgpt.yieldgridbackend.modules.user.repository;

import budakgpt.yieldgridbackend.modules.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    // TODO: add custom query methods for User
}
