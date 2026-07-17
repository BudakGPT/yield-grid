package budakgpt.yieldgridbackend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.integration")
public record IntegrationProperties(
        boolean sidecarEnabled,
        String sidecarUrl,
        String sidecarToken,
        String keyEncryptionSecret,
        String frontendOrigin
) {
}
