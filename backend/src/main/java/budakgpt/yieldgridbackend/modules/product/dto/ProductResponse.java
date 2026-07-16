package budakgpt.yieldgridbackend.modules.product.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import budakgpt.yieldgridbackend.modules.product.enums.ProductStatus;
import budakgpt.yieldgridbackend.modules.product.enums.QualityGrade;
import budakgpt.yieldgridbackend.modules.product.enums.Unit;

public record ProductResponse(
        UUID id,
        UUID sellerId,
        String sellerName,
        CategoryResponse category,
        String name,
        String description,
        BigDecimal price,
        Integer stock,
        QualityGrade qualityGrade,
        Unit unit,
        String originProvince,
        String originCity,
        LocalDate harvestDate,
        LocalDate expirationDate,
        ProductStatus status,
        List<ProductImageResponse> images,
        Instant createdAt,
        Instant updatedAt
) {
}
