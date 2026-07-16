package budakgpt.yieldgridbackend.modules.product;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.blankOrNullString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
class ProductControllerIntegrationTests {

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

    private ProductCategory vegetables;

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();
        vegetables = categoryRepository.save(ProductCategory.builder()
                .name("Vegetables")
                .description("Fresh vegetables")
                .active(true)
                .build());
    }

    @Test
    void sellerCanCreateProductAndBuyerCanBrowse() throws Exception {
        String sellerToken = register("seller-create@example.com", "SELLER");
        String buyerToken = register("buyer-browse@example.com", "BUYER");

        UUID productId = createProduct(sellerToken, "Organic Rice", 25, 120);

        mockMvc.perform(get("/api/products/{id}", productId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(buyerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(productId.toString()))
                .andExpect(jsonPath("$.name").value("Organic Rice"))
                .andExpect(jsonPath("$.category.name").value("Vegetables"))
                .andExpect(jsonPath("$.images", hasSize(2)));
    }

    @Test
    void buyerCannotCreateProduct() throws Exception {
        String buyerToken = register("buyer-create@example.com", "BUYER");

        mockMvc.perform(post("/api/products")
                        .header(HttpHeaders.AUTHORIZATION, bearer(buyerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productPayload("Buyer Product", 10, 1)))
                .andExpect(status().isForbidden());
    }

    @Test
    void sellerCannotUpdateAnotherSellerProduct() throws Exception {
        String ownerToken = register("seller-owner@example.com", "SELLER");
        String otherSellerToken = register("seller-other@example.com", "SELLER");
        UUID productId = createProduct(ownerToken, "Owner Product", 15, 10);

        mockMvc.perform(put("/api/products/{id}", productId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(otherSellerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Hijacked Product"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("You are not allowed to manage this product"));
    }

    @Test
    void adminCanUpdateAnyProduct() throws Exception {
        String sellerToken = register("seller-admin-update@example.com", "SELLER");
        String adminToken = register("admin-update@example.com", "ADMIN");
        UUID productId = createProduct(sellerToken, "Seller Product", 15, 10);

        mockMvc.perform(put("/api/products/{id}", productId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Admin Updated Product",
                                  "stock": 5
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Admin Updated Product"))
                .andExpect(jsonPath("$.stock").value(5));
    }

    @Test
    void archivedProductHiddenFromBuyerButVisibleToAdmin() throws Exception {
        String sellerToken = register("seller-archive@example.com", "SELLER");
        String buyerToken = register("buyer-archive@example.com", "BUYER");
        String adminToken = register("admin-archive@example.com", "ADMIN");
        UUID productId = createProduct(sellerToken, "Archived Product", 20, 4);

        mockMvc.perform(patch("/api/products/{id}/archive", productId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(sellerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ARCHIVED"));

        mockMvc.perform(get("/api/products/{id}", productId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(buyerToken)))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/products/{id}", productId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ARCHIVED"));
    }

    @Test
    void searchSupportsKeywordAndPriceFilters() throws Exception {
        String sellerToken = register("seller-search@example.com", "SELLER");
        String buyerToken = register("buyer-search@example.com", "BUYER");
        createProduct(sellerToken, "Premium Corn", 30, 7);
        createProduct(sellerToken, "Budget Corn", 5, 8);

        mockMvc.perform(get("/api/products/search")
                        .header(HttpHeaders.AUTHORIZATION, bearer(buyerToken))
                        .param("keyword", "corn")
                        .param("minimumPrice", "20")
                        .param("sort", "price,desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].name").value("Premium Corn"));
    }

    @Test
    void invalidStockIsRejected() throws Exception {
        String sellerToken = register("seller-validation@example.com", "SELLER");

        mockMvc.perform(post("/api/products")
                        .header(HttpHeaders.AUTHORIZATION, bearer(sellerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productPayload("Bad Stock", 5, -1)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.validationErrors.stock").exists());
    }

    @Test
    void swaggerApiDocsIncludeProducts() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/api/products']").exists())
                .andExpect(jsonPath("$.paths['/api/categories']").exists())
                .andExpect(jsonPath("$.paths['/api/v1/analytics/health']").doesNotExist())
                .andExpect(jsonPath("$.paths['/api/v1/blockchain/health']").doesNotExist())
                .andExpect(jsonPath("$.paths['/api/v1/farmer/health']").doesNotExist())
                .andExpect(jsonPath("$.paths['/api/v1/harvest/health']").doesNotExist())
                .andExpect(jsonPath("$.paths['/api/v1/inspection/health']").doesNotExist())
                .andExpect(jsonPath("$.paths['/api/v1/marketplace/health']").doesNotExist())
                .andExpect(jsonPath("$.paths['/api/v1/notification/health']").doesNotExist())
                .andExpect(jsonPath("$.paths['/api/v1/shipment/health']").doesNotExist())
                .andExpect(jsonPath("$.paths['/api/v1/user/health']").doesNotExist());
    }

    private UUID createProduct(String token, String name, int price, int stock) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/products")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productPayload(name, price, stock)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", not(blankOrNullString())))
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
                    "https://example.com/products/1.jpg",
                    "https://example.com/products/2.jpg"
                  ]
                }
                """.formatted(name, vegetables.getId(), price, stock);
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
