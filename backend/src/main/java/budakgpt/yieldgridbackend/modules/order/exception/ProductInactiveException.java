package budakgpt.yieldgridbackend.modules.order.exception;

public class ProductInactiveException extends OrderException {
    public ProductInactiveException(String productName) {
        super("Product '%s' is not available for ordering".formatted(productName));
    }
}
