package budakgpt.yieldgridbackend.modules.grading.service;

import java.net.http.HttpClient;
import java.nio.file.Path;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.core.io.FileSystemResource;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import budakgpt.yieldgridbackend.config.PinataProperties;

@Component
public class PinataClient {
    private final PinataProperties properties;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;
    private final RestClient gatewayClient;

    public PinataClient(PinataProperties properties, RestClient.Builder builder) {
        this.properties = properties;
        this.objectMapper = new ObjectMapper().findAndRegisterModules();
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(properties.timeout())
                .build();
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(properties.timeout());
        this.restClient = builder
                .baseUrl(properties.baseUrl())
                .requestFactory(requestFactory)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + properties.jwt())
                .build();
        this.gatewayClient = RestClient.builder()
                .baseUrl(properties.gatewayUrl())
                .requestFactory(requestFactory)
                .build();
    }

    public String pinFile(Path photo, UUID scanId) {
        if (!properties.configured()) {
            throw new PinataException("Pinata is not configured; set PINATA_JWT");
        }
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new FileSystemResource(photo));
        body.add("pinataMetadata", writeJson(Map.of(
                "name", "yieldgrid-photo-" + scanId + fileExtension(photo)
        )));
        body.add("pinataOptions", "{\"cidVersion\":1}");
        try {
            String response = restClient.post()
                    .uri("/pinning/pinFileToIPFS")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(String.class);
            return parseCid(response);
        } catch (RestClientException exception) {
            throw new PinataException("Pinata photo upload failed", exception);
        }
    }

    public String pinJson(Map<String, Object> proof, UUID scanId, String rubricVersion, String produceType) {
        if (!properties.configured()) {
            throw new PinataException("Pinata is not configured; set PINATA_JWT");
        }
        Map<String, Object> request = Map.of(
                "pinataContent", proof,
                "pinataMetadata", Map.of(
                        "name", "yieldgrid-grading-" + scanId + ".json",
                        "keyvalues", Map.of(
                                "scan_id", scanId.toString(),
                                "rubric_version", rubricVersion,
                                "produce_type", produceType
                        )
                )
        );
        try {
            String response = restClient.post()
                    .uri("/pinning/pinJSONToIPFS")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(String.class);
            return parseCid(response);
        } catch (RestClientException exception) {
            throw new PinataException("Pinata upload failed", exception);
        }
    }

    public boolean isConfigured() {
        return properties.configured();
    }

    public String gatewayUrl(String cid) {
        return properties.gatewayUrl() + "/" + cid;
    }

    public String photoCidFromProof(String proofCid) {
        try {
            String response = gatewayClient.get()
                    .uri("/{cid}", proofCid)
                    .retrieve()
                    .body(String.class);
            if (response == null || response.isBlank()) {
                throw new PinataException("IPFS proof is empty");
            }
            String photoCid = objectMapper.readTree(response).path("photo").path("cid").asText();
            if (photoCid.isBlank()) {
                throw new PinataException("IPFS proof contains no photo CID");
            }
            return photoCid;
        } catch (RestClientException | JsonProcessingException exception) {
            throw new PinataException("Could not resolve the photo from its IPFS proof", exception);
        }
    }

    String parseCid(String response) {
        if (response == null || response.isBlank()) {
            throw new PinataException("Pinata returned an empty response");
        }
        try {
            JsonNode body = objectMapper.readTree(response);
            String cid = body.path("IpfsHash").asText();
            if (cid.isBlank()) {
                throw new PinataException("Pinata returned no IPFS CID");
            }
            return cid;
        } catch (JsonProcessingException exception) {
            throw new PinataException("Pinata returned invalid response JSON", exception);
        }
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new PinataException("Could not serialize Pinata metadata", exception);
        }
    }

    private String fileExtension(Path path) {
        String name = path.getFileName().toString();
        int dot = name.lastIndexOf('.');
        return dot < 0 ? "" : name.substring(dot);
    }
}
