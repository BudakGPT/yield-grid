package budakgpt.yieldgridbackend.modules.order;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.blankOrNullString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import budakgpt.yieldgridbackend.modules.auth.repository.UserRepository;
import budakgpt.yieldgridbackend.modules.order.repository.OrderRepository;
import budakgpt.yieldgridbackend.modules.product.entity.ProductCategory;
import budakgpt.yieldgridbackend.modules.product.repository.ProductCategoryRepository;
import budakgpt.yieldgridbackend.modules.product.repository.ProductRepository;

@SpringBootTest
@AutoConfigureMockMvc
class OrderControllerIntegrationTests {

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductCategoryRepository categoryRepository;

    private ProductCategory category;

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();
        category = categoryRepository.save(ProductCategory.builder()
                .name("Grains")
                .description("Staple grains")
                .active(true)
                .build());
    }

    @Test
    void buyerCanCreateOrderAndStockIsDeducted() throws Exception {
        String sellerToken = register("seller-order-create@example.com", "SELLER");
        String buyerToken = register("buyer-order-create@example.com", "BUYER");
        UUID productId = createProduct(sellerToken, "Order Rice", 50, 10);

        UUID orderId = createOrder(buyerToken, productId, 3);

        mockMvc.perform(get("/api/orders/{id}", orderId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(buyerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING_PAYMENT"))
                .andExpect(jsonPath("$.subtotal").value(150))
                .andExpect(jsonPath("$.totalAmount").value(150))
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.items[0].productName").value("Order Rice"));

        mockMvc.perform(get("/api/products/{id}", productId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(sellerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stock").value(7));
    }

    @Test
    void buyerCannotOrderOwnProduct() throws Exception {
        String sellerToken = register("seller-self-order@example.com", "SELLER");
        UUID productId = createProduct(sellerToken, "Own Product", 25, 5);

        mockMvc.perform(post("/api/orders")
                        .header(HttpHeaders.AUTHORIZATION, bearer(sellerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(orderPayload(productId, 1)))
                .andExpect(status().isForbidden());
    }

    @Test
    void duplicateProductsAreRejected() throws Exception {
        String sellerToken = register("seller-duplicate-order@example.com", "SELLER");
        String buyerToken = register("buyer-duplicate-order@example.com", "BUYER");
        UUID productId = createProduct(sellerToken, "Duplicate Product", 25, 5);

        mockMvc.perform(post("/api/orders")
                        .header(HttpHeaders.AUTHORIZATION, bearer(buyerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "items": [
                                    { "productId": "%s", "quantity": 1 },
                                    { "productId": "%s", "quantity": 1 }
                                  ],
                                  "paymentMethod": "BANK_TRANSFER",
                                  "recipientName": "Buyer",
                                  "recipientPhone": "08123456789",
                                  "province": "West Java",
                                  "city": "Bandung",
                                  "district": "Coblong",
                                  "postalCode": "40132",
                                  "fullAddress": "Jl. Example No. 1"
                                }
                                """.formatted(productId, productId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Duplicate products are not allowed in a single order"));
    }

    @Test
    void insufficientStockIsRejected() throws Exception {
        String sellerToken = register("seller-stock-order@example.com", "SELLER");
        String buyerToken = register("buyer-stock-order@example.com", "BUYER");
        UUID productId = createProduct(sellerToken, "Low Stock Product", 25, 2);

        mockMvc.perform(post("/api/orders")
                        .header(HttpHeaders.AUTHORIZATION, bearer(buyerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(orderPayload(productId, 3)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Insufficient stock for product 'Low Stock Product'"));
    }

    @Test
    void sellerCanMovePaidOrderToProcessingAndShippedOnly() throws Exception {
        String sellerToken = register("seller-status-order@example.com", "SELLER");
        String buyerToken = register("buyer-status-order@example.com", "BUYER");
        String adminToken = register("admin-status-order@example.com", "ADMIN");
        UUID productId = createProduct(sellerToken, "Status Product", 10, 5);
        UUID orderId = createOrder(buyerToken, productId, 1);

        updateStatus(adminToken, orderId, "PAID")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PAID"));

        updateStatus(sellerToken, orderId, "PROCESSING")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PROCESSING"));

        updateStatus(sellerToken, orderId, "SHIPPED")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SHIPPED"));
    }

    @Test
    void invalidStatusTransitionIsRejected() throws Exception {
        String sellerToken = register("seller-invalid-status@example.com", "SELLER");
        String buyerToken = register("buyer-invalid-status@example.com", "BUYER");
        String adminToken = register("admin-invalid-status@example.com", "ADMIN");
        UUID productId = createProduct(sellerToken, "Invalid Status Product", 10, 5);
        UUID orderId = createOrder(buyerToken, productId, 1);

        updateStatus(adminToken, orderId, "SHIPPED")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Cannot change order status from PENDING_PAYMENT to SHIPPED"));
    }

    @Test
    void cancelRestoresStock() throws Exception {
        String sellerToken = register("seller-cancel-order@example.com", "SELLER");
        String buyerToken = register("buyer-cancel-order@example.com", "BUYER");
        UUID productId = createProduct(sellerToken, "Cancel Product", 10, 5);
        UUID orderId = createOrder(buyerToken, productId, 2);

        mockMvc.perform(patch("/api/orders/{id}/cancel", orderId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(buyerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        mockMvc.perform(get("/api/products/{id}", productId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(sellerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stock").value(5));
    }

    @Test
    void sellerCanViewSellerOrdersAndSupportCanViewAll() throws Exception {
        String sellerToken = register("seller-view-order@example.com", "SELLER");
        String buyerToken = register("buyer-view-order@example.com", "BUYER");
        String supportToken = register("support-view-order@example.com", "SUPPORT");
        UUID productId = createProduct(sellerToken, "View Product", 10, 5);
        createOrder(buyerToken, productId, 1);

        mockMvc.perform(get("/api/orders/seller")
                        .header(HttpHeaders.AUTHORIZATION, bearer(sellerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)));

        mockMvc.perform(get("/api/orders")
                        .header(HttpHeaders.AUTHORIZATION, bearer(supportToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)));
    }

    @Test
    void swaggerApiDocsIncludeOrders() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/api/orders']").exists())
                .andExpect(jsonPath("$.paths['/api/orders/my']").exists());
    }

    private UUID createOrder(String buyerToken, UUID productId, int quantity) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/orders")
                        .header(HttpHeaders.AUTHORIZATION, bearer(buyerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(orderPayload(productId, quantity)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", not(blankOrNullString())))
                .andReturn();
        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return UUID.fromString(json.get("id").asText());
    }

    private org.springframework.test.web.servlet.ResultActions updateStatus(String token, UUID orderId, String status) throws Exception {
        return mockMvc.perform(patch("/api/orders/{id}/status", orderId)
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        { "status": "%s" }
                        """.formatted(status)));
    }

    private UUID createProduct(String token, String name, int price, int stock) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/products")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "%s",
                                  "description": "Order test product",
                                  "categoryId": "%s",
                                  "price": %d,
                                  "stock": %d,
                                  "qualityGrade": "PREMIUM",
                                  "unit": "KG",
                                  "originProvince": "West Java",
                                  "originCity": "Bandung",
                                  "harvestDate": "2026-07-01",
                                  "expirationDate": "2026-08-01"
                                }
                                """.formatted(name, category.getId(), price, stock)))
                .andExpect(status().isCreated())
                .andReturn();
        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return UUID.fromString(json.get("id").asText());
    }

    private String orderPayload(UUID productId, int quantity) {
        return """
                {
                  "items": [
                    { "productId": "%s", "quantity": %d }
                  ],
                  "paymentMethod": "BANK_TRANSFER",
                  "recipientName": "Buyer",
                  "recipientPhone": "08123456789",
                  "province": "West Java",
                  "city": "Bandung",
                  "district": "Coblong",
                  "postalCode": "40132",
                  "fullAddress": "Jl. Example No. 1",
                  "notes": "Leave at security"
                }
                """.formatted(productId, quantity);
    }

    private String register(String email, String role) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "%s User",
                                  "email": "%s",
                                  "password": "password123",
                                  "role": "%s"
                                }
                                """.formatted(role, email, role)))
                .andExpect(status().isCreated())
                .andReturn();
        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return json.get("accessToken").asText();
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
