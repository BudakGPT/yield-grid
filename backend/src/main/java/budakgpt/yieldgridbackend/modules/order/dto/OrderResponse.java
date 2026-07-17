package budakgpt.yieldgridbackend.modules.order.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import budakgpt.yieldgridbackend.modules.order.enums.OrderStatus;
import budakgpt.yieldgridbackend.modules.order.enums.EscrowStatus;
import budakgpt.yieldgridbackend.modules.order.enums.PaymentMethod;

public record OrderResponse(
        UUID id,
        String orderNumber,
        UUID buyerId,
        String buyerName,
        OrderStatus status,
        PaymentMethod paymentMethod,
        BigDecimal subtotal,
        BigDecimal shippingFee,
        BigDecimal totalAmount,
        String recipientName,
        String recipientPhone,
        String province,
        String city,
        String district,
        String postalCode,
        String fullAddress,
        String notes,
        List<OrderItemResponse> items,
        Instant orderedAt,
        Instant updatedAt,
        Instant completedAt,
        EscrowStatus escrowStatus,
        UUID farmerId,
        String farmerName,
        String escrowTxHash,
        String settleTxHash,
        Integer discountBps,
        Boolean breachDetected,
        BigDecimal lastTemperatureC
) {
}
