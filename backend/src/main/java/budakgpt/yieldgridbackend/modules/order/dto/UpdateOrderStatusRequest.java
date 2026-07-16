package budakgpt.yieldgridbackend.modules.order.dto;

import budakgpt.yieldgridbackend.modules.order.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(
        @NotNull(message = "Status is required")
        OrderStatus status
) {
}
