package budakgpt.yieldgridbackend.modules.admin.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import budakgpt.yieldgridbackend.modules.admin.entity.AdminAuditEvent;

public interface AdminAuditRepository extends JpaRepository<AdminAuditEvent, UUID> {
    List<AdminAuditEvent> findTop10ByOrderByCreatedAtDesc();
}
