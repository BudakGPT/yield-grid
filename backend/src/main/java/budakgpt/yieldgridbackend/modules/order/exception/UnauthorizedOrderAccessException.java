package budakgpt.yieldgridbackend.modules.order.exception;

public class UnauthorizedOrderAccessException extends OrderException {
    public UnauthorizedOrderAccessException() {
        super("You are not allowed to access this order");
    }
}
