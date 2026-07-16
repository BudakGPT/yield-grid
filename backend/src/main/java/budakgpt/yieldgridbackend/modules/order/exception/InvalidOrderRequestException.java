package budakgpt.yieldgridbackend.modules.order.exception;

public class InvalidOrderRequestException extends OrderException {
    public InvalidOrderRequestException(String message) {
        super(message);
    }
}
