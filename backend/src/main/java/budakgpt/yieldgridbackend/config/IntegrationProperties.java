package budakgpt.yieldgridbackend.config;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.integration")
public record IntegrationProperties(
        boolean sidecarEnabled,
        String sidecarUrl,
        String sidecarToken,
        Duration sidecarTimeout,
        String keyEncryptionSecret,
        String frontendOrigin
) {
}
