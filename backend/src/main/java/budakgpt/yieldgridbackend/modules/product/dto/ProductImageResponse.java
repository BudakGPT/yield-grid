package budakgpt.yieldgridbackend.modules.product.dto;

import java.util.UUID;

public record ProductImageResponse(
        UUID id,
        String imageUrl,
        Integer displayOrder
) {
}
