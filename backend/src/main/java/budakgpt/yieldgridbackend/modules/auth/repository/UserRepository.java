package budakgpt.yieldgridbackend.modules.auth.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import budakgpt.yieldgridbackend.modules.auth.entity.UserEntity;
import budakgpt.yieldgridbackend.modules.auth.enums.Role;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {
    Optional<UserEntity> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByEnabledTrue();

    long countByRole(Role role);

    @Query("""
            select u from AuthUserEntity u
            where (:query = '' or lower(u.fullName) like lower(concat('%', :query, '%'))
                    or lower(u.email) like lower(concat('%', :query, '%')))
              and (:role is null or u.role = :role)
              and (:enabled is null or u.enabled = :enabled)
            """)
    Page<UserEntity> searchForAdmin(String query, Role role, Boolean enabled, Pageable pageable);
}
