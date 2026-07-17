package budakgpt.yieldgridbackend.modules.demo.dto;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotNull;

public record DemoOrderRequest(@NotNull @JsonProperty("order_id") UUID orderId) {
}
