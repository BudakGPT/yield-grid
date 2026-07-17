package budakgpt.yieldgridbackend.modules.order.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import budakgpt.yieldgridbackend.modules.order.dto.CreateOrderRequest;
import budakgpt.yieldgridbackend.modules.order.dto.OrderResponse;
import budakgpt.yieldgridbackend.modules.order.dto.OrderSummaryResponse;
import budakgpt.yieldgridbackend.modules.order.dto.UpdateOrderStatusRequest;
import budakgpt.yieldgridbackend.modules.order.dto.DeliveryRequest;
import budakgpt.yieldgridbackend.modules.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Orders", description = "Purchase lifecycle between buyers and sellers")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "Create an order")
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(request));
    }

    @PostMapping("/{id}/deliver")
    @PreAuthorize("hasAnyRole('BUYER','ADMIN')")
    @Operation(summary = "Verify delivery and settle escrow")
    public OrderResponse deliverOrder(
            @PathVariable UUID id,
            @RequestBody(required = false) DeliveryRequest request
    ) {
        return orderService.deliverOrder(id, request == null ? new DeliveryRequest(null) : request);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPPORT')")
    @Operation(summary = "List all orders")
    public Page<OrderSummaryResponse> getAllOrders(Pageable pageable) {
        return orderService.getAllOrders(pageable);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "List current buyer orders")
    public Page<OrderSummaryResponse> getMyOrders(Pageable pageable) {
        return orderService.getMyOrders(pageable);
    }

    @GetMapping("/seller")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "List orders containing current seller products")
    public Page<OrderSummaryResponse> getSellerOrders(Pageable pageable) {
        return orderService.getSellerOrders(pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('BUYER','SELLER','ADMIN','MODERATOR','SUPPORT')")
    @Operation(summary = "Get order details")
    public OrderResponse getOrder(@PathVariable UUID id) {
        return orderService.getOrder(id);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    @Operation(summary = "Update order status")
    public OrderResponse updateStatus(@PathVariable UUID id, @Valid @RequestBody UpdateOrderStatusRequest request) {
        return orderService.updateStatus(id, request);
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('BUYER','ADMIN')")
    @Operation(summary = "Cancel an order")
    public OrderResponse cancelOrder(@PathVariable UUID id) {
        return orderService.cancelOrder(id);
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('BUYER','ADMIN')")
    @Operation(summary = "Complete an order")
    public OrderResponse completeOrder(@PathVariable UUID id) {
        return orderService.completeOrder(id);
    }
}
