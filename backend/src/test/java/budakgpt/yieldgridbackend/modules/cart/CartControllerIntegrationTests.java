package budakgpt.yieldgridbackend.modules.cart;

import static org.hamcrest.Matchers.blankOrNullString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
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
import budakgpt.yieldgridbackend.modules.cart.repository.CartRepository;
import budakgpt.yieldgridbackend.modules.order.repository.OrderRepository;
import budakgpt.yieldgridbackend.modules.product.entity.ProductCategory;
import budakgpt.yieldgridbackend.modules.product.repository.ProductCategoryRepository;
import budakgpt.yieldgridbackend.modules.product.repository.ProductRepository;

@SpringBootTest
@AutoConfigureMockMvc
class CartControllerIntegrationTests {

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductCategoryRepository categoryRepository;

    private ProductCategory category;

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
        cartRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();
        category = categoryRepository.save(ProductCategory.builder()
                .name("Vegetables")
                .description("Fresh vegetables")
                .active(true)
                .build());
    }

    @Test
    void buyerCanAddExistingProductAndQuantitiesMerge() throws Exception {
        String sellerToken = register("seller-cart-add@example.com", "SELLER");
        String buyerToken = register("buyer-cart-add@example.com", "BUYER");
        UUID productId = createProduct(sellerToken, "Cart Corn", 12, 8);

        addItem(buyerToken, productId, 2)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.items[0].productId").value(productId.toString()))
                .andExpect(jsonPath("$.items[0].quantity").value(2))
                .andExpect(jsonPath("$.subtotal").value(24))
                .andExpect(jsonPath("$.totalItems").value(2));

        addItem(buyerToken, productId, 3)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.items[0].quantity").value(5))
                .andExpect(jsonPath("$.subtotal").value(60))
                .andExpect(jsonPath("$.totalItems").value(5));
    }

    @Test
    void buyerCanUpdateRemoveAndClearItems() throws Exception {
        String sellerToken = register("seller-cart-update@example.com", "SELLER");
        String buyerToken = register("buyer-cart-update@example.com", "BUYER");
        UUID productId = createProduct(sellerToken, "Cart Rice", 10, 8);
        UUID itemId = addItemAndReturnItemId(buyerToken, productId, 2);

        mockMvc.perform(patch("/api/cart/items/{itemId}", itemId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(buyerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "quantity": 4
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].quantity").value(4))
                .andExpect(jsonPath("$.subtotal").value(40));

        mockMvc.perform(delete("/api/cart/items/{itemId}", itemId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(buyerToken)))
                .andExpect(status().isNoContent());

        addItem(buyerToken, productId, 1).andExpect(status().isOk());

        mockMvc.perform(delete("/api/cart")
                        .header(HttpHeaders.AUTHORIZATION, bearer(buyerToken)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/cart")
                        .header(HttpHeaders.AUTHORIZATION, bearer(buyerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(0)))
                .andExpect(jsonPath("$.subtotal").value(0))
                .andExpect(jsonPath("$.totalItems").value(0));
    }

    @Test
    void sellerCannotUseCartAndBuyerCannotAddOwnProduct() throws Exception {
        String sellerToken = register("seller-cart-denied@example.com", "SELLER");
        UUID productId = createProduct(sellerToken, "Seller Own Product", 10, 8);

        mockMvc.perform(get("/api/cart")
                        .header(HttpHeaders.AUTHORIZATION, bearer(sellerToken)))
                .andExpect(status().isForbidden());

        addItem(sellerToken, productId, 1)
                .andExpect(status().isForbidden());
    }

    @Test
    void inactiveOrInsufficientStockProductIsRejected() throws Exception {
        String sellerToken = register("seller-cart-stock@example.com", "SELLER");
        String buyerToken = register("buyer-cart-stock@example.com", "BUYER");
        UUID productId = createProduct(sellerToken, "Limited Product", 10, 2);

        addItem(buyerToken, productId, 3)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Insufficient stock for product 'Limited Product'"));

        mockMvc.perform(patch("/api/products/{id}/archive", productId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(sellerToken)))
                .andExpect(status().isOk());

        addItem(buyerToken, productId, 1)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Product 'Limited Product' is not available for ordering"));
    }

    @Test
    void checkoutCreatesOrderClearsCartAndDeductsStock() throws Exception {
        String sellerToken = register("seller-cart-checkout@example.com", "SELLER");
        String buyerToken = register("buyer-cart-checkout@example.com", "BUYER");
        UUID productId = createProduct(sellerToken, "Checkout Product", 25, 6);

        addItem(buyerToken, productId, 2)
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/cart/checkout")
                        .header(HttpHeaders.AUTHORIZATION, bearer(buyerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(checkoutPayload()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", not(blankOrNullString())))
                .andExpect(jsonPath("$.status").value("PENDING_PAYMENT"))
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.items[0].productId").value(productId.toString()))
                .andExpect(jsonPath("$.subtotal").value(50));

        mockMvc.perform(get("/api/cart")
                        .header(HttpHeaders.AUTHORIZATION, bearer(buyerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(0)))
                .andExpect(jsonPath("$.subtotal").value(0));

        mockMvc.perform(get("/api/products/{id}", productId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(sellerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stock").value(4));
    }

    @Test
    void emptyCartCannotCheckout() throws Exception {
        String buyerToken = register("buyer-empty-checkout@example.com", "BUYER");

        mockMvc.perform(post("/api/cart/checkout")
                        .header(HttpHeaders.AUTHORIZATION, bearer(buyerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(checkoutPayload()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Cannot checkout an empty cart"));
    }

    @Test
    void swaggerApiDocsIncludeCart() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/api/cart']").exists())
                .andExpect(jsonPath("$.paths['/api/cart/items']").exists())
                .andExpect(jsonPath("$.paths['/api/cart/items/{itemId}']").exists())
                .andExpect(jsonPath("$.paths['/api/cart/checkout']").exists());
    }

    private org.springframework.test.web.servlet.ResultActions addItem(String token, UUID productId, int quantity) throws Exception {
        return mockMvc.perform(post("/api/cart/items")
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "productId": "%s",
                          "quantity": %d
                        }
                        """.formatted(productId, quantity)));
    }

    private UUID addItemAndReturnItemId(String token, UUID productId, int quantity) throws Exception {
        MvcResult result = addItem(token, productId, quantity)
                .andExpect(status().isOk())
                .andReturn();
        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return UUID.fromString(json.get("items").get(0).get("id").asText());
    }

    private UUID createProduct(String token, String name, int price, int stock) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/products")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productPayload(name, price, stock)))
                .andExpect(status().isCreated())
                .andReturn();
        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return UUID.fromString(json.get("id").asText());
    }

    private String productPayload(String name, int price, int stock) {
        return """
                {
                  "name": "%s",
                  "description": "Fresh agricultural product",
                  "categoryId": "%s",
                  "price": %d,
                  "stock": %d,
                  "qualityGrade": "PREMIUM",
                  "unit": "KG",
                  "originProvince": "West Java",
                  "originCity": "Bandung",
                  "harvestDate": "2026-07-01",
                  "expirationDate": "2026-08-01",
                  "imageUrls": [
                    "https://example.com/products/1.jpg"
                  ]
                }
                """.formatted(name, category.getId(), price, stock);
    }

    private String checkoutPayload() {
        return """
                {
                  "paymentMethod": "BANK_TRANSFER",
                  "recipientName": "Buyer",
                  "recipientPhone": "08123456789",
                  "province": "West Java",
                  "city": "Bandung",
                  "district": "Coblong",
                  "postalCode": "40132",
                  "fullAddress": "Jl. Example No. 1",
                  "notes": "Deliver carefully"
                }
                """;
    }

    private String register(String email, String role) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Test User",
                                  "email": "%s",
                                  "password": "password123",
                                  "role": "%s"
                                }
                                """.formatted(email, role)))
                .andExpect(status().isCreated())
                .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString()).get("accessToken").asText();
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
