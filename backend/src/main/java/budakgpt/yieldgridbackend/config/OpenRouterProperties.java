package budakgpt.yieldgridbackend.config;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.grading.openrouter")
public record OpenRouterProperties(
        String apiKey,
        String model,
        String baseUrl,
        Duration timeout,
        int maxTokens,
        String appUrl,
        String appName
) {
    public OpenRouterProperties {
        apiKey = apiKey == null ? "" : apiKey.trim();
        model = blankDefault(model, "google/gemma-4-26b-a4b-it:free");
        baseUrl = blankDefault(baseUrl, "https://openrouter.ai/api/v1");
        timeout = timeout == null || timeout.isZero() || timeout.isNegative() ? Duration.ofSeconds(10) : timeout;
        maxTokens = maxTokens <= 0 ? 700 : maxTokens;
        appUrl = blankDefault(appUrl, "http://localhost:3000");
        appName = blankDefault(appName, "YieldGrid");
    }

    public boolean configured() {
        return !apiKey.isBlank();
    }

    @Override
    public String toString() {
        return "OpenRouterProperties[apiKey=<redacted>, model=%s, baseUrl=%s, timeout=%s, maxTokens=%d, appUrl=%s, appName=%s]"
                .formatted(model, baseUrl, timeout, maxTokens, appUrl, appName);
    }

    private static String blankDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }
}
