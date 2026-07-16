package budakgpt.yieldgridbackend.modules.stellar;

import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import budakgpt.yieldgridbackend.config.IntegrationProperties;

@Component
public class SidecarClient {
    private final IntegrationProperties properties;
    private final RestClient restClient;

    public SidecarClient(IntegrationProperties properties, RestClient.Builder builder) {
        this.properties = properties;
        this.restClient = builder
                .baseUrl(properties.sidecarUrl())
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + properties.sidecarToken())
                .build();
    }

    public boolean isEnabled() {
        return properties.sidecarEnabled();
    }

    public ProvisionResponse provision(String role) {
        return post("/provision", Map.of("role", role), ProvisionResponse.class);
    }

    public String sign(String secret, String payload) {
        return post("/sign", Map.of("secret", secret, "payload", payload), SignatureResponse.class).signature();
    }

    public String createEscrow(UUID orderId, String buyerSecret, String farmerPublicKey, String amountBaseUnits) {
        return post("/escrow/create", Map.of(
                "orderId", orderId.toString(),
                "buyerSecret", buyerSecret,
                "farmerPublicKey", farmerPublicKey,
                "amountBaseUnits", amountBaseUnits
        ), HashResponse.class).hash();
    }

    public String confirmEscrow(UUID orderId) {
        return post("/escrow/confirm", Map.of("orderId", orderId.toString()), HashResponse.class).hash();
    }

    public String settleEscrow(UUID orderId, int discountBps) {
        return post("/escrow/settle", Map.of(
                "orderId", orderId.toString(),
                "discountBps", discountBps
        ), HashResponse.class).hash();
    }

    public String mint(String publicKey, String rupiah) {
        return post("/mint", Map.of("publicKey", publicKey, "rupiah", rupiah), HashResponse.class).hash();
    }

    public HealthResponse health() {
        try {
            HealthResponse response = restClient.get().uri("/health").retrieve().body(HealthResponse.class);
            return response == null ? HealthResponse.unavailable() : response;
        } catch (RestClientException exception) {
            return HealthResponse.unavailable();
        }
    }

    private <T> T post(String path, Object body, Class<T> responseType) {
        requireEnabled();
        try {
            T response = restClient.post().uri(path).body(body).retrieve().body(responseType);
            if (response == null) {
                throw new SidecarUnavailableException("Settlement sidecar returned an empty response");
            }
            return response;
        } catch (RestClientException exception) {
            throw new SidecarUnavailableException("Settlement sidecar call failed", exception);
        }
    }

    private void requireEnabled() {
        if (!properties.sidecarEnabled()) {
            throw new SidecarUnavailableException("Stellar settlement is not configured; set SIDECAR_ENABLED=true");
        }
    }

    public record ProvisionResponse(String publicKey, String secret, String role, String mintedRupiah) {
    }

    public record HashResponse(String hash) {
    }

    public record SignatureResponse(String signature) {
    }

    public record HealthResponse(String status, String rpcStatus, Boolean configured, String escrowContractId,
                                 String ygidrSacAddress, String adminYgidrBalance) {
        public static HealthResponse unavailable() {
            return new HealthResponse("unavailable", "unavailable", false, null, null, null);
        }
    }
}
