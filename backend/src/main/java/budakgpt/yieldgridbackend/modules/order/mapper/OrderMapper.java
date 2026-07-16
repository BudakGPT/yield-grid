package budakgpt.yieldgridbackend.modules.order.mapper;

import java.util.List;

import org.springframework.stereotype.Component;

import budakgpt.yieldgridbackend.modules.order.dto.OrderItemResponse;
import budakgpt.yieldgridbackend.modules.order.dto.OrderResponse;
import budakgpt.yieldgridbackend.modules.order.dto.OrderSummaryResponse;
import budakgpt.yieldgridbackend.modules.order.entity.Order;
import budakgpt.yieldgridbackend.modules.order.entity.OrderItem;

@Component
public class OrderMapper {

    public OrderResponse toResponse(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getBuyer().getId(),
                order.getBuyer().getFullName(),
                order.getStatus(),
                order.getPaymentMethod(),
                order.getSubtotal(),
                order.getShippingFee(),
                order.getTotalAmount(),
                order.getRecipientName(),
                order.getRecipientPhone(),
                order.getProvince(),
                order.getCity(),
                order.getDistrict(),
                order.getPostalCode(),
                order.getFullAddress(),
                order.getNotes(),
                toItemResponses(order.getItems()),
                order.getOrderedAt(),
                order.getUpdatedAt(),
                order.getCompletedAt()
        );
    }

    public OrderSummaryResponse toSummaryResponse(Order order) {
        int itemCount = order.getItems().stream()
                .mapToInt(OrderItem::getQuantity)
                .sum();
        return new OrderSummaryResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getBuyer().getId(),
                order.getBuyer().getFullName(),
                order.getStatus(),
                order.getPaymentMethod(),
                order.getTotalAmount(),
                itemCount,
                order.getOrderedAt()
        );
    }

    private List<OrderItemResponse> toItemResponses(List<OrderItem> items) {
        return items.stream()
                .map(item -> new OrderItemResponse(
                        item.getId(),
                        item.getProduct().getId(),
                        item.getSeller().getId(),
                        item.getSeller().getFullName(),
                        item.getProductName(),
                        item.getQualityGrade(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getSubtotal()
                ))
                .toList();
    }
}
