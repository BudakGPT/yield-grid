package budakgpt.yieldgridbackend.modules.product.exception;

public class UnauthorizedProductAccessException extends ProductException {
    public UnauthorizedProductAccessException() {
        super("You are not allowed to manage this product");
    }
}
