package budakgpt.yieldgridbackend.modules.ws;

import java.time.Instant;
import java.util.UUID;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class YieldGridEventPublisher {
    private final SimpMessagingTemplate messagingTemplate;

    public YieldGridEventPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publish(String event, UUID orderId, Object data) {
        messagingTemplate.convertAndSend("/topic/events", new YieldGridEvent(event, orderId, data, Instant.now()));
    }
}
