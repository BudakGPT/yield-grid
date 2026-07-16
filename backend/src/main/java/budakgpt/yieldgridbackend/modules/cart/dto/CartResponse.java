package budakgpt.yieldgridbackend.modules.cart.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CartResponse(
        UUID id,
        UUID buyerId,
        List<CartItemResponse> items,
        BigDecimal subtotal,
        Integer totalItems
) {
}
