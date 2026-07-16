package budakgpt.yieldgridbackend.modules.order.exception;

public class InsufficientStockException extends OrderException {
    public InsufficientStockException(String productName) {
        super("Insufficient stock for product '%s'".formatted(productName));
    }
}
