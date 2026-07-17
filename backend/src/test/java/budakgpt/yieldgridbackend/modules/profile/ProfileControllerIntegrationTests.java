package budakgpt.yieldgridbackend.modules.profile;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import budakgpt.yieldgridbackend.modules.auth.repository.UserRepository;
import budakgpt.yieldgridbackend.modules.cart.repository.CartRepository;
import budakgpt.yieldgridbackend.modules.order.repository.OrderRepository;
import budakgpt.yieldgridbackend.modules.product.repository.ProductCategoryRepository;
import budakgpt.yieldgridbackend.modules.product.repository.ProductRepository;
import budakgpt.yieldgridbackend.support.TestSupabaseAuthConfiguration;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestSupabaseAuthConfiguration.class)
class ProfileControllerIntegrationTests {
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

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
        cartRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void profileRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/profile/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Authentication is required"));
    }

    @Test
    void getsAndUpdatesCurrentProfileWithoutChangingIdentityFields() throws Exception {
        String token = registerSeller("profile@example.com");

        mockMvc.perform(get("/api/profile/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Farmer One"))
                .andExpect(jsonPath("$.email").value("profile@example.com"))
                .andExpect(jsonPath("$.role").value("SELLER"));

        mockMvc.perform(patch("/api/profile/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Farmer Updated",
                                  "phoneNumber": "+62 812 3456 7890",
                                  "location": "Bogor, West Java",
                                  "deliveryRecipientName": "Buyer Receiving",
                                  "deliveryPhoneNumber": "+62 811 0000 1111",
                                  "deliveryProvince": "West Java",
                                  "deliveryCity": "Bogor",
                                  "deliveryDistrict": "Cibinong",
                                  "deliveryPostalCode": "16911",
                                  "deliveryAddress": "Jl. Delivery No. 1",
                                  "deliveryNotes": "Call before arrival",
                                  "bio": "Smallholder tomato farmer",
                                  "avatarUrl": "https://images.example.com/farmer.jpg"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Farmer Updated"))
                .andExpect(jsonPath("$.phoneNumber").value("+62 812 3456 7890"))
                .andExpect(jsonPath("$.location").value("Bogor, West Java"))
                .andExpect(jsonPath("$.deliveryRecipientName").value("Buyer Receiving"))
                .andExpect(jsonPath("$.deliveryCity").value("Bogor"))
                .andExpect(jsonPath("$.deliveryAddress").value("Jl. Delivery No. 1"))
                .andExpect(jsonPath("$.bio").value("Smallholder tomato farmer"))
                .andExpect(jsonPath("$.email").value("profile@example.com"))
                .andExpect(jsonPath("$.role").value("SELLER"));

        mockMvc.perform(get("/api/profile/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Farmer Updated"))
                .andExpect(jsonPath("$.location").value("Bogor, West Java"))
                .andExpect(jsonPath("$.deliveryPostalCode").value("16911"));
    }

    @Test
    void rejectsInvalidProfileDetails() throws Exception {
        String token = registerSeller("invalid-profile@example.com");

        mockMvc.perform(patch("/api/profile/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": " ",
                                  "phoneNumber": "invalid",
                                  "avatarUrl": "ftp://example.com/avatar.jpg"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.validationErrors.fullName").exists())
                .andExpect(jsonPath("$.validationErrors.phoneNumber").exists())
                .andExpect(jsonPath("$.validationErrors.avatarUrl").exists());
    }

    @Test
    void openApiDocumentsProfileOperations() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.info.title").value("YieldGrid Backend API"))
                .andExpect(jsonPath("$.paths['/api/profile/me'].get").exists())
                .andExpect(jsonPath("$.paths['/api/profile/me'].patch").exists())
                .andExpect(jsonPath("$.paths['/api/profile/me/wallet'].post").exists());
    }

    @Test
    void walletSetupExplainsWhenSettlementServiceIsDisabled() throws Exception {
        String token = registerSeller("wallet-profile@example.com");

        mockMvc.perform(post("/api/profile/me/wallet")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.message").value(
                        "Payment setup is unavailable; start the settlement sidecar and enable SIDECAR_ENABLED"
                ));
    }

    private String registerSeller(String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Farmer One",
                                  "email": "%s",
                                  "password": "password123",
                                  "role": "SELLER"
                                }
                                """.formatted(email)))
                .andExpect(status().isCreated())
                .andReturn();

        return result.getResponse().getContentAsString()
                .replaceAll(".*\\\"accessToken\\\":\\\"([^\\\"]+)\\\".*", "$1");
    }
}
