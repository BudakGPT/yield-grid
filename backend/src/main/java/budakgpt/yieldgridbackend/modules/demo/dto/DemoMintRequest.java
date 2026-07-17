package budakgpt.yieldgridbackend.modules.demo.dto;

import java.math.BigDecimal;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record DemoMintRequest(
        String address,
        @JsonProperty("user_id") UUID userId,
        @NotNull @DecimalMin("1") BigDecimal amount
) {
}
