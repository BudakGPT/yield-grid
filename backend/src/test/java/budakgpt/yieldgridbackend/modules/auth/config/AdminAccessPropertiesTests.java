package budakgpt.yieldgridbackend.modules.auth.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class AdminAccessPropertiesTests {
    @Test
    void matchesConfiguredEmailsCaseInsensitively() {
        AdminAccessProperties properties = new AdminAccessProperties("owner@example.com, OPS@example.com");

        assertThat(properties.contains("owner@example.com")).isTrue();
        assertThat(properties.contains("ops@example.com")).isTrue();
        assertThat(properties.contains("buyer@example.com")).isFalse();
    }
}
