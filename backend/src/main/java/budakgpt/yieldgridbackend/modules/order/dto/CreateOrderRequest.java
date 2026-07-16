package budakgpt.yieldgridbackend.modules.order.dto;

import java.util.List;

import budakgpt.yieldgridbackend.modules.order.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateOrderRequest(
        @NotEmpty(message = "Order must contain at least one item")
        List<@Valid OrderItemRequest> items,

        @NotNull(message = "Payment method is required")
        PaymentMethod paymentMethod,

        @NotBlank(message = "Recipient name is required")
        @Size(max = 120, message = "Recipient name must not exceed 120 characters")
        String recipientName,

        @NotBlank(message = "Recipient phone is required")
        @Size(max = 40, message = "Recipient phone must not exceed 40 characters")
        String recipientPhone,

        @Size(max = 120)
        String province,

        @Size(max = 120)
        String city,

        @Size(max = 120)
        String district,

        @Size(max = 20)
        String postalCode,

        @NotBlank(message = "Full address is required")
        @Size(max = 1000, message = "Full address must not exceed 1000 characters")
        String fullAddress,

        @Size(max = 1000)
        String notes
) {
}
