package budakgpt.yieldgridbackend.modules.auth.service;

import java.net.http.HttpClient;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import budakgpt.yieldgridbackend.modules.auth.config.SupabaseAuthProperties;
import budakgpt.yieldgridbackend.modules.auth.enums.Role;
import budakgpt.yieldgridbackend.modules.auth.exception.InvalidCredentialsException;
import budakgpt.yieldgridbackend.modules.auth.exception.SupabaseAuthException;
import budakgpt.yieldgridbackend.modules.auth.exception.UserAlreadyExistsException;

@Component
public class SupabaseAuthClient {
    private final SupabaseAuthProperties properties;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    public SupabaseAuthClient(SupabaseAuthProperties properties, RestClient.Builder builder) {
        this.properties = properties;
        this.objectMapper = new ObjectMapper().findAndRegisterModules();
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(properties.timeout())
                .build();
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(properties.timeout());
        String baseUrl = properties.configured() ? properties.url() : "http://localhost";
        this.restClient = builder
                .baseUrl(baseUrl)
                .requestFactory(requestFactory)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader("apikey", properties.publishableKey())
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + properties.publishableKey())
                .build();
    }

    public SupabaseIdentity signUp(String email, String password, String fullName, Role role) {
        requireConfigured();
        try {
            String response = restClient.post()
                    .uri("/auth/v1/signup")
                    .body(Map.of(
                            "email", email,
                            "password", password,
                            "data", Map.of(
                                    "full_name", fullName,
                                    "role", role.name()
                            )
                    ))
                    .retrieve()
                    .body(String.class);
            return parseIdentity(response);
        } catch (RestClientResponseException exception) {
            String message = providerMessage(exception.getResponseBodyAsString());
            if (message.toLowerCase().contains("already registered")
                    || message.toLowerCase().contains("already exists")) {
                throw new UserAlreadyExistsException(email);
            }
            throw new SupabaseAuthException("Supabase signup failed: " + message, exception);
        } catch (RestClientException exception) {
            throw new SupabaseAuthException("Supabase Auth is unavailable", exception);
        }
    }

    public SupabaseIdentity signIn(String email, String password) {
        requireConfigured();
        try {
            String response = restClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/auth/v1/token")
                            .queryParam("grant_type", "password")
                            .build())
                    .body(Map.of("email", email, "password", password))
                    .retrieve()
                    .body(String.class);
            return parseIdentity(response);
        } catch (RestClientResponseException exception) {
            if (exception.getStatusCode().is4xxClientError()) {
                throw new InvalidCredentialsException();
            }
            throw new SupabaseAuthException(
                    "Supabase login failed: " + providerMessage(exception.getResponseBodyAsString()),
                    exception
            );
        } catch (RestClientException exception) {
            throw new SupabaseAuthException("Supabase Auth is unavailable", exception);
        }
    }

    public boolean isConfigured() {
        return properties.configured();
    }

    SupabaseIdentity parseIdentity(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode user = root.path("user");
            if (!user.hasNonNull("id")) {
                user = root;
            }
            if (!user.hasNonNull("id") || !user.hasNonNull("email")) {
                throw new SupabaseAuthException("Supabase Auth returned no user identity");
            }
            boolean emailVerified = user.hasNonNull("email_confirmed_at")
                    || user.hasNonNull("confirmed_at");
            return new SupabaseIdentity(
                    UUID.fromString(user.path("id").asText()),
                    user.path("email").asText().trim().toLowerCase(),
                    emailVerified
            );
        } catch (JsonProcessingException | IllegalArgumentException exception) {
            throw new SupabaseAuthException("Supabase Auth returned an invalid user identity", exception);
        }
    }

    private String providerMessage(String responseBody) {
        try {
            JsonNode body = objectMapper.readTree(responseBody);
            for (String field : new String[]{"msg", "message", "error_description", "error"}) {
                if (body.hasNonNull(field)) {
                    return body.path(field).asText();
                }
            }
        } catch (JsonProcessingException ignored) {
            // Fall back to a stable message without leaking a provider response body.
        }
        return "provider request failed";
    }

    private void requireConfigured() {
        if (!properties.configured()) {
            throw new SupabaseAuthException(
                    "Supabase Auth is not configured; set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY"
            );
        }
    }

    public record SupabaseIdentity(UUID id, String email, boolean emailVerified) {
    }
}
