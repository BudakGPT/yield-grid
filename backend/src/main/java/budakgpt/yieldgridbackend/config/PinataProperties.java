package budakgpt.yieldgridbackend.config;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.storage.pinata")
public record PinataProperties(
        String jwt,
        String baseUrl,
        String gatewayUrl,
        Duration timeout
) {
    public PinataProperties {
        jwt = jwt == null ? "" : jwt.trim();
        baseUrl = trailingSlashRemoved(baseUrl, "https://api.pinata.cloud");
        gatewayUrl = trailingSlashRemoved(gatewayUrl, "https://gateway.pinata.cloud/ipfs");
        timeout = timeout == null ? Duration.ofSeconds(30) : timeout;
    }

    public boolean configured() {
        return !jwt.isBlank();
    }

    private static String trailingSlashRemoved(String value, String fallback) {
        String result = value == null || value.isBlank() ? fallback : value.trim();
        while (result.endsWith("/")) {
            result = result.substring(0, result.length() - 1);
        }
        return result;
    }
}
