package budakgpt.yieldgridbackend.modules.cart.exception;

import java.util.UUID;

public class CartItemNotFoundException extends CartException {
    public CartItemNotFoundException(UUID id) {
        super("Cart item with id '%s' was not found".formatted(id));
    }
}
