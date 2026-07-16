package budakgpt.yieldgridbackend.modules.order.service.impl;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import budakgpt.yieldgridbackend.modules.auth.entity.UserEntity;
import budakgpt.yieldgridbackend.modules.auth.enums.Role;
import budakgpt.yieldgridbackend.modules.auth.repository.UserRepository;
import budakgpt.yieldgridbackend.modules.order.dto.CreateOrderRequest;
import budakgpt.yieldgridbackend.modules.order.dto.OrderItemRequest;
import budakgpt.yieldgridbackend.modules.order.dto.OrderResponse;
import budakgpt.yieldgridbackend.modules.order.dto.OrderSummaryResponse;
import budakgpt.yieldgridbackend.modules.order.dto.UpdateOrderStatusRequest;
import budakgpt.yieldgridbackend.modules.order.entity.Order;
import budakgpt.yieldgridbackend.modules.order.entity.OrderItem;
import budakgpt.yieldgridbackend.modules.order.enums.OrderStatus;
import budakgpt.yieldgridbackend.modules.order.exception.InsufficientStockException;
import budakgpt.yieldgridbackend.modules.order.exception.InvalidOrderRequestException;
import budakgpt.yieldgridbackend.modules.order.exception.InvalidOrderStatusTransitionException;
import budakgpt.yieldgridbackend.modules.order.exception.OrderNotFoundException;
import budakgpt.yieldgridbackend.modules.order.exception.ProductInactiveException;
import budakgpt.yieldgridbackend.modules.order.exception.UnauthorizedOrderAccessException;
import budakgpt.yieldgridbackend.modules.order.mapper.OrderMapper;
import budakgpt.yieldgridbackend.modules.order.repository.OrderRepository;
import budakgpt.yieldgridbackend.modules.order.service.OrderService;
import budakgpt.yieldgridbackend.modules.product.entity.Product;
import budakgpt.yieldgridbackend.modules.product.enums.ProductStatus;
import budakgpt.yieldgridbackend.modules.product.exception.ProductNotFoundException;
import budakgpt.yieldgridbackend.modules.product.repository.ProductRepository;

@Service
public class OrderServiceImpl implements OrderService {

    private static final BigDecimal DEFAULT_SHIPPING_FEE = BigDecimal.ZERO;
    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED_TRANSITIONS = new EnumMap<>(OrderStatus.class);

    static {
        ALLOWED_TRANSITIONS.put(OrderStatus.PENDING_PAYMENT, Set.of(OrderStatus.PAID, OrderStatus.CANCELLED));
        ALLOWED_TRANSITIONS.put(OrderStatus.PAID, Set.of(OrderStatus.PROCESSING, OrderStatus.REFUNDED));
        ALLOWED_TRANSITIONS.put(OrderStatus.PROCESSING, Set.of(OrderStatus.SHIPPED));
        ALLOWED_TRANSITIONS.put(OrderStatus.SHIPPED, Set.of(OrderStatus.DELIVERED));
        ALLOWED_TRANSITIONS.put(OrderStatus.DELIVERED, Set.of(OrderStatus.COMPLETED));
        ALLOWED_TRANSITIONS.put(OrderStatus.COMPLETED, Set.of());
        ALLOWED_TRANSITIONS.put(OrderStatus.CANCELLED, Set.of());
        ALLOWED_TRANSITIONS.put(OrderStatus.REFUNDED, Set.of());
    }

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderMapper orderMapper;

