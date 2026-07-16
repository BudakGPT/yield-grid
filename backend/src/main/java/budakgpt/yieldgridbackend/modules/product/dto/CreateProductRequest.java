package budakgpt.yieldgridbackend.modules.product.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import budakgpt.yieldgridbackend.modules.product.enums.QualityGrade;
import budakgpt.yieldgridbackend.modules.product.enums.Unit;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateProductRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 150, message = "Name must not exceed 150 characters")
        String name,

        @Size(max = 3000, message = "Description must not exceed 3000 characters")
        String description,

        @NotNull(message = "Category is required")
        UUID categoryId,

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.00", message = "Price cannot be negative")
        BigDecimal price,

        @NotNull(message = "Stock is required")
        @Min(value = 0, message = "Stock cannot be negative")
        Integer stock,

        @NotNull(message = "Quality grade is required")
        QualityGrade qualityGrade,

        @NotNull(message = "Unit is required")
        Unit unit,

        @Size(max = 120, message = "Origin province must not exceed 120 characters")
        String originProvince,

        @Size(max = 120, message = "Origin city must not exceed 120 characters")
        String originCity,

        LocalDate harvestDate,

        LocalDate expirationDate,

        List<@NotBlank @Size(max = 2048) String> imageUrls
) {
    @AssertTrue(message = "Expiration date must not be before harvest date")
    public boolean isExpirationDateValid() {
        return harvestDate == null || expirationDate == null || !expirationDate.isBefore(harvestDate);
    }
}
