package budakgpt.yieldgridbackend.modules.user.repository;

import budakgpt.yieldgridbackend.modules.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LegacyUserRepository extends JpaRepository<UserEntity, Long> {
    // TODO: replace this placeholder when the User module is implemented.
}