    public OrderServiceImpl(
            OrderRepository orderRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            OrderMapper orderMapper
    ) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.orderMapper = orderMapper;
    }

    @Override
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        UserEntity buyer = currentUser();
        if (buyer.getRole() != Role.BUYER) {
            throw new InvalidOrderRequestException("Only buyers can create orders");
        }
        rejectDuplicateProducts(request.items());

        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .buyer(buyer)
                .status(OrderStatus.PENDING_PAYMENT)
                .paymentMethod(request.paymentMethod())
                .subtotal(BigDecimal.ZERO)
                .shippingFee(DEFAULT_SHIPPING_FEE)
                .totalAmount(BigDecimal.ZERO)
                .recipientName(request.recipientName().trim())
                .recipientPhone(request.recipientPhone().trim())
                .province(trimToNull(request.province()))
                .city(trimToNull(request.city()))
                .district(trimToNull(request.district()))
                .postalCode(trimToNull(request.postalCode()))
                .fullAddress(request.fullAddress().trim())
                .notes(trimToNull(request.notes()))
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrderItemRequest itemRequest : request.items()) {
            Product product = productRepository.findById(itemRequest.productId())
                    .orElseThrow(() -> new ProductNotFoundException(itemRequest.productId()));
            validateProductCanBeOrdered(product, buyer, itemRequest.quantity());

            BigDecimal itemSubtotal = product.getPrice().multiply(BigDecimal.valueOf(itemRequest.quantity()));
            OrderItem item = OrderItem.builder()
                    .product(product)
                    .seller(product.getSeller())
                    .productName(product.getName())
                    .qualityGrade(product.getQualityGrade())
                    .quantity(itemRequest.quantity())
                    .unitPrice(product.getPrice())
                    .subtotal(itemSubtotal)
                    .build();
            order.addItem(item);
            subtotal = subtotal.add(itemSubtotal);

            product.setStock(product.getStock() - itemRequest.quantity());
            if (product.getStock() == 0) {
                product.setStatus(ProductStatus.OUT_OF_STOCK);
            }
        }

        order.setSubtotal(subtotal);
        order.setTotalAmount(subtotal.add(order.getShippingFee()));
        return orderMapper.toResponse(orderRepository.save(order));
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(UUID id) {
        Order order = findOrder(id);
        UserEntity user = currentUser();
        if (!isBuyer(order, user) && !isAdmin(user)) {
            throw new UnauthorizedOrderAccessException();
        }
        transition(order, OrderStatus.CANCELLED, user);
        restoreStock(order);
        return orderMapper.toResponse(orderRepository.save(order));
    }

    @Override
    @Transactional
    public OrderResponse completeOrder(UUID id) {
        Order order = findOrder(id);
        UserEntity user = currentUser();
        if (!isBuyer(order, user) && !isAdmin(user)) {
            throw new UnauthorizedOrderAccessException();
        }
        transition(order, OrderStatus.COMPLETED, user);
        order.setCompletedAt(Instant.now());
        return orderMapper.toResponse(orderRepository.save(order));
    }

    @Override
    @Transactional
    public OrderResponse updateStatus(UUID id, UpdateOrderStatusRequest request) {
        Order order = findOrder(id);
        UserEntity user = currentUser();
        transition(order, request.status(), user);
        if (request.status() == OrderStatus.REFUNDED) {
            restoreStock(order);
        }
        if (request.status() == OrderStatus.COMPLETED) {
            order.setCompletedAt(Instant.now());
        }
        return orderMapper.toResponse(orderRepository.save(order));
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrder(UUID id) {
        Order order = findOrder(id);
        assertCanView(order, currentUser());
        return orderMapper.toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderSummaryResponse> getMyOrders(Pageable pageable) {
        return orderRepository.findByBuyer(currentUser(), pageable).map(orderMapper::toSummaryResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderSummaryResponse> getSellerOrders(Pageable pageable) {
        UserEntity seller = currentUser();
        if (seller.getRole() != Role.SELLER) {
            throw new UnauthorizedOrderAccessException();
        }
        return orderRepository.findOrdersBySeller(seller, pageable).map(orderMapper::toSummaryResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderSummaryResponse> getAllOrders(Pageable pageable) {
        UserEntity user = currentUser();
        if (!isAdmin(user) && user.getRole() != Role.MODERATOR && user.getRole() != Role.SUPPORT) {
            throw new UnauthorizedOrderAccessException();
        }
        return orderRepository.findAll(pageable).map(orderMapper::toSummaryResponse);
    }

    private Order findOrder(UUID id) {
        return orderRepository.findById(id).orElseThrow(() -> new OrderNotFoundException(id));
    }

    private void validateProductCanBeOrdered(Product product, UserEntity buyer, int quantity) {
        if (product.getSeller().getId().equals(buyer.getId())) {
            throw new InvalidOrderRequestException("Buyer cannot order their own product");
        }
        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new ProductInactiveException(product.getName());
        }
        if (product.getStock() < quantity) {
            throw new InsufficientStockException(product.getName());
        }
    }

    private void rejectDuplicateProducts(List<OrderItemRequest> items) {
        Set<UUID> uniqueProductIds = items.stream()
                .map(OrderItemRequest::productId)
                .collect(Collectors.toSet());
        if (uniqueProductIds.size() != items.size()) {
            throw new InvalidOrderRequestException("Duplicate products are not allowed in a single order");
        }
    }

    private void transition(Order order, OrderStatus targetStatus, UserEntity user) {
        if (order.getStatus() == OrderStatus.COMPLETED) {
            throw new InvalidOrderStatusTransitionException("Completed orders cannot be modified");
        }
        assertCanTransition(order, targetStatus, user);
        if (!ALLOWED_TRANSITIONS.getOrDefault(order.getStatus(), Set.of()).contains(targetStatus)) {
            throw new InvalidOrderStatusTransitionException(
                    "Cannot change order status from %s to %s".formatted(order.getStatus(), targetStatus)
            );
        }
        order.setStatus(targetStatus);
    }

    private void assertCanTransition(Order order, OrderStatus targetStatus, UserEntity user) {
        if (isAdmin(user)) {
            return;
        }
        if (user.getRole() == Role.SELLER
                && sellerOwnsAnyItem(order, user)
                && Set.of(OrderStatus.PROCESSING, OrderStatus.SHIPPED).contains(targetStatus)) {
            return;
        }
        if (isBuyer(order, user) && Set.of(OrderStatus.CANCELLED, OrderStatus.COMPLETED).contains(targetStatus)) {
            return;
        }
        throw new UnauthorizedOrderAccessException();
    }

    private void assertCanView(Order order, UserEntity user) {
        if (isAdmin(user) || user.getRole() == Role.MODERATOR || user.getRole() == Role.SUPPORT || isBuyer(order, user)
                || (user.getRole() == Role.SELLER && sellerOwnsAnyItem(order, user))) {
            return;
        }
        throw new UnauthorizedOrderAccessException();
    }

    private void restoreStock(Order order) {
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            if (product.getStatus() == ProductStatus.OUT_OF_STOCK && product.getStock() > 0) {
                product.setStatus(ProductStatus.ACTIVE);
            }
        }
    }

    private boolean sellerOwnsAnyItem(Order order, UserEntity seller) {
        return order.getItems().stream().anyMatch(item -> item.getSeller().getId().equals(seller.getId()));
    }

    private boolean isBuyer(Order order, UserEntity user) {
        return order.getBuyer().getId().equals(user.getId());
    }

    private boolean isAdmin(UserEntity user) {
        return user.getRole() == Role.ADMIN;
    }

    private UserEntity currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new UnauthorizedOrderAccessException();
        }
        return userRepository.findByEmail(authentication.getName()).orElseThrow(UnauthorizedOrderAccessException::new);
    }

    private String generateOrderNumber() {
        return "YG-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
