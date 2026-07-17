package budakgpt.yieldgridbackend.support;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

import budakgpt.yieldgridbackend.modules.auth.exception.InvalidCredentialsException;
import budakgpt.yieldgridbackend.modules.auth.service.SupabaseAuthClient;
import budakgpt.yieldgridbackend.modules.auth.service.SupabaseAuthClient.SupabaseIdentity;
import budakgpt.yieldgridbackend.modules.stellar.SidecarClient;

@TestConfiguration(proxyBeanMethods = false)
public class TestSupabaseAuthConfiguration {
    @Bean
    @Primary
    SupabaseAuthClient testSupabaseAuthClient() {
        SupabaseAuthClient client = mock(SupabaseAuthClient.class);
        when(client.signUp(any(), any(), any(), any())).thenAnswer(invocation -> identity(invocation.getArgument(0)));
        when(client.signIn(any(), any())).thenAnswer(invocation -> {
            String password = invocation.getArgument(1);
            if ("bad-password".equals(password)) {
                throw new InvalidCredentialsException();
            }
            return identity(invocation.getArgument(0));
        });
        when(client.isConfigured()).thenReturn(true);
        return client;
    }

    @Bean
    @Primary
    SidecarClient testSidecarClient() {
        SidecarClient client = mock(SidecarClient.class);
        when(client.isEnabled()).thenReturn(false);
        when(client.health()).thenReturn(SidecarClient.HealthResponse.unavailable());
        return client;
    }

    private SupabaseIdentity identity(String email) {
        UUID id = UUID.nameUUIDFromBytes(email.getBytes(StandardCharsets.UTF_8));
        return new SupabaseIdentity(id, email.toLowerCase(), false);
    }
}
