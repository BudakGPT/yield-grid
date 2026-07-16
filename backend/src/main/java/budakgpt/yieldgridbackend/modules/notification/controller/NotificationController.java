package budakgpt.yieldgridbackend.modules.notification.controller;

import budakgpt.yieldgridbackend.common.response.ApiResponse;
import budakgpt.yieldgridbackend.modules.notification.service.NotificationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notification")
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/health")
    public ApiResponse<String> health() {
        return ApiResponse.success("Notification module ready");
    }

    @PostMapping
    public ApiResponse<String> createPlaceholder() {
        return ApiResponse.success("TODO: implement Notification endpoint");
    }
}
