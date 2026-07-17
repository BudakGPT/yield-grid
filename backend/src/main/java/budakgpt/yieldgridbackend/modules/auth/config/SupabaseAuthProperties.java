package budakgpt.yieldgridbackend.modules.auth.config;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.auth.supabase")
public record SupabaseAuthProperties(
        String url,
        String publishableKey,
        Duration timeout
) {
    public SupabaseAuthProperties {
        url = trimTrailingSlash(url);
        publishableKey = publishableKey == null ? "" : publishableKey.trim();
        timeout = timeout == null ? Duration.ofSeconds(20) : timeout;
    }

    public boolean configured() {
        return !url.isBlank() && !publishableKey.isBlank();
    }

    private static String trimTrailingSlash(String value) {
        if (value == null) {
            return "";
        }
        String trimmed = value.trim();
        while (trimmed.endsWith("/")) {
            trimmed = trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed;
    }
}
