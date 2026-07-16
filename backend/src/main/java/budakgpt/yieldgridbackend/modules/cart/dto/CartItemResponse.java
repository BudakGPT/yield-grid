package budakgpt.yieldgridbackend.modules.cart.dto;

import java.math.BigDecimal;
import java.util.UUID;

import budakgpt.yieldgridbackend.modules.product.enums.QualityGrade;
import budakgpt.yieldgridbackend.modules.product.enums.Unit;

public record CartItemResponse(
        UUID id,
        UUID productId,
        String productName,
        String productImage,
        BigDecimal price,
        Integer quantity,
        BigDecimal subtotal,
        QualityGrade qualityGrade,
        Unit unit
) {
}
