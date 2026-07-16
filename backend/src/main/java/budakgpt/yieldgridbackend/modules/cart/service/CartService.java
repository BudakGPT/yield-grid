package budakgpt.yieldgridbackend.modules.cart.service;

import java.util.UUID;

import budakgpt.yieldgridbackend.modules.cart.dto.AddToCartRequest;
import budakgpt.yieldgridbackend.modules.cart.dto.CartResponse;
import budakgpt.yieldgridbackend.modules.cart.dto.CheckoutRequest;
import budakgpt.yieldgridbackend.modules.cart.dto.UpdateCartItemRequest;
import budakgpt.yieldgridbackend.modules.order.dto.OrderResponse;

public interface CartService {
    CartResponse getMyCart();

    CartResponse addItem(AddToCartRequest request);

    CartResponse updateItem(UUID itemId, UpdateCartItemRequest request);

    void removeItem(UUID itemId);

    void clearCart();

    OrderResponse checkout(CheckoutRequest request);
}
