package budakgpt.yieldgridbackend.modules.grading.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Duration;

import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import budakgpt.yieldgridbackend.config.PinataProperties;

class PinataClientTests {
    private final PinataClient client = new PinataClient(
            new PinataProperties(
                    "test-jwt",
                    "https://api.pinata.cloud",
                    "https://gateway.pinata.cloud/ipfs",
                    Duration.ofSeconds(30)
            ),
            RestClient.builder()
    );

    @Test
    void parsesPinataIpfsHash() {
        assertThat(client.parseCid("{\"IpfsHash\":\"bafybeigdyrzt\"}"))
                .isEqualTo("bafybeigdyrzt");
        assertThat(client.gatewayUrl("bafybeigdyrzt"))
                .isEqualTo("https://gateway.pinata.cloud/ipfs/bafybeigdyrzt");
    }

    @Test
    void rejectsPinataResponseWithoutCid() {
        assertThatThrownBy(() -> client.parseCid("{}"))
                .isInstanceOf(PinataException.class)
                .hasMessageContaining("no IPFS CID");
    }
}
