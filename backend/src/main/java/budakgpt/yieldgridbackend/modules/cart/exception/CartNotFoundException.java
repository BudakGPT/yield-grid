package budakgpt.yieldgridbackend.modules.cart.exception;

public class CartNotFoundException extends CartException {
    public CartNotFoundException() {
        super("Cart was not found");
    }
}
