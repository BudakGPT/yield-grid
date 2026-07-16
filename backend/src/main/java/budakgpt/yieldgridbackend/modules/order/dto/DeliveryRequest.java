package budakgpt.yieldgridbackend.modules.order.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record DeliveryRequest(@JsonProperty("qr_payload") String qrPayload) {
}
