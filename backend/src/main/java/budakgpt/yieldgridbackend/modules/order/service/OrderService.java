package budakgpt.yieldgridbackend.modules.order.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import budakgpt.yieldgridbackend.modules.order.dto.CreateOrderRequest;
import budakgpt.yieldgridbackend.modules.order.dto.OrderResponse;
import budakgpt.yieldgridbackend.modules.order.dto.OrderSummaryResponse;
import budakgpt.yieldgridbackend.modules.order.dto.UpdateOrderStatusRequest;

public interface OrderService {
    OrderResponse createOrder(CreateOrderRequest request);

    OrderResponse cancelOrder(UUID id);

    OrderResponse completeOrder(UUID id);

    OrderResponse updateStatus(UUID id, UpdateOrderStatusRequest request);

    OrderResponse getOrder(UUID id);

    Page<OrderSummaryResponse> getMyOrders(Pageable pageable);

    Page<OrderSummaryResponse> getSellerOrders(Pageable pageable);

    Page<OrderSummaryResponse> getAllOrders(Pageable pageable);
}
