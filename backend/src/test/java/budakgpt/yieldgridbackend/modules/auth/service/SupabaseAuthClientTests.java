package budakgpt.yieldgridbackend.modules.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Duration;

import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import budakgpt.yieldgridbackend.modules.auth.config.SupabaseAuthProperties;
import budakgpt.yieldgridbackend.modules.auth.exception.SupabaseAuthException;

class SupabaseAuthClientTests {
    private final SupabaseAuthClient client = new SupabaseAuthClient(
            new SupabaseAuthProperties(
                    "https://project.supabase.co/",
                    "test-publishable-key",
                    Duration.ofSeconds(5)
            ),
            RestClient.builder()
    );

    @Test
    void parsesSupabaseSessionIdentity() {
        SupabaseAuthClient.SupabaseIdentity identity = client.parseIdentity("""
                {
                  "access_token": "redacted",
                  "user": {
                    "id": "73b89dc4-f84d-4d42-b67d-61e34d762ee9",
                    "email": "FARMER@EXAMPLE.COM",
                    "email_confirmed_at": "2026-07-17T00:00:00Z"
                  }
                }
                """);

        assertThat(identity.id().toString()).isEqualTo("73b89dc4-f84d-4d42-b67d-61e34d762ee9");
        assertThat(identity.email()).isEqualTo("farmer@example.com");
        assertThat(identity.emailVerified()).isTrue();
    }

    @Test
    void rejectsResponseWithoutSupabaseUserId() {
        assertThatThrownBy(() -> client.parseIdentity("{\"user\":{\"email\":\"farmer@example.com\"}}"))
                .isInstanceOf(SupabaseAuthException.class)
                .hasMessageContaining("no user identity");
    }
}
