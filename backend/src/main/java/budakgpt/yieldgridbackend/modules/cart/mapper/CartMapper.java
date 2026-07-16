package budakgpt.yieldgridbackend.modules.cart.mapper;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Component;

import budakgpt.yieldgridbackend.modules.cart.dto.CartItemResponse;
import budakgpt.yieldgridbackend.modules.cart.dto.CartResponse;
import budakgpt.yieldgridbackend.modules.cart.entity.Cart;
import budakgpt.yieldgridbackend.modules.cart.entity.CartItem;
import budakgpt.yieldgridbackend.modules.product.entity.ProductImage;

@Component
public class CartMapper {

    public CartResponse toResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream()
                .map(this::toItemResponse)
                .toList();
        int totalItems = cart.getItems().stream()
                .mapToInt(CartItem::getQuantity)
                .sum();

        return new CartResponse(
                cart.getId(),
                cart.getBuyer().getId(),
                items,
                cart.getSubtotal(),
                totalItems
        );
    }

    private CartItemResponse toItemResponse(CartItem item) {
        String primaryImage = item.getProduct().getImages().stream()
                .min(Comparator.comparing(ProductImage::getDisplayOrder))
                .map(ProductImage::getImageUrl)
                .orElse(null);

        return new CartItemResponse(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getName(),
                primaryImage,
                item.getUnitPrice(),
                item.getQuantity(),
                item.getSubtotal(),
                item.getProduct().getQualityGrade(),
                item.getProduct().getUnit()
        );
    }
}
