package budakgpt.yieldgridbackend.modules.admin.service;

import java.time.Instant;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import budakgpt.yieldgridbackend.common.exception.ResourceNotFoundException;
import budakgpt.yieldgridbackend.common.security.CurrentUserService;
import budakgpt.yieldgridbackend.config.IntegrationProperties;
import budakgpt.yieldgridbackend.config.OpenRouterProperties;
import budakgpt.yieldgridbackend.config.PinataProperties;
import budakgpt.yieldgridbackend.modules.admin.dto.AdminAuditResponse;
import budakgpt.yieldgridbackend.modules.admin.dto.AdminOverviewResponse;
import budakgpt.yieldgridbackend.modules.admin.dto.AdminUserResponse;
import budakgpt.yieldgridbackend.modules.admin.entity.AdminAuditEvent;
import budakgpt.yieldgridbackend.modules.admin.repository.AdminAuditRepository;
import budakgpt.yieldgridbackend.modules.auth.config.SupabaseAuthProperties;
import budakgpt.yieldgridbackend.modules.auth.entity.UserEntity;
import budakgpt.yieldgridbackend.modules.auth.enums.Role;
import budakgpt.yieldgridbackend.modules.auth.repository.UserRepository;
import budakgpt.yieldgridbackend.modules.grading.repository.ProductGradingRepository;
import budakgpt.yieldgridbackend.modules.order.dto.OrderResponse;
import budakgpt.yieldgridbackend.modules.order.dto.OrderSummaryResponse;
import budakgpt.yieldgridbackend.modules.order.dto.UpdateOrderStatusRequest;
import budakgpt.yieldgridbackend.modules.order.enums.OrderStatus;
import budakgpt.yieldgridbackend.modules.order.repository.OrderRepository;
import budakgpt.yieldgridbackend.modules.order.service.OrderService;
import budakgpt.yieldgridbackend.modules.product.dto.ChangeStatusRequest;
import budakgpt.yieldgridbackend.modules.product.dto.ProductResponse;
import budakgpt.yieldgridbackend.modules.product.dto.ProductSummaryResponse;
import budakgpt.yieldgridbackend.modules.product.enums.ProductStatus;
import budakgpt.yieldgridbackend.modules.product.repository.ProductRepository;
import budakgpt.yieldgridbackend.modules.product.service.ProductService;
import budakgpt.yieldgridbackend.modules.stellar.SidecarClient;

@Service
public class AdminService {
    private static final Set<OrderStatus> ACTIVE_ORDER_STATUSES = Set.of(
            OrderStatus.PENDING_PAYMENT,
            OrderStatus.PAID,
            OrderStatus.PROCESSING,
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED
    );

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ProductGradingRepository gradingRepository;
    private final AdminAuditRepository auditRepository;
    private final CurrentUserService currentUserService;
    private final ProductService productService;
    private final OrderService orderService;
    private final JdbcTemplate jdbcTemplate;
    private final SupabaseAuthProperties supabaseProperties;
    private final OpenRouterProperties openRouterProperties;
    private final PinataProperties pinataProperties;
    private final IntegrationProperties integrationProperties;
    private final SidecarClient sidecarClient;
    private final String gradingMode;

