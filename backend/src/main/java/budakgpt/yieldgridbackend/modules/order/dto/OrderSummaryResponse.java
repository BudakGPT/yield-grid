package budakgpt.yieldgridbackend.modules.order.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import budakgpt.yieldgridbackend.modules.order.enums.OrderStatus;
import budakgpt.yieldgridbackend.modules.order.enums.PaymentMethod;

public record OrderSummaryResponse(
        UUID id,
        String orderNumber,
        UUID buyerId,
        String buyerName,
        OrderStatus status,
        PaymentMethod paymentMethod,
        BigDecimal totalAmount,
        Integer itemCount,
        Instant orderedAt
) {
}
