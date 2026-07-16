package budakgpt.yieldgridbackend.modules.grading.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import budakgpt.yieldgridbackend.config.OpenRouterProperties;
import budakgpt.yieldgridbackend.modules.grading.dto.VlmGradingResult;

class OpenRouterGradingClientTests {
    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Test
    void buildsMultimodalStrictSchemaRequestWithVisualCodexSubset() {
        OpenRouterGradingClient client = client();
        MockMultipartFile photo = new MockMultipartFile(
                "photo",
                "tomatoes.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "image-bytes".getBytes()
        );

        Map<String, Object> request = client.requestFor(photo, "tomato");
        JsonNode json = objectMapper.valueToTree(request);

        assertThat(json.path("model").asText()).isEqualTo("google/gemma-4-26b-a4b-it:free");
        assertThat(json.path("temperature").asInt()).isZero();
        assertThat(json.at("/provider/require_parameters").asBoolean()).isTrue();
        assertThat(json.at("/response_format/type").asText()).isEqualTo("json_schema");
        assertThat(json.at("/response_format/json_schema/strict").asBoolean()).isTrue();
        assertThat(json.at("/messages/1/content/1/image_url/url").asText())
                .startsWith("data:image/jpeg;base64,");

        String prompt = json.at("/messages/0/content").asText();
        assertThat(prompt)
                .contains("CXS 293-2008")
                .contains("not an official Codex inspection or certification")
                .contains("Never infer or claim firmness")
                .contains("YieldGrid operational thresholds")
                .contains("visual estimate rather than an expiry date");
    }

    @Test
    void parsesStructuredGradingContent() throws Exception {
        OpenRouterGradingClient client = client();
        String content = """
                {
                  "detected_produce_type": "tomato",
                  "matches_declared_produce": true,
                  "image_usable": true,
                  "grade_distribution": {"A": 0.68, "B": 0.27, "reject": 0.05},
                  "est_shelf_life": {
                    "band": "medium",
                    "approx_days": 5,
                    "basis": "breaker-stage colour under ambient storage; visual estimate, not an expiry date"
                  },
                  "defects_observed": ["minor bruising on about 8% of visible fruit"],
                  "model_confidence": "high"
                }
                """;
        JsonNode response = objectMapper.createObjectNode().set("choices", objectMapper.createArrayNode()
                .add(objectMapper.createObjectNode().set("message", objectMapper.createObjectNode().put("content", content))));

        VlmGradingResult result = client.parseResponse(response);

        assertThat(result.detectedProduceType()).isEqualTo("tomato");
        assertThat(result.gradeDistribution().a()).isEqualByComparingTo("0.68");
        assertThat(result.estShelfLife().approxDays()).isEqualTo(5);
        assertThat(result.defectsObserved()).hasSize(1);
    }

    @Test
    void bananaPromptDisclosesCodexScopeBoundary() {
        assertThat(GradingPrompt.forCrop("banana"))
                .contains("CXS 205-1997")
                .contains("written for green bananas")
                .contains("not to claim official certification of ripe fruit")
                .contains("visible flesh damage");
    }

    private OpenRouterGradingClient client() {
        OpenRouterProperties properties = new OpenRouterProperties(
                "test-api-key",
                "google/gemma-4-26b-a4b-it:free",
                "https://openrouter.ai/api/v1",
                Duration.ofSeconds(10),
                700,
                "http://localhost:3000",
                "YieldGrid Tests"
        );
        return new OpenRouterGradingClient(properties, RestClient.builder());
    }
}
