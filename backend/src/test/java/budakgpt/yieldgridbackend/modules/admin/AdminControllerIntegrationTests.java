package budakgpt.yieldgridbackend.modules.admin;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import budakgpt.yieldgridbackend.modules.admin.repository.AdminAuditRepository;
import budakgpt.yieldgridbackend.modules.auth.entity.UserEntity;
import budakgpt.yieldgridbackend.modules.auth.enums.Role;
import budakgpt.yieldgridbackend.modules.auth.repository.UserRepository;
import budakgpt.yieldgridbackend.modules.auth.security.JwtService;
import budakgpt.yieldgridbackend.modules.cart.repository.CartRepository;
import budakgpt.yieldgridbackend.modules.order.repository.OrderRepository;
import budakgpt.yieldgridbackend.modules.product.repository.ProductCategoryRepository;
import budakgpt.yieldgridbackend.modules.product.repository.ProductRepository;
import budakgpt.yieldgridbackend.support.TestSupabaseAuthConfiguration;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestSupabaseAuthConfiguration.class)
class AdminControllerIntegrationTests {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private AdminAuditRepository auditRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ProductCategoryRepository categoryRepository;

    @BeforeEach
    void setUp() {
        auditRepository.deleteAll();
        orderRepository.deleteAll();
        cartRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void onlyAdministratorsCanOpenCentralControl() throws Exception {
        UserEntity admin = user("admin@example.com", Role.ADMIN);
        UserEntity buyer = user("buyer@example.com", Role.BUYER);

        mockMvc.perform(get("/api/admin/overview").header(HttpHeaders.AUTHORIZATION, bearer(buyer)))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/overview").header(HttpHeaders.AUTHORIZATION, bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.metrics.totalUsers").value(2))
                .andExpect(jsonPath("$.metrics.buyers").value(1))
                .andExpect(jsonPath("$.integrations").isArray());
    }

    @Test
    void administratorCanDisableAnotherAccountAndActionIsAudited() throws Exception {
        UserEntity admin = user("admin-control@example.com", Role.ADMIN);
        UserEntity buyer = user("buyer-control@example.com", Role.BUYER);

        mockMvc.perform(patch("/api/admin/users/{id}/status", buyer.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"enabled\": false }"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(false));

        mockMvc.perform(get("/api/admin/audit").header(HttpHeaders.AUTHORIZATION, bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].action").value("USER_DISABLED"))
                .andExpect(jsonPath("$.content[0].targetId").value(buyer.getId().toString()));
    }

    @Test
    void administratorCannotDisableOwnAccount() throws Exception {
        UserEntity admin = user("admin-self@example.com", Role.ADMIN);

        mockMvc.perform(patch("/api/admin/users/{id}/status", admin.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"enabled\": false }"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Administrators cannot disable their own account"));
    }

    @Test
    void swaggerDocumentsAdminMonitoringAndControls() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/api/admin/overview'].get").exists())
                .andExpect(jsonPath("$.paths['/api/admin/users'].get").exists())
                .andExpect(jsonPath("$.paths['/api/admin/users/{id}/status'].patch").exists())
                .andExpect(jsonPath("$.paths['/api/admin/orders/{id}/status'].patch").exists())
                .andExpect(jsonPath("$.paths['/api/admin/products/{id}/status'].patch").exists())
                .andExpect(jsonPath("$.paths['/api/admin/audit'].get").exists());
    }

    private UserEntity user(String email, Role role) {
        return userRepository.save(UserEntity.builder()
                .id(UUID.randomUUID())
                .fullName(role.name() + " User")
                .email(email)
                .role(role)
                .enabled(true)
                .emailVerified(true)
                .build());
    }

    private String bearer(UserEntity user) {
        return "Bearer " + jwtService.generateToken(user);
    }
}
