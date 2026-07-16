package budakgpt.yieldgridbackend.modules.notification.repository;

import budakgpt.yieldgridbackend.modules.notification.entity.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {
    // TODO: add custom query methods for Notification
}
