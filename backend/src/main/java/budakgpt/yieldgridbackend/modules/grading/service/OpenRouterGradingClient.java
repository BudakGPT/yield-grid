package budakgpt.yieldgridbackend.modules.grading.service;

import java.io.IOException;
import java.net.http.HttpClient;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import budakgpt.yieldgridbackend.config.OpenRouterProperties;
import budakgpt.yieldgridbackend.modules.grading.dto.VlmGradingResult;

@Component
public class OpenRouterGradingClient {
    private final OpenRouterProperties properties;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    public OpenRouterGradingClient(
            OpenRouterProperties properties,
            RestClient.Builder builder
    ) {
        this.properties = properties;
        this.objectMapper = new ObjectMapper().findAndRegisterModules();
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(properties.timeout())
                .build();
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(properties.timeout());
        RestClient.Builder configuredBuilder = builder
                .baseUrl(properties.baseUrl())
                .requestFactory(requestFactory)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + properties.apiKey())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader("HTTP-Referer", properties.appUrl())
                .defaultHeader("X-OpenRouter-Title", properties.appName());
        this.restClient = configuredBuilder.build();
    }

    public boolean isConfigured() {
        return properties.configured();
    }

    public String model() {
        return properties.model();
    }

    public VlmGradingResult grade(MultipartFile photo, String crop) {
        if (!isConfigured()) {
            throw new IllegalStateException("OpenRouter is not configured; set OPENROUTER_API_KEY");
        }
        try {
            String responseBody = restClient.post()
                    .uri("/chat/completions")
                    .body(requestFor(photo, crop))
                    .retrieve()
                    .body(String.class);
            return parseResponse(responseBody);
        } catch (RestClientException exception) {
            throw new OpenRouterGradingException("OpenRouter request failed", exception);
        }
    }

    Map<String, Object> requestFor(MultipartFile photo, String crop) {
        try {
            String imageUrl = "data:%s;base64,%s".formatted(
                    photo.getContentType(),
                    Base64.getEncoder().encodeToString(photo.getBytes())
            );
            List<Map<String, Object>> userContent = List.of(
                    Map.of(
                            "type", "text",
                            "text", "Assess this crate photo. The farmer declared produce_type as '%s'.".formatted(crop)
                    ),
                    Map.of(
                            "type", "image_url",
                            "image_url", Map.of("url", imageUrl, "detail", "high")
                    )
            );
            List<Map<String, Object>> messages = List.of(
                    Map.of("role", "system", "content", GradingPrompt.forCrop(crop)),
                    Map.of("role", "user", "content", userContent)
            );
            Map<String, Object> request = new LinkedHashMap<>();
            request.put("model", properties.model());
            request.put("messages", messages);
            request.put("temperature", 0);
            request.put("max_tokens", properties.maxTokens());
            request.put("stream", false);
            request.put("provider", Map.of("require_parameters", true));
            request.put("response_format", Map.of(
                    "type", "json_schema",
                    "json_schema", Map.of(
                            "name", "yieldgrid_visual_grading",
                            "strict", true,
                            "schema", gradingSchema()
                    )
            ));
            return request;
        } catch (IOException exception) {
            throw new OpenRouterGradingException("Could not read the grading image", exception);
        }
    }

    VlmGradingResult parseResponse(String responseBody) {
        if (responseBody == null || responseBody.isBlank()) {
            throw new OpenRouterGradingException("OpenRouter returned an empty response");
        }
        JsonNode response;
        try {
            response = objectMapper.readTree(responseBody);
        } catch (JsonProcessingException exception) {
            throw new OpenRouterGradingException("OpenRouter returned invalid response JSON", exception);
        }
        JsonNode content = response == null ? null : response.at("/choices/0/message/content");
        if (content == null || !content.isTextual() || content.asText().isBlank()) {
            throw new OpenRouterGradingException("OpenRouter returned no structured grading content");
        }
        try {
            return objectMapper.readValue(content.asText(), VlmGradingResult.class);
        } catch (JsonProcessingException exception) {
            throw new OpenRouterGradingException("OpenRouter returned invalid grading JSON", exception);
        }
    }

    private Map<String, Object> gradingSchema() {
        Map<String, Object> gradeA = Map.of(
                "type", "number",
                "minimum", 0,
                "maximum", 1,
                "description", "Fraction of visible fruit meeting YieldGrid A, mapped to Codex Extra or Class I"
        );
        Map<String, Object> gradeB = Map.of(
                "type", "number",
                "minimum", 0,
                "maximum", 1,
                "description", "Fraction of visible fruit meeting YieldGrid B, mapped to Codex Class II"
        );
        Map<String, Object> gradeReject = Map.of(
                "type", "number",
                "minimum", 0,
                "maximum", 1,
                "description", "Fraction of visible fruit failing the visually assessable minimum requirements"
        );
        Map<String, Object> gradeDistribution = Map.of(
                "type", "object",
                "properties", Map.of(
                        "A", gradeA,
                        "B", gradeB,
                        "reject", gradeReject
                ),
                "required", List.of("A", "B", "reject"),
                "additionalProperties", false
        );
        Map<String, Object> shelfLife = Map.of(
                "type", "object",
                "properties", Map.of(
                        "band", Map.of(
                                "type", "string",
                                "enum", List.of("short", "medium", "long"),
                                "description", "Shelf-life band inferred only from visible ripeness"
                        ),
                        "approx_days", Map.of(
                                "type", "integer",
                                "minimum", 1,
                                "maximum", 30,
                                "description", "Approximate ambient-storage days, never a precise expiry"
                        ),
                        "basis", Map.of(
                                "type", "string",
                                "minLength", 1,
                                "maxLength", 500,
                                "description", "One line naming the visible ripeness stage and visual-estimate limitation"
                        )
                ),
                "required", List.of("band", "approx_days", "basis"),
                "additionalProperties", false
        );
        Map<String, Object> propertiesSchema = new LinkedHashMap<>();
        propertiesSchema.put("detected_produce_type", Map.of(
                "type", "string",
                "minLength", 1,
                "maxLength", 40,
                "description", "Produce type visibly present in the image"
        ));
        propertiesSchema.put("matches_declared_produce", Map.of(
                "type", "boolean",
                "description", "Whether the visible produce matches the farmer-declared crop"
        ));
        propertiesSchema.put("image_usable", Map.of(
                "type", "boolean",
                "description", "Whether focus, lighting, and crate coverage permit visual grading"
        ));
        propertiesSchema.put("grade_distribution", gradeDistribution);
        propertiesSchema.put("est_shelf_life", shelfLife);
        propertiesSchema.put("defects_observed", Map.of(
                "type", "array",
                "items", Map.of("type", "string", "minLength", 1, "maxLength", 240),
                "minItems", 1,
                "maxItems", 8,
                "description", "Visible defects only, each with an approximate extent"
        ));
        propertiesSchema.put("model_confidence", Map.of(
                "type", "string",
                "enum", List.of("low", "medium", "high"),
                "description", "Confidence based on image coverage, focus, and lighting"
        ));
        return Map.of(
                "type", "object",
                "properties", propertiesSchema,
                "required", List.copyOf(propertiesSchema.keySet()),
                "additionalProperties", false
        );
    }
}
