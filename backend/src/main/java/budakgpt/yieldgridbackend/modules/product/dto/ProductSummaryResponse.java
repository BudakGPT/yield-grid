package budakgpt.yieldgridbackend.modules.product.dto;

import java.math.BigDecimal;
import java.util.UUID;

import budakgpt.yieldgridbackend.modules.product.enums.ProductStatus;
import budakgpt.yieldgridbackend.modules.product.enums.QualityGrade;
import budakgpt.yieldgridbackend.modules.product.enums.Unit;

public record ProductSummaryResponse(
        UUID id,
        String name,
        BigDecimal price,
        Integer stock,
        QualityGrade qualityGrade,
        Unit unit,
        ProductStatus status,
        CategoryResponse category,
        String primaryImageUrl,
        UUID sellerId,
        String sellerName
) {
}
