package budakgpt.yieldgridbackend.modules.auth.repository;

import budakgpt.yieldgridbackend.modules.auth.entity.AuthEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthRepository extends JpaRepository<AuthEntity, Long> {
    // TODO: add custom query methods for Auth
}
