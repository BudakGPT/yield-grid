package budakgpt.yieldgridbackend.modules.ws;

import java.time.Instant;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;

public record YieldGridEvent(
        String event,
        @JsonProperty("order_id") UUID orderId,
        Object data,
        Instant timestamp
) {
}
