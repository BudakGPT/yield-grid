package budakgpt.yieldgridbackend.modules.listing.dto;

import java.math.BigDecimal;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record CreateListingRequest(
        @NotNull @JsonProperty("scan_id") UUID scanId,
        @NotNull @DecimalMin("1") @JsonProperty("unit_price") BigDecimal unitPrice
) {
}
