package budakgpt.yieldgridbackend.modules.order.dto;

import java.math.BigDecimal;
import java.util.UUID;

import budakgpt.yieldgridbackend.modules.product.enums.QualityGrade;

public record OrderItemResponse(
        UUID id,
        UUID productId,
        UUID sellerId,
        String sellerName,
        String productName,
        QualityGrade qualityGrade,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal
) {
}
