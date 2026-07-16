package budakgpt.yieldgridbackend.modules.product.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import budakgpt.yieldgridbackend.modules.product.enums.ProductStatus;
import budakgpt.yieldgridbackend.modules.product.enums.QualityGrade;
import budakgpt.yieldgridbackend.modules.product.enums.Unit;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record UpdateProductRequest(
        @Size(max = 150, message = "Name must not exceed 150 characters")
        String name,

        @Size(max = 3000, message = "Description must not exceed 3000 characters")
        String description,

        UUID categoryId,

        @DecimalMin(value = "0.00", message = "Price cannot be negative")
        BigDecimal price,

        @Min(value = 0, message = "Stock cannot be negative")
        Integer stock,

        QualityGrade qualityGrade,

        Unit unit,

        @Size(max = 120, message = "Origin province must not exceed 120 characters")
        String originProvince,

        @Size(max = 120, message = "Origin city must not exceed 120 characters")
        String originCity,

        LocalDate harvestDate,

        LocalDate expirationDate,

        ProductStatus status,

        List<@Size(max = 2048) String> imageUrls
) {
    @AssertTrue(message = "Expiration date must not be before harvest date")
    public boolean isExpirationDateValid() {
        return harvestDate == null || expirationDate == null || !expirationDate.isBefore(harvestDate);
    }
}
