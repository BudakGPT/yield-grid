package budakgpt.yieldgridbackend.modules.product.dto;

import budakgpt.yieldgridbackend.modules.product.enums.ProductStatus;
import jakarta.validation.constraints.NotNull;

public record ChangeStatusRequest(
        @NotNull(message = "Status is required")
        ProductStatus status
) {
}
