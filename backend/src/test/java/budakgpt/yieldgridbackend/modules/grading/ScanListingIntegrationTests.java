package budakgpt.yieldgridbackend.modules.grading;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import budakgpt.yieldgridbackend.support.TestSupabaseAuthConfiguration;
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import budakgpt.yieldgridbackend.modules.auth.repository.UserRepository;
import budakgpt.yieldgridbackend.modules.grading.repository.ProductGradingRepository;
import budakgpt.yieldgridbackend.modules.product.entity.ProductCategory;
import budakgpt.yieldgridbackend.modules.product.repository.ProductCategoryRepository;
import budakgpt.yieldgridbackend.modules.product.repository.ProductRepository;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestSupabaseAuthConfiguration.class)
class ScanListingIntegrationTests {
    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductGradingRepository gradingRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductCategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        cleanDatabase();
        categoryRepository.save(ProductCategory.builder()
                .name("Vegetables")
                .description("Fresh vegetables")
                .active(true)
                .build());
    }

    @AfterEach
    void tearDown() {
        cleanDatabase();
    }

    private void cleanDatabase() {
        gradingRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void farmerScanCreatesBuyerVisibleListingWithFrozenShape() throws Exception {
        String farmerToken = register("farmer-scan@example.com", "SELLER");
        String buyerToken = register("buyer-scan@example.com", "BUYER");
        MockMultipartFile photo = new MockMultipartFile(
                "photo",
                "crate.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "valid-demo-image-bytes".getBytes()
        );

        MvcResult scanResult = mockMvc.perform(multipart("/api/scans")
                        .file(photo)
                        .param("crate_count", "3")
                        .param("produce_type", "tomato")
                        .header(HttpHeaders.AUTHORIZATION, bearer(farmerToken)))
                .andExpect(status().isOk())
                .andExpect(header().string("X-YieldGrid-Grading-Source", "rehearsal-cache"))
                .andExpect(jsonPath("$.scan_id").isNotEmpty())
                .andExpect(jsonPath("$.crate_count").value(3))
                .andExpect(jsonPath("$.est_weight_kg").value(45))
                .andExpect(jsonPath("$.grade_distribution.A").value(0.70))
                .andExpect(jsonPath("$.est_shelf_life.band").value("medium"))
                .andReturn();
        JsonNode scan = objectMapper.readTree(scanResult.getResponse().getContentAsString());
        UUID scanId = UUID.fromString(scan.get("scan_id").asText());

        mockMvc.perform(post("/api/listings")
                        .header(HttpHeaders.AUTHORIZATION, bearer(farmerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "scan_id": "%s", "unit_price": 18000 }
                                """.formatted(scanId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.scan_id").value(scanId.toString()))
                .andExpect(jsonPath("$.suggested_segment").value("retail"))
                .andExpect(jsonPath("$.status").value("open"));

        mockMvc.perform(get("/api/listings")
                        .param("status", "open")
                        .header(HttpHeaders.AUTHORIZATION, bearer(buyerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].unit_price").value(18000))
                .andExpect(jsonPath("$[0].rubric_version").value("tomato-codex-cxs293-v1"));
    }

    private String register(String email, String role) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "%s Integration",
                                  "email": "%s",
                                  "password": "password123",
                                  "role": "%s"
                                }
                                """.formatted(role, email, role)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("accessToken").asText();
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
