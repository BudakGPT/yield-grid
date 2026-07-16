package budakgpt.yieldgridbackend.modules.cart.exception;

public class EmptyCartCheckoutException extends CartException {
    public EmptyCartCheckoutException() {
        super("Cannot checkout an empty cart");
    }
}