    public AdminService(
            UserRepository userRepository,
            ProductRepository productRepository,
            OrderRepository orderRepository,
            ProductGradingRepository gradingRepository,
            AdminAuditRepository auditRepository,
            CurrentUserService currentUserService,
            ProductService productService,
            OrderService orderService,
            JdbcTemplate jdbcTemplate,
            SupabaseAuthProperties supabaseProperties,
            OpenRouterProperties openRouterProperties,
            PinataProperties pinataProperties,
            IntegrationProperties integrationProperties,
            SidecarClient sidecarClient,
            @Value("${app.grading.mode:openrouter}") String gradingMode
    ) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.gradingRepository = gradingRepository;
        this.auditRepository = auditRepository;
        this.currentUserService = currentUserService;
        this.productService = productService;
        this.orderService = orderService;
        this.jdbcTemplate = jdbcTemplate;
        this.supabaseProperties = supabaseProperties;
        this.openRouterProperties = openRouterProperties;
        this.pinataProperties = pinataProperties;
        this.integrationProperties = integrationProperties;
        this.sidecarClient = sidecarClient;
        this.gradingMode = gradingMode;
    }

    public AdminOverviewResponse overview() {
        Map<String, Long> ordersByStatus = new LinkedHashMap<>();
        Arrays.stream(OrderStatus.values())
                .forEach(status -> ordersByStatus.put(status.name(), orderRepository.countByStatus(status)));

        AdminOverviewResponse.Metrics metrics = new AdminOverviewResponse.Metrics(
                userRepository.count(),
                userRepository.countByEnabledTrue(),
                userRepository.countByRole(Role.BUYER),
                userRepository.countByRole(Role.SELLER),
                productRepository.count(),
                productRepository.countByStatus(ProductStatus.ACTIVE),
                orderRepository.count(),
                orderRepository.countByStatusIn(ACTIVE_ORDER_STATUSES),
                gradingRepository.count(),
                ordersByStatus
        );
        List<AdminAuditResponse> activity = auditRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(this::toAuditResponse)
                .toList();
        return new AdminOverviewResponse(metrics, integrationStatuses(), activity, Instant.now());
    }

    @Transactional(readOnly = true)
    public Page<AdminUserResponse> users(String query, Role role, Boolean enabled, Pageable pageable) {
        String normalizedQuery = query == null ? "" : query.trim();
        return userRepository.searchForAdmin(normalizedQuery, role, enabled, pageable).map(this::toUserResponse);
    }

    @Transactional
    public AdminUserResponse updateUserStatus(UUID userId, boolean enabled) {
        UserEntity actor = currentUserService.requireUser();
        UserEntity target = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (actor.getId().equals(target.getId()) && !enabled) {
            throw new IllegalArgumentException("Administrators cannot disable their own account");
        }
        target.setEnabled(enabled);
        UserEntity saved = userRepository.save(target);
        audit(actor, enabled ? "USER_ENABLED" : "USER_DISABLED", "USER", userId.toString(), target.getEmail());
        return toUserResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<OrderSummaryResponse> orders(Pageable pageable) {
        return orderService.getAllOrders(pageable);
    }

    @Transactional
    public OrderResponse updateOrderStatus(UUID orderId, UpdateOrderStatusRequest request) {
        OrderResponse response = orderService.updateStatus(orderId, request);
        audit(currentUserService.requireUser(), "ORDER_STATUS_UPDATED", "ORDER", orderId.toString(), request.status().name());
        return response;
    }

    @Transactional(readOnly = true)
    public Page<ProductSummaryResponse> products(Pageable pageable) {
        return productService.getAllProducts(pageable);
    }

    @Transactional
    public ProductResponse updateProductStatus(UUID productId, ChangeStatusRequest request) {
        ProductResponse response = productService.changeStatus(productId, request);
        audit(currentUserService.requireUser(), "PRODUCT_STATUS_UPDATED", "PRODUCT", productId.toString(), request.status().name());
        return response;
    }

    @Transactional(readOnly = true)
    public Page<AdminAuditResponse> auditEvents(Pageable pageable) {
        return auditRepository.findAll(pageable).map(this::toAuditResponse);
    }

    private List<AdminOverviewResponse.IntegrationStatus> integrationStatuses() {
        List<AdminOverviewResponse.IntegrationStatus> statuses = new java.util.ArrayList<>();
        long started = System.nanoTime();
        try {
            Integer value = jdbcTemplate.queryForObject("select 1", Integer.class);
            statuses.add(status("Database", value != null && value == 1 ? "READY" : "DEGRADED",
                    "PostgreSQL connection", elapsedMillis(started)));
        } catch (RuntimeException exception) {
            statuses.add(status("Database", "DOWN", "Database query failed", elapsedMillis(started)));
        }
        statuses.add(status("Supabase Auth", supabaseProperties.configured() ? "READY" : "UNCONFIGURED",
                "Authentication provider", null));
        String gradingStatus = "openrouter".equalsIgnoreCase(gradingMode) && openRouterProperties.configured()
                ? "READY"
                : "UNCONFIGURED";
        statuses.add(status("AI grading", gradingStatus,
                "openrouter".equalsIgnoreCase(gradingMode) ? openRouterProperties.model() : gradingMode, null));
        statuses.add(status("Pinata", pinataProperties.configured() ? "READY" : "UNCONFIGURED",
                "Evidence storage", null));
        statuses.add(sidecarStatus());
        statuses.add(status("WebSocket", "READY", "Realtime event broker", null));
        return statuses;
    }

    private AdminOverviewResponse.IntegrationStatus sidecarStatus() {
        if (!integrationProperties.sidecarEnabled()) {
            return status("Settlement", "DISABLED", "Settlement sidecar is disabled", null);
        }
        long started = System.nanoTime();
        try {
            SidecarClient.HealthResponse health = sidecarClient.health();
            String state = "ready".equalsIgnoreCase(health.status()) ? "READY" : "DEGRADED";
            String detail = Boolean.TRUE.equals(health.configured())
                    ? "Stellar RPC " + health.rpcStatus()
                    : "Contract configuration incomplete";
            return status("Settlement", state, detail, elapsedMillis(started));
        } catch (RuntimeException exception) {
            return status("Settlement", "DOWN", "Settlement sidecar is unavailable", elapsedMillis(started));
        }
    }

    private AdminOverviewResponse.IntegrationStatus status(String name, String state, String detail, Long latencyMs) {
        return new AdminOverviewResponse.IntegrationStatus(name, state, detail, latencyMs);
    }

    private long elapsedMillis(long started) {
        return (System.nanoTime() - started) / 1_000_000L;
    }

    private AdminUserResponse toUserResponse(UserEntity user) {
        return new AdminUserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                Boolean.TRUE.equals(user.getEnabled()),
                Boolean.TRUE.equals(user.getEmailVerified()),
                user.getStellarPublicKey() != null && user.getStellarSecretEnc() != null,
                user.getCreatedAt(),
                user.getLastLoginAt()
        );
    }

    private AdminAuditResponse toAuditResponse(AdminAuditEvent event) {
        return new AdminAuditResponse(
                event.getId(),
                event.getActorId(),
                event.getActorEmail(),
                event.getAction(),
                event.getTargetType(),
                event.getTargetId(),
                event.getDetail(),
                event.getCreatedAt()
        );
    }

    private void audit(UserEntity actor, String action, String targetType, String targetId, String detail) {
        auditRepository.save(AdminAuditEvent.builder()
                .actorId(actor.getId())
                .actorEmail(actor.getEmail())
                .action(action)
                .targetType(targetType)
                .targetId(targetId)
                .detail(detail)
                .build());
    }
}
