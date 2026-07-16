package budakgpt.yieldgridbackend.modules.notification.service.impl;

import budakgpt.yieldgridbackend.modules.notification.repository.NotificationRepository;
import budakgpt.yieldgridbackend.modules.notification.service.NotificationService;
import org.springframework.stereotype.Service;

@Service
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }
}
