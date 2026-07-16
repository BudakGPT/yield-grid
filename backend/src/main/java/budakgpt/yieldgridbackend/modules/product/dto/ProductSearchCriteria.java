package budakgpt.yieldgridbackend.modules.product.dto;

import java.math.BigDecimal;
import java.util.UUID;

import budakgpt.yieldgridbackend.modules.product.enums.ProductStatus;
import budakgpt.yieldgridbackend.modules.product.enums.QualityGrade;

public record ProductSearchCriteria(
        String keyword,
        UUID category,
        QualityGrade qualityGrade,
        BigDecimal minimumPrice,
        BigDecimal maximumPrice,
        UUID seller,
        ProductStatus status,
        boolean includeArchived
) {
}
