package budakgpt.yieldgridbackend.modules.product.exception;

public class InvalidProductStatusTransitionException extends ProductException {
    public InvalidProductStatusTransitionException(String message) {
        super(message);
    }
}
