package budakgpt.yieldgridbackend.modules.auth.config;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.auth.admin")
public record AdminAccessProperties(String emails) {
    public boolean contains(String email) {
        if (email == null || emails == null || emails.isBlank()) {
            return false;
        }
        Set<String> allowed = Arrays.stream(emails.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(value -> !value.isBlank())
                .collect(Collectors.toSet());
        return allowed.contains(email.trim().toLowerCase());
    }
}
