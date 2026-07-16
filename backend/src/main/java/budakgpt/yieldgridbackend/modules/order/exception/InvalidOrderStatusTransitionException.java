package budakgpt.yieldgridbackend.modules.order.exception;

public class InvalidOrderStatusTransitionException extends OrderException {
    public InvalidOrderStatusTransitionException(String message) {
        super(message);
    }
}
