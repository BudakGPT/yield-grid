package budakgpt.yieldgridbackend.modules.demo;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import budakgpt.yieldgridbackend.config.OpenRouterProperties;
import budakgpt.yieldgridbackend.modules.auth.entity.UserEntity;
import budakgpt.yieldgridbackend.modules.auth.repository.UserRepository;
import budakgpt.yieldgridbackend.modules.cart.repository.CartRepository;
import budakgpt.yieldgridbackend.modules.demo.dto.DemoMintRequest;
import budakgpt.yieldgridbackend.modules.demo.exception.ActiveEscrowResetException;
import budakgpt.yieldgridbackend.modules.grading.repository.ProductGradingRepository;
import budakgpt.yieldgridbackend.modules.order.entity.Order;
import budakgpt.yieldgridbackend.modules.order.enums.EscrowStatus;
import budakgpt.yieldgridbackend.modules.order.exception.OrderNotFoundException;
import budakgpt.yieldgridbackend.modules.order.repository.OrderRepository;
import budakgpt.yieldgridbackend.modules.product.repository.ProductRepository;
import budakgpt.yieldgridbackend.modules.stellar.SidecarClient;
import budakgpt.yieldgridbackend.modules.telemetry.entity.Telemetry;
import budakgpt.yieldgridbackend.modules.telemetry.repository.TelemetryRepository;
import budakgpt.yieldgridbackend.modules.ws.YieldGridEventPublisher;

@Service
public class DemoService {
    private final OrderRepository orderRepository;
    private final TelemetryRepository telemetryRepository;
    private final ProductGradingRepository gradingRepository;
    private final ProductRepository productRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final SidecarClient sidecarClient;
    private final YieldGridEventPublisher eventPublisher;
    private final JdbcTemplate jdbcTemplate;
    private final OpenRouterProperties openRouterProperties;
    private final String gradingMode;

    public DemoService(
            OrderRepository orderRepository,
            TelemetryRepository telemetryRepository,
            ProductGradingRepository gradingRepository,
            ProductRepository productRepository,
            CartRepository cartRepository,
            UserRepository userRepository,
            SidecarClient sidecarClient,
            YieldGridEventPublisher eventPublisher,
            JdbcTemplate jdbcTemplate,
            OpenRouterProperties openRouterProperties,
            @Value("${app.grading.mode:rehearsal}") String gradingMode
    ) {
        this.orderRepository = orderRepository;
        this.telemetryRepository = telemetryRepository;
        this.gradingRepository = gradingRepository;
        this.productRepository = productRepository;
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
        this.sidecarClient = sidecarClient;
        this.eventPublisher = eventPublisher;
        this.jdbcTemplate = jdbcTemplate;
        this.openRouterProperties = openRouterProperties;
        this.gradingMode = gradingMode;
    }

    @Transactional
    public Map<String, Object> startTransit(java.util.UUID orderId) {
        Order order = findOrder(orderId);
        if (order.getEscrowStatus() != EscrowStatus.ESCROWED) {
            throw new IllegalArgumentException("Only escrowed orders can start transit");
        }
        Telemetry point = point(order, new BigDecimal("-6.9720000"), new BigDecimal("107.6300000"), new BigDecimal("4.60"));
        order.setEscrowStatus(EscrowStatus.IN_TRANSIT);
        order.setLastTemperatureC(point.getTempC());
        orderRepository.save(order);
        Map<String, Object> payload = telemetryPayload(point);
        eventPublisher.publish("transit.update", orderId, payload);
        return payload;
    }

    @Transactional
    public Map<String, Object> injectBreach(java.util.UUID orderId) {
        Order order = findOrder(orderId);
        if (!java.util.Set.of(EscrowStatus.ESCROWED, EscrowStatus.IN_TRANSIT).contains(order.getEscrowStatus())) {
            throw new IllegalArgumentException("Only active escrow transit can receive a breach");
        }
        Telemetry point = point(order, new BigDecimal("-6.7812000"), new BigDecimal("107.7419000"), new BigDecimal("9.20"));
        order.setEscrowStatus(EscrowStatus.BREACHED);
        order.setBreachDetected(true);
        order.setDiscountBps(1_500);
        order.setLastTemperatureC(point.getTempC());
        orderRepository.save(order);
        Map<String, Object> payload = telemetryPayload(point);
        eventPublisher.publish("transit.breach", orderId, payload);
        return payload;
    }

    public Map<String, Object> mint(DemoMintRequest request) {
        String address = request.address();
        if ((address == null || address.isBlank()) && request.userId() != null) {
            address = userRepository.findById(request.userId())
                    .map(UserEntity::getStellarPublicKey)
                    .orElseThrow(() -> new IllegalArgumentException("User has no provisioned wallet"));
        }
        if (address == null || address.isBlank()) {
            throw new IllegalArgumentException("address or user_id is required");
        }
        String hash = sidecarClient.mint(address, request.amount().stripTrailingZeros().toPlainString());
        return Map.of("tx_hash", hash, "address", address, "amount", request.amount());
    }

    // Escrow states with buyer funds locked on-chain; deleting these would orphan real testnet funds.
    private static final List<EscrowStatus> ACTIVE_ESCROW_STATUSES =
            List.of(EscrowStatus.ESCROWED, EscrowStatus.IN_TRANSIT, EscrowStatus.BREACHED);

    @Transactional
    public Map<String, Object> reset() {
        if (orderRepository.existsByEscrowStatusIn(ACTIVE_ESCROW_STATUSES)) {
            throw new ActiveEscrowResetException();
        }
        telemetryRepository.deleteAllInBatch();
        orderRepository.deleteAll();
        cartRepository.deleteAll();
        gradingRepository.deleteAll();
        productRepository.deleteAll();
        return Map.of("status", "reset", "accounts_preserved", true, "contract_preserved", true);
    }

    public Map<String, Object> health() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("api", "ready");
        try {
            result.put("database", jdbcTemplate.queryForObject("select 1", Integer.class) == 1 ? "ready" : "unavailable");
        } catch (RuntimeException exception) {
            result.put("database", "unavailable");
        }
        result.put("grading", gradingStatus());
        if ("openrouter".equalsIgnoreCase(gradingMode)) {
            result.put("grading_model", openRouterProperties.model());
        }
        SidecarClient.HealthResponse sidecar = sidecarClient.health();
        result.put("stellar", sidecar.status());
        result.put("contract_id", sidecar.escrowContractId());
        result.put("websocket", "ready");
        result.put("transit", "simulated");
        return result;
    }

    private String gradingStatus() {
        if ("rehearsal".equalsIgnoreCase(gradingMode)) {
            return "rehearsal-cache";
        }
        return "openrouter".equalsIgnoreCase(gradingMode) && openRouterProperties.configured()
                ? "live"
                : "unconfigured";
    }

    private Order findOrder(java.util.UUID orderId) {
        return orderRepository.findById(orderId).orElseThrow(() -> new OrderNotFoundException(orderId));
    }

    private Telemetry point(Order order, BigDecimal lat, BigDecimal lng, BigDecimal tempC) {
        return telemetryRepository.save(Telemetry.builder()
                .order(order)
                .ts(Instant.now())
                .lat(lat)
                .lng(lng)
                .tempC(tempC)
                .simulated(true)
                .build());
    }

    private Map<String, Object> telemetryPayload(Telemetry point) {
        return Map.of(
                "lat", point.getLat(),
                "lng", point.getLng(),
                "temp_c", point.getTempC(),
                "simulated", true,
                "ts", point.getTs()
        );
    }
}
